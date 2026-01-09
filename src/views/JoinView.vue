<template>
  <div class="join-container">
    <div class="join-card">
      <h2 class="join-title">회원가입</h2>
      <form @submit.prevent="handleSubmit" class="join-form">
        <div class="form-group">
          <label for="email">이메일 *</label>
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
          <label for="name">이름 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="홍길동"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호 *</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="비밀번호를 입력하세요"
            class="form-input"
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인 *</label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            required
            placeholder="비밀번호를 다시 입력하세요"
            class="form-input"
            :class="{ 'error': passwordConfirm && !isPasswordMatch }"
            @input="validatePasswordMatch"
          />
          <div v-if="passwordConfirm && !isPasswordMatch" class="password-error">
            비밀번호가 일치하지 않습니다.
          </div>
        </div>

        <div class="form-group">
          <label for="division">본부/센터 *</label>
          <select 
            id="division" 
            v-model="form.division" 
            @change="form.team = ''"
            required 
            class="form-input"
          >
            <option value="">본부/센터 선택</option>
            <option value="ITO센터">ITO센터</option>
            <option value="신사업추진실">신사업추진실</option>
            <option value="솔루션사업본부">솔루션사업본부</option>
            <option value="플랫폼사업본부">플랫폼사업본부</option>
            <option value="서비스사업본부">서비스사업본부</option>
            <option value="시스템사업본부">시스템사업본부</option>
          </select>
        </div>

        <div class="form-group">
          <label for="team">팀 *</label>
          <select
            id="team"
            v-model="form.team"
            :disabled="!form.division"
            required
            class="form-input"
          >
            <option value="">팀 선택</option>
            <option
              v-for="team in getTeamsForDivision(form.division)"
              :key="team"
              :value="team"
            >
              {{ team }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="position">직급 *</label>
          <select id="position" v-model="form.position" required class="form-input">
            <option value="">선택하세요</option>
            <option value="주임">주임</option>
            <option value="대리">대리</option>
            <option value="과장">과장</option>
            <option value="차장">차장</option>
            <option value="부장">부장</option>
            <option value="이사">이사</option>
          </select>
        </div>

        <div class="form-group">
          <label for="joinDate">입사일 *</label>
          <input
            id="joinDate"
            v-model="form.joinDate"
            type="date"
            required
            class="form-input"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          {{ isLoading ? '가입 중...' : '회원가입' }}
        </button>

        <div class="login-link">
          이미 계정이 있으신가요?
          <router-link to="/login">로그인</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { join, type JoinRequest } from '@/api/user'

const router = useRouter()

// 본부/센터별 팀 구조
const departmentStructure: Record<string, string[]> = {
  'ITO센터': ['ITO지원팀'],
  '신사업추진실': ['크레이이티브팀'],
  '솔루션사업본부': ['솔루션1팀', '솔루션2팀'],
  '플랫폼사업본부': ['플랫폼1팀', '플랫폼2팀'],
  '서비스사업본부': ['서비스1팀', '서비스2팀'],
  '시스템사업본부': ['시스템1팀', '시스템2팀']
}

// 본부/센터에 따른 팀 목록 반환
const getTeamsForDivision = (division: string): string[] => {
  return departmentStructure[division] || []
}

const form = ref<JoinRequest>({
  email: '',
  name: '',
  password: '',
  division: '',
  team: '',
  position: '',
  joinDate: ''
})

const passwordConfirm = ref('')
const isPasswordMatch = ref(true)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 비밀번호 일치 여부 확인
const validatePasswordMatch = () => {
  if (passwordConfirm.value) {
    isPasswordMatch.value = form.value.password === passwordConfirm.value
  } else {
    isPasswordMatch.value = true
  }
}

// 비밀번호가 변경될 때도 확인
watch(() => form.value.password, () => {
  if (passwordConfirm.value) {
    validatePasswordMatch()
  }
})

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // 비밀번호 확인 검증
  if (form.value.password !== passwordConfirm.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  
  isLoading.value = true

  try {
    const response = await join(form.value)
    
    if (response.resultCode === '0') {
      successMessage.value = '회원가입이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = '회원가입에 실패했습니다.'
    }
  } catch (error: any) {
    console.error('회원가입 오류:', error)
    if (error.response?.data?.resultMsg?.errorMessage) {
      errorMessage.value = error.response.data.resultMsg.errorMessage
    } else {
      errorMessage.value = '회원가입 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.join-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.join-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.join-form {
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

.form-input.error {
  border-color: #c33;
}

.password-error {
  color: #c33;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
}

.success-message {
  padding: 12px;
  background-color: #efe;
  color: #3c3;
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #1226aa;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .join-card {
    padding: 30px 20px;
  }
}
</style>

