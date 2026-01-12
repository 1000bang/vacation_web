<template>
  <div class="dashboard-view">
    <div class="dashboard-container">
      <h1>{{ user ? `${user.name}님 반갑습니다 !` : '대시보드' }}</h1>
      <hr class="divider"/>
      <!-- 연차 정보 카드 -->
      <div v-if="vacationInfo" class="vacation-info-card">
        <div class="vacation-info-header">
          <h3>연차 정보</h3>
        </div>
        <div class="vacation-info-grid">
          <div class="vacation-info-item">
            <span class="vacation-label">금년 발생 연차</span>
            <span class="vacation-value">{{ vacationInfo.annualVacationDays }}일</span>
          </div>
          <div class="vacation-info-item">
            <span class="vacation-label">사용 연차</span>
            <span class="vacation-value">{{ vacationInfo.usedVacationDays }}일</span>
          </div>
          <div class="vacation-info-item">
            <span class="vacation-label">예약중 연차</span>
            <span class="vacation-value">{{ vacationInfo.reservedVacationDays }}일</span>
          </div>
          <div class="vacation-info-item highlight">
            <span class="vacation-label">남은 연차</span>
            <span class="vacation-value highlight">{{ vacationInfo.remainingVacationDays }}일</span>
          </div>
        </div>
      </div>
      
      <div class="button-grid">
        <button @click="goToMyApplications" class="dashboard-btn">
          <span class="btn-icon">📋</span>
          <span class="btn-text">내 신청 목록</span>
        </button>
        
        <button @click="goToVacationApplication" class="dashboard-btn">
          <span class="btn-icon">🏖️</span>
          <span class="btn-text">휴가(결무) 신청</span>
        </button>
        
        <button @click="goToExpenseApplication" class="dashboard-btn">
          <span class="btn-icon">💰</span>
          <span class="btn-text">개인 비용 신청</span>
        </button>
        
        <button @click="goToRentalApplication" class="dashboard-btn">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">월세 지원 신청</span>
        </button>
        
        <button 
          v-if="canManageUsers" 
          @click="goToUserManagement" 
          class="dashboard-btn admin-btn"
        >
          <span class="btn-icon">🧑🏻‍💻</span>
          <span class="btn-text">사용자 관리</span>
        </button>
      </div>

      <!-- 휴가 캘린더 -->
       <hr class="divider"/>
      <VacationCalendar />
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserVacationInfo, type UserVacationInfoResponse } from '@/api/user'
import VacationCalendar from '@/components/VacationCalendar.vue'

const router = useRouter()

interface User {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  authVal: string
}

const user = ref<User | null>(null)
const vacationInfo = ref<UserVacationInfoResponse | null>(null)

const canManageUsers = computed(() => {
  // ma(master), bb(bonbujang), tj(teamjang)만 사용자 관리 가능
  if (!user.value) return false
  const authVal = user.value.authVal
  return authVal === 'ma' || authVal === 'bb' || authVal === 'tj'
})

const loadVacationInfo = async () => {
  try {
    const response = await getUserVacationInfo()
    vacationInfo.value = response.resultMsg
  } catch (error) {
    console.error('연차 정보 조회 실패:', error)
  }
}

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
      await loadVacationInfo()
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
})

const goToMyApplications = () => {
  router.push('/my-applications')
}

const goToVacationApplication = () => {
  router.push('/vacation-application')
}

const goToExpenseApplication = () => {
  router.push('/expense-application')
}

const goToRentalApplication = () => {
  router.push('/rental-application')
}

const goToUserManagement = () => {
  // TODO: 사용자 관리 페이지로 이동
  router.push('/user-management')
}
</script>

<style scoped>
.divider {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 2.5rem 0;
  padding: 0;
}
.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  padding-top: 3rem;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-container h1 {
  text-align: left;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  margin-top: 2rem;
  padding-left: 30px;
}

.vacation-info-card {
  max-width: 1180px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  padding-left: 30px;
}

.vacation-info-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #1226aa;
}

.vacation-info-header h3 {
  margin: 0;
  color: #1226aa;
  font-size: 1.25rem;
  font-weight: 600;
}

.vacation-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.vacation-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.vacation-info-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #1226aa;
}

.vacation-info-item.highlight {
  background: rgba(23, 204, 255, 0.1);
  border-color: #17ccff;
}

.vacation-info-item.highlight .vacation-label {
  color: #1226aa;
}

.vacation-info-item.highlight .vacation-value {
  color: #1226aa;
  text-align: right;
}

.vacation-label {
  font-size: 0.85rem;
  color: #1226aa;
  font-weight: 500;
}

.vacation-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1226aa;
  text-align: right;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.dashboard-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 140px;
}

.dashboard-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #17ccff;
}

.dashboard-btn:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 3rem;
  line-height: 1;
}

.btn-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 1rem;
    padding-top: 2rem;
  }

  .dashboard-container h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-left: 0;
    text-align: center;
  }

  .vacation-info-card {
    padding: 1rem;
    padding-left: 1rem;
    margin-bottom: 1.5rem;
  }

  .vacation-info-header h3 {
    font-size: 1.1rem;
  }

  .vacation-info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .vacation-info-item {
    padding: 0.6rem;
  }

  .vacation-label {
    font-size: 0.8rem;
  }

  .vacation-value {
    font-size: 1.3rem;
  }

  .button-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0;
  }

  .dashboard-btn {
    padding: 2rem 1.5rem;
    min-height: 120px;
  }

  .btn-icon {
    font-size: 2.5rem;
  }

  .btn-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-view {
    padding: 0.75rem;
    padding-top: 1.5rem;
  }

  .dashboard-container h1 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding-left: 0;
  }

  .vacation-info-card {
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .vacation-info-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .vacation-info-header h3 {
    font-size: 1rem;
  }

  .vacation-info-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .vacation-info-item {
    padding: 0.75rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .vacation-label {
    font-size: 0.85rem;
  }

  .vacation-value {
    font-size: 1.2rem;
    text-align: right;
  }

  .button-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0;
  }

  .dashboard-btn {
    padding: 1.5rem 1rem;
    min-height: 100px;
    border-radius: 10px;
  }

  .btn-icon {
    font-size: 2.2rem;
  }

  .btn-text {
    font-size: 0.95rem;
  }
}

@media (max-width: 360px) {
  .dashboard-view {
    padding: 0.5rem;
    padding-top: 1rem;
  }

  .dashboard-container h1 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .vacation-info-card {
    padding: 0.6rem;
  }

  .vacation-info-item {
    padding: 0.6rem;
  }

  .vacation-label {
    font-size: 0.8rem;
  }

  .vacation-value {
    font-size: 1.1rem;
  }

  .dashboard-btn {
    padding: 1.25rem 0.75rem;
    min-height: 90px;
  }

  .btn-icon {
    font-size: 2rem;
  }

  .btn-text {
    font-size: 0.9rem;
  }
}
</style>

