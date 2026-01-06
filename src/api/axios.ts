import axios from 'axios'

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

// 요청 인터셉터 (요청 전에 실행)
apiClient.interceptors.request.use(
  (config) => {
    // 여기에 토큰 추가 등의 로직을 넣을 수 있습니다
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
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
  (error) => {
    // 에러 처리 로직
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default apiClient

