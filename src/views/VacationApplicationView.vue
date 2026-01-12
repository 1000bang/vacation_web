<template>
  <div class="vacation-application-view">
    <div class="header-section">
      <div class="header-title-wrapper">
        <h1>{{ isEditMode ? '휴가(결무) 수정' : '휴가(결무) 신청' }}</h1>
        <button v-if="isEditMode" @click="goBack" class="btn-back">뒤로가기</button>
      </div>
    </div>

    <div class="vacation-form-wrapper">
      <div class="form-container">
        <div class="form-header">
          <h2>휴가 결무 신청서</h2>
          <!-- 신청 모드일 때만 현재 연차 정보 표시 -->
          <div v-if="!isEditMode && vacationInfo" class="vacation-info-header">
            <span class="info-text">금년 연차: {{ vacationInfo.annualVacationDays }}일</span>
            <span class="info-text">직전 잔여 연차: {{ vacationInfo.remainingVacationDays }}일</span>
          </div>
        </div>
        <form class="form" @submit.prevent="submitVacationApplication">
          <div class="form-group">
            <label>신청일자 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="vacationForm.requestDate" 
              :max="getTodayDate()"
              required 
            />
          </div>

          <div class="form-group">
            <label>시작일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="vacationForm.startDate" 
              :min="minStartDate"
              required 
            />
          </div>

          <div class="form-group">
            <label>종료일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="vacationForm.endDate" 
              :min="minEndDate"
              required 
            />
          </div>

          <div class="form-group">
            <label>휴가 구분 <span class="required">*</span></label>
            <select v-model="vacationForm.vacationType" required>
              <option value="">선택하세요</option>
              <option value="YEONCHA">연차</option>
              <option value="GYEONGJO">경조</option>
              <option value="CHULSAN">출산</option>
              <option value="GYEOLGEUN">결근</option>
              <option value="BYEONGGA">병가</option>
              <option value="GITA">기타</option>
              <option value="YEBIGUN">예비군</option>
              <option value="AM_HALF">오전반차</option>
              <option value="PM_HALF">오후반차</option>
            </select>
          </div>

          <div class="form-group">
            <label>신청연차일수 <span class="required">*</span></label>
            <select
              v-model.number="vacationForm.requestedVacationDays"
              required
            >
              <option value="">선택하세요</option>
              <option v-for="option in vacationDaysOptions" :key="option" :value="option">
                {{ option }}일
              </option>
            </select>
            <small v-if="calculatedVacationDays > 0" class="form-hint">
              시작일과 종료일 기준 자동 계산값: {{ calculatedVacationDays }}일
            </small>
            <!-- 수정 모드: 신청 당시 연차 정보 표시 (읽기 전용) -->
            <div v-if="isEditMode && currentVacation" class="vacation-edit-info">
              <div class="edit-info-row">
                <label class="edit-info-label">총 연차:</label>
                <input
                  type="number"
                  v-model.number="vacationForm.annualVacationDays"
                  step="0.5"
                  min="0"
                  class="edit-info-input"
                  disabled
                />
                <span class="edit-info-unit">일</span>
              </div>
              <div class="edit-info-row">
                <label class="edit-info-label">직전 잔여 연차:</label>
                <input
                  type="number"
                  v-model.number="vacationForm.previousRemainingDays"
                  step="0.5"
                  min="0"
                  class="edit-info-input"
                  disabled
                />
                <span class="edit-info-unit">일</span>
              </div>
              <div class="edit-info-row">
                <label class="edit-info-label">신청 연차 일수:</label>
                <input
                  type="number"
                  v-model.number="vacationForm.requestedVacationDays"
                  step="0.5"
                  min="0"
                  class="edit-info-input"
                  disabled
                />
                <span class="edit-info-unit">일</span>
              </div>
              <div class="edit-info-row">
                <label class="edit-info-label">잔여 연차:</label>
                <input
                  type="number"
                  v-model.number="vacationForm.remainingVacationDays"
                  step="0.5"
                  min="0"
                  class="edit-info-input"
                  disabled
                />
                <span class="edit-info-unit">일</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>사유</label>
            <textarea v-model="vacationForm.reason" rows="3"></textarea>
          </div>

          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? (isEditMode ? '수정 중...' : '신청 중...') : (isEditMode ? '수정하기' : '신청하기') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserVacationInfo, type UserVacationInfoResponse } from '@/api/user'
import { createVacation, updateVacation, getVacationHistory, type VacationRequest, type VacationHistory } from '@/api/vacation'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.seq)
const vacationSeq = computed(() => route.params.seq ? Number(route.params.seq) : null)

