<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">로그인</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="username@knowledgepoint.co.kr"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="비밀번호를 입력하세요"
            class="form-input"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>

        <div class="join-link">
          계정이 없으신가요?
          <router-link to="/join">회원가입</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login, type LoginRequest } from '@/api/user'

const router = useRouter()
const route = useRoute()

const form = ref<LoginRequest>({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

// 쿼리 파라미터에서 메시지 확인
onMounted(() => {
  const message = route.query.message as string
  if (message) {
    errorMessage.value = message
    // URL에서 쿼리 파라미터 제거 (깔끔한 URL 유지)
    router.replace({ path: '/login', query: {} })
  }
})

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await login(form.value)
    
    if (response.resultCode === '0' && response.resultMsg) {
      // Access Token과 Refresh Token 저장
      localStorage.setItem('accessToken', response.resultMsg.accessToken)
      localStorage.setItem('refreshToken', response.resultMsg.refreshToken)
      localStorage.setItem('user', JSON.stringify({
        userId: response.resultMsg.userId,
        email: response.resultMsg.email,
        name: response.resultMsg.name,
        division: response.resultMsg.division,
        team: response.resultMsg.team,
        position: response.resultMsg.position,
        status: response.resultMsg.status,
        firstLogin: response.resultMsg.firstLogin,
        authVal: response.resultMsg.authVal
      }))
      
      // 사용자 정보 업데이트 이벤트 발생
      window.dispatchEvent(new Event('user-updated'))
      
      // 최초 로그인인 경우 나의 정보 페이지로 이동, 아니면 대시보드로 이동
      if (response.resultMsg.firstLogin) {
        router.push('/my-info')
      } else {
        router.push('/dashboard')
      }
    } else {
      errorMessage.value = '로그인에 실패했습니다.'
    }
  } catch (error: any) {
    console.error('로그인 오류:', error)
    console.error('에러 응답 데이터:', error.response?.data)
    
    // 에러 응답 구조 확인 및 처리
    // 백엔드 응답: { resultCode: "904", resultMsg: { errorCode: "904", errorMessage: "..." } }
    if (error.response?.data) {
      const responseData = error.response.data
      console.log('응답 데이터 구조:', JSON.stringify(responseData, null, 2))
      
      // resultMsg가 객체이고 errorMessage 속성이 있는 경우
      if (responseData.resultMsg && typeof responseData.resultMsg === 'object' && 'errorMessage' in responseData.resultMsg) {
        errorMessage.value = responseData.resultMsg.errorMessage
        console.log('에러 메시지 설정:', responseData.resultMsg.errorMessage)
      } 
      // resultMsg가 문자열인 경우 (다른 형태의 에러 응답)
      else if (typeof responseData.resultMsg === 'string') {
        errorMessage.value = responseData.resultMsg
        console.log('에러 메시지 설정 (문자열):', responseData.resultMsg)
      }
      // resultCode가 있고 0이 아닌 경우
      else if (responseData.resultCode && responseData.resultCode !== '0') {
        errorMessage.value = '로그인에 실패했습니다.'
        console.log('기본 에러 메시지 설정')
      } else {
        errorMessage.value = '로그인 중 오류가 발생했습니다.'
        console.log('알 수 없는 에러')
      }
    } else if (error.message) {
      errorMessage.value = error.message
      console.log('에러 메시지 (error.message):', error.message)
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.'
      console.log('에러 정보 없음')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #17ccff;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
}

.submit-button {
  padding: 14px;
  background-color: #1226aa;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover:not(:disabled) {
  background-color: #0f1f88;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.join-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.join-link a {
  color: #1226aa;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.join-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-card {
    padding: 30px 20px;
  }
}
</style>

