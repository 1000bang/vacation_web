<template>
  <div class="document-view">
    <div class="header-section">
      <h1>문서 생성</h1>
    </div>

    <!-- 문서 타입 선택 라디오 버튼 -->
    <div class="document-type-selection">
      <h2>문서 타입 선택</h2>
      <div class="radio-group">
        <label v-for="docType in documentTypes" :key="docType.value" class="radio-label">
          <input
            type="radio"
            :value="docType.value"
            v-model="selectedDocumentType"
            :disabled="docType.disabled"
            class="radio-input"
          />
          <span :class="{ disabled: docType.disabled }">{{ docType.label }}</span>
        </label>
      </div>
    </div>

    <!-- 휴가 결무 신청서 폼 -->
    <div v-if="selectedDocumentType === 'vacation'" class="vacation-form-wrapper">
      <div class="form-container">
        <div class="form-header">
          <h2>휴가 결무 신청서</h2>
          <div v-if="vacationInfo" class="vacation-info-header">
            <span class="info-text">금년 연차: {{ vacationInfo.annualVacationDays }}일</span>
            <span class="info-text">직전 잔여 연차: {{ vacationInfo.remainingVacationDays }}일</span>
          </div>
        </div>
        <form class="form">
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
        </div>

        <div class="form-group">
          <label>사유</label>
          <textarea v-model="vacationForm.reason" rows="3"></textarea>
        </div>

          <button type="button" @click="submitVacationForm" class="submit-button">
            문서 생성
          </button>
        </form>
      </div>
    </div>

    <!-- 다른 문서 타입들도 여기에 추가 가능 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getUserVacationInfo, type UserVacationInfoResponse } from '@/api/user'

const selectedDocumentType = ref('vacation')

const documentTypes = [
  { value: 'vacation', label: '휴가 결무 신청서', disabled: false },
  { value: 'rental', label: '월세 지원 청구서', disabled: true },
  { value: 'expense', label: '업무관련 개인비용 청구서', disabled: true }
]

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
  reason: ''
})

const vacationInfo = ref<UserVacationInfoResponse | null>(null)

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
  // 컴포넌트 마운트 시 신청일자를 오늘로 설정
  vacationForm.value.requestDate = getTodayDate()
  // 연차 정보 로드
  await loadVacationInfo()
})

const loadVacationInfo = async () => {
  try {
    const response = await getUserVacationInfo()
    vacationInfo.value = response.resultMsg
  } catch (error) {
    console.error('연차 정보 조회 실패:', error)
    // 로그인하지 않은 경우 에러가 발생할 수 있으므로 조용히 처리
  }
}

const submitVacationForm = () => {
  console.log('휴가 신청서 제출:', vacationForm.value)
  // 여기에 API 호출 로직 추가
}
</script>

<style scoped>
.document-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.header-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  text-align: left;
}

.header-section h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
  padding-left: 30px;
}

.document-type-selection {
  max-width: 800px;
  margin: 0 auto 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-type-selection h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.radio-label:hover {
  background-color: #f5f5f5;
}

.radio-label .disabled {
  color: #999;
  cursor: not-allowed;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
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

.department-select-group {
  display: flex;
  gap: 1rem;
}

.department-select {
  flex: 1;
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

.submit-button:hover {
  background-color: #0f1f88;
}

@media (max-width: 768px) {
  .document-view {
    padding: 1rem;
  }

  .document-type-selection,
  .form-container {
    padding: 1.5rem;
  }


  .department-select-group {
    flex-direction: column;
  }
}
</style>

