import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// axios 인스턴스 생성
// API 기본 URL과 공통 설정을 여기에 정의합니다
// 프로덕션 환경에서는 Nginx 프록시를 통해 /api 경로로 자동 설정
const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 프로덕션 환경: Nginx 프록시를 통해 /api 경로 사용
  // Nginx가 /api 요청을 localhost:8080으로 프록시합니다
  if (import.meta.env.PROD) {
    return '/api'
  }
  
  // 개발 환경: localhost 사용
  return 'http://localhost:8080'
}

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 토큰 갱신 중인지 추적하는 플래그
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// 큐에 있는 요청들을 처리
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// 요청 인터셉터 (요청 전에 실행)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 Authorization 헤더에 추가
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 (응답 후에 실행)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 에러이고, refresh endpoint가 아니고, 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && 
        !originalRequest.url?.includes('/user/refresh') && 
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // Refresh Token이 없으면 로그인 페이지로 이동
        processQueue(error, null)
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Refresh Token으로 새로운 Access Token 발급
        const response = await axios.post(`${getApiBaseURL()}/user/refresh`, {
          refreshToken: refreshToken
        })

        const newAccessToken = response.data.resultMsg?.accessToken
        
        if (newAccessToken) {
          // 새로운 Access Token 저장
          localStorage.setItem('accessToken', newAccessToken)
          
          // 원래 요청에 새로운 토큰 설정
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          // 큐에 있는 요청들 처리
          processQueue(null, newAccessToken)
          isRefreshing = false
          
          // 원래 요청 재시도
          return apiClient(originalRequest)
        } else {
          throw new Error('Access Token을 받을 수 없습니다')
        }
      } catch (refreshError) {
        // Refresh Token도 만료되었거나 유효하지 않은 경우
        processQueue(refreshError as AxiosError, null)
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // 401이 아니거나 다른 에러인 경우
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default apiClient