// 뒤로가기 함수
const goBack = () => {
  router.push('/my-applications')
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const vacationForm = ref({
  requestDate: getTodayDate(),
  startDate: '',
  endDate: '',
  vacationType: '',
  requestedVacationDays: 0,
  reason: '',
  // 수정 모드용 연차 정보
  annualVacationDays: 0,
  previousRemainingDays: 0,
  remainingVacationDays: 0
})

const vacationInfo = ref<UserVacationInfoResponse | null>(null)
const currentVacation = ref<VacationHistory | null>(null)
const isSubmitting = ref(false)

// 신청일자보다 이전 날짜를 비활성화하기 위한 최소 날짜 계산
const minStartDate = computed(() => {
  return vacationForm.value.requestDate || getTodayDate()
})

const minEndDate = computed(() => {
  return vacationForm.value.startDate || minStartDate.value
})

// 시작일과 종료일이 같은지 확인
const isSameDay = computed(() => {
  if (!vacationForm.value.startDate || !vacationForm.value.endDate) {
    return false
  }
  return vacationForm.value.startDate === vacationForm.value.endDate
})

// 시작일과 종료일 기준 자동 계산된 신청일수
const calculatedVacationDays = computed(() => {
  if (!vacationForm.value.startDate || !vacationForm.value.endDate) {
    return 0
  }
  
  if (isSameDay.value) {
    return 1
  }
  
  const start = new Date(vacationForm.value.startDate)
  const end = new Date(vacationForm.value.endDate)
  
  // 날짜 차이 계산 (밀리초를 일수로 변환)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // 시작일 포함
  
  return diffDays
})

// 신청연차일수 선택 옵션
const vacationDaysOptions = computed(() => {
  const baseDays = calculatedVacationDays.value
  if (baseDays <= 0) {
    return []
  }
  
  // 같은 날이면 1일과 0.5일
  if (isSameDay.value) {
    return [1, 0.5]
  }
  
  // 다른 날이면 계산된 값과 계산된 값 - 0.5
  return [baseDays, baseDays - 0.5]
})

// 시작일과 종료일이 변경될 때 신청연차일수 초기화
watch([() => vacationForm.value.startDate, () => vacationForm.value.endDate], () => {
  if (vacationForm.value.startDate && vacationForm.value.endDate) {
    // 오전반차 또는 오후반차인 경우 0.5로 설정
    if (vacationForm.value.vacationType === 'AM_HALF' || vacationForm.value.vacationType === 'PM_HALF') {
      vacationForm.value.requestedVacationDays = 0.5
    } else {
      // 계산된 값으로 초기화 (사용자가 선택 가능)
      vacationForm.value.requestedVacationDays = calculatedVacationDays.value
    }
  } else {
    vacationForm.value.requestedVacationDays = 0
  }
})

// 휴가 구분과 한글 매핑
const vacationTypeMap: Record<string, string> = {
  'YEONCHA': '개인 사정',
  'GYEONGJO': '경조',
  'CHULSAN': '출산',
  'GYEOLGEUN': '결근',
  'BYEONGGA': '병가',
  'GITA': '기타',
  'YEBIGUN': '예비군',
  'AM_HALF': '오전 반차',
  'PM_HALF': '오후 반차'
}

// 휴가 구분이 변경될 때 사유 자동 입력 및 신청연차일수 설정
watch(() => vacationForm.value.vacationType, (newType) => {
  if (newType && vacationTypeMap[newType]) {
    vacationForm.value.reason = vacationTypeMap[newType]
    
    // 오전반차 또는 오후반차 선택 시 신청연차일수를 0.5로 설정
    if (newType === 'AM_HALF' || newType === 'PM_HALF') {
      vacationForm.value.requestedVacationDays = 0.5
    }
  } else if (!newType) {
    vacationForm.value.reason = ''
  }
})

onMounted(async () => {
  // 연차 정보 로드
  await loadVacationInfo()
  
  // 수정 모드인 경우 기존 데이터 로드
  if (isEditMode.value && vacationSeq.value) {
    await loadVacationData(vacationSeq.value)
  } else {
    // 신청 모드인 경우 신청일자를 오늘로 설정
    vacationForm.value.requestDate = getTodayDate()
  }
})

// 기존 휴가 데이터 로드
const loadVacationData = async (seq: number) => {
  try {
    const response = await getVacationHistory(seq)
    const vacation = response.resultMsg
    
    if (vacation) {
      // 수정 모드에서 표시할 연차 정보 저장
      currentVacation.value = vacation
      
      vacationForm.value.requestDate = vacation.requestDate || getTodayDate()
      vacationForm.value.startDate = vacation.startDate
      vacationForm.value.endDate = vacation.endDate
      vacationForm.value.vacationType = vacation.type
      vacationForm.value.requestedVacationDays = vacation.period
      vacationForm.value.reason = vacation.reason || ''
      // 연차 정보도 폼에 로드
      vacationForm.value.annualVacationDays = vacation.annualVacationDays || 0
      vacationForm.value.previousRemainingDays = vacation.previousRemainingDays || 0
      vacationForm.value.remainingVacationDays = vacation.remainingVacationDays || 0
    }
  } catch (error) {
    console.error('휴가 데이터 조회 실패:', error)
    alert('휴가 데이터를 불러오는데 실패했습니다.')
    router.push('/my-applications')
  }
}

const loadVacationInfo = async () => {
  try {
    const response = await getUserVacationInfo()
    vacationInfo.value = response.resultMsg
  } catch (error) {
    console.error('연차 정보 조회 실패:', error)
  }
}

const submitVacationApplication = async () => {
  if (!vacationForm.value.startDate || !vacationForm.value.endDate || !vacationForm.value.vacationType || !vacationForm.value.requestedVacationDays) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  isSubmitting.value = true
  try {
    const request: VacationRequest = {
      requestDate: vacationForm.value.requestDate,
      startDate: vacationForm.value.startDate,
      endDate: vacationForm.value.endDate,
      vacationType: vacationForm.value.vacationType,
      requestedVacationDays: vacationForm.value.requestedVacationDays,
      reason: vacationForm.value.reason || ''
      // 연차 정보는 disabled 처리되어 수정 불가하므로 백엔드에서 자동 계산하도록 함
    }
    
    if (isEditMode.value && vacationSeq.value) {
      // 수정 모드
      await updateVacation(vacationSeq.value, request)
      alert('수정되었습니다.')
      router.push('/my-applications')
    } else {
      // 신청 모드
      const response = await createVacation(request)
      // 성공 페이지로 리다이렉트 (신청 타입과 seq 전달)
      if (response.resultMsg && response.resultMsg.seq) {
        router.push({
          path: '/application-success',
          query: {
            type: 'vacation',
            seq: response.resultMsg.seq
          }
        })
      } else {
        router.push('/my-applications')
      }
    }
  } catch (error: any) {
    console.error(isEditMode.value ? '휴가 수정 실패:' : '휴가 신청 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || error.message || (isEditMode.value ? '휴가 수정에 실패했습니다.' : '휴가 신청에 실패했습니다.')
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.vacation-application-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.header-section {
  max-width: 800px;
  margin: 0 auto 2rem;
  text-align: left;
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-section h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
  padding-left: 30px;
}

.btn-back {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-back:hover {
  background-color: #5a6268;
}

.vacation-form-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.form-container h2 {
  margin: 0;
  color: #2c3e50;
}

.vacation-info-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
}

.info-text {
  white-space: nowrap;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #17ccff;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.vacation-edit-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #1226aa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(18, 38, 170, 0.1);
  position: relative;
}

.vacation-edit-info::before {
  content: '연차 정보';
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #1226aa;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #1226aa;
}

.edit-info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid rgba(18, 38, 170, 0.1);
  transition: background-color 0.2s;
}

.edit-info-row:hover {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.edit-info-row:last-child {
  border-bottom: none;
}

.edit-info-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  min-width: 130px;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.edit-info-input {
  padding: 0.625rem 0.875rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  text-align: right;
  width: 140px;
  background-color: white;
  transition: all 0.3s;
  font-weight: 600;
  color: #1226aa;
  margin-left: auto;
}

.edit-info-input:disabled {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
  opacity: 0.8;
  border-color: #ccc;
}

.edit-info-input:focus {
  outline: none;
  border-color: #17ccff;
  box-shadow: 0 0 0 4px rgba(23, 204, 255, 0.15);
  background-color: #f0f9ff;
  transform: scale(1.02);
}

.edit-info-input:focus:disabled {
  border-color: #ccc;
  box-shadow: none;
  background-color: #f5f5f5;
  transform: none;
}

.edit-info-input:hover:not(:disabled) {
  border-color: #1226aa;
}

.edit-info-unit {
  color: #1226aa;
  font-size: 0.95rem;
  font-weight: 600;
  min-width: 24px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.submit-button {
  padding: 1rem 2rem;
  background-color: #1226aa;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
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

@media (max-width: 768px) {
  .vacation-application-view {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .vacation-edit-info {
    padding: 1rem;
    margin-top: 1rem;
  }

  .vacation-edit-info::before {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .edit-info-row {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.625rem 0;
  }

  .edit-info-label {
    font-size: 0.85rem;
    min-width: 100px;
    width: 100%;
  }

  .edit-info-input {
    width: 100px;
    padding: 0.5rem 0.625rem;
    font-size: 0.85rem;
    margin-left: auto;
  }

  .edit-info-unit {
    font-size: 0.85rem;
    margin-left: 0.25rem;
  }
}

@media (max-width: 480px) {
  .vacation-edit-info {
    padding: 0.75rem;
    margin-top: 0.75rem;
  }

  .vacation-edit-info::before {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
  }

  .edit-info-row {
    gap: 0.4rem;
    padding: 0.5rem 0;
  }

  .edit-info-label {
    font-size: 0.8rem;
    min-width: 90px;
  }

  .edit-info-input {
    width: 80px;
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
  }

  .edit-info-unit {
    font-size: 0.8rem;
    min-width: 20px;
  }
}
</style>

