<template>
  <div class="application-success-view">
    <div class="success-container">
      <div class="success-content">
        <div class="check-icon-container">
          <svg 
            class="check-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" class="check-circle"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-path"/>
          </svg>
        </div>
        <h1 class="success-title">{{ successMessage }}</h1>
        
        <div v-if="summary" class="summary-section">
          <h3 class="summary-title">신청 내용</h3>
          <div class="summary-content">
            <div v-for="(value, key) in summary" :key="key" class="summary-item">
              <span class="summary-label">{{ key }}:</span>
              <span class="summary-value">{{ value }}</span>
            </div>
          </div>
        </div>
        
        <div class="button-group">
          <button @click="goToDashboard" class="btn btn-dashboard">
            대시보드로 돌아가기
          </button>
          <button @click="downloadDocument" class="btn btn-download" :disabled="isDownloading">
            {{ isDownloading ? '다운로드 중...' : '문서 출력하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { downloadVacationDocument, getVacationHistory, type VacationHistory } from '@/api/vacation'
import { downloadExpenseClaim, downloadRentalSupportApplication, getExpenseClaim, getRentalSupportApplication, type ExpenseClaimDetail, type RentalSupport } from '@/api/user'

const router = useRouter()
const route = useRoute()

const applicationType = ref<string>('')
const applicationSeq = ref<number | null>(null)
const isDownloading = ref(false)
const isLoading = ref(false)
const summary = ref<Record<string, string>>({})

const successMessage = computed(() => {
  switch (applicationType.value) {
    case 'vacation':
      return '휴가(결무) 신청에 성공하였습니다.'
    case 'expense':
      return '개인 비용 신청에 성공하였습니다.'
    case 'rental':
      return '월세 지원 신청에 성공하였습니다.'
    default:
      return '신청에 성공하였습니다.'
  }
})

// 휴가 구분 한글 변환
const getVacationTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'YEONCHA': '연차',
    'GYEONGJO': '경조',
    'CHULSAN': '출산',
    'GYEOLGEUN': '결근',
    'BYEONGGA': '병가',
    'GITA': '기타',
    'YEBIGUN': '예비군',
    'AM_HALF': '오전 반차',
    'PM_HALF': '오후 반차'
  }
  return typeMap[type] || type
}

// 날짜 포맷팅
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 금액 포맷팅
const formatNumber = (num: number): string => {
  if (!num) return '0'
  return num.toLocaleString('ko-KR')
}

// 청구 월 포맷팅 (YYYYMM -> YYYY.MM)
const formatBillingYyMonth = (yyMonth: number): string => {
  if (!yyMonth) return ''
  const year = Math.floor(yyMonth / 100)
  const month = yyMonth % 100
  return `${year}.${String(month).padStart(2, '0')}`
}

onMounted(async () => {
  // 쿼리 파라미터에서 신청 타입과 seq 가져오기
  applicationType.value = (route.query.type as string) || ''
  const seqParam = route.query.seq
  if (seqParam) {
    applicationSeq.value = typeof seqParam === 'string' ? parseInt(seqParam, 10) : Number(seqParam)
  }
  
  // 신청 내용 조회
  await loadApplicationSummary()
})

const loadApplicationSummary = async () => {
  if (!applicationSeq.value || !applicationType.value) return
  
  isLoading.value = true
  try {
    if (applicationType.value === 'vacation') {
      const response = await getVacationHistory(applicationSeq.value)
      const history = response.resultMsg
      if (history) {
        summary.value = {
          '신청일자': formatDate(history.requestDate),
          '시작일': formatDate(history.startDate),
          '종료일': formatDate(history.endDate),
          '휴가 구분': getVacationTypeName(history.type),
          '신청 연차일수': `${history.period}일`,
          '사유': history.reason || '-'
        }
      }
    } else if (applicationType.value === 'expense') {
      const response = await getExpenseClaim(applicationSeq.value)
      const detail = response.resultMsg
      if (detail) {
        summary.value = {
          '신청일자': formatDate(detail.expenseClaim.requestDate),
          '청구 월': formatBillingYyMonth(detail.expenseClaim.billingYyMonth),
          '항목 수': `${detail.expenseSubList.length}개`,
          '총 금액': `${formatNumber(detail.expenseClaim.totalAmount || 0)}원`
        }
      }
    } else if (applicationType.value === 'rental') {
      const response = await getRentalSupportApplication(applicationSeq.value)
      const rental = response.resultMsg
      if (rental) {
        summary.value = {
          '신청일자': formatDate(rental.requestDate || ''),
          '청구 월': formatBillingYyMonth(rental.billingYyMonth || 0),
          '청구 기간': `${formatDate(rental.billingPeriodStartDate || '')} ~ ${formatDate(rental.billingPeriodEndDate || '')}`,
          '납입 금액': `${formatNumber(rental.paymentAmount || 0)}원`,
          '납입일': formatDate(rental.paymentDate || '')
        }
      }
    }
  } catch (error) {
    console.error('신청 내용 조회 실패:', error)
  } finally {
    isLoading.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const downloadDocument = async () => {
  if (!applicationSeq.value) {
    alert('문서 정보를 찾을 수 없습니다.')
    return
  }

  isDownloading.value = true
  try {
    if (applicationType.value === 'vacation') {
      const blob = await downloadVacationDocument(applicationSeq.value)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `휴가신청서_${applicationSeq.value}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else if (applicationType.value === 'expense') {
      const blob = await downloadExpenseClaim(applicationSeq.value)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `개인비용신청서_${applicationSeq.value}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else if (applicationType.value === 'rental') {
      const blob = await downloadRentalSupportApplication(applicationSeq.value)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `월세지원신청서_${applicationSeq.value}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else {
      alert('알 수 없는 신청 타입입니다.')
    }
  } catch (error: any) {
    console.error('문서 다운로드 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || error.message || '문서 다운로드에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.application-success-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  text-align: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.check-icon-container {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 100%;
  height: 100%;
  color: #17ccff;
  animation: checkmarkAnimation 0.6s ease-in-out;
}

.check-circle {
  stroke-dasharray: 62.83;
  stroke-dashoffset: 62.83;
  animation: drawCircle 0.6s ease-in-out forwards;
}

.check-path {
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  animation: drawCheck 0.4s ease-in-out 0.6s forwards;
}

@keyframes checkmarkAnimation {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes drawCircle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}

.success-title {
  font-size: 2rem;
  color: #1226aa;
  font-weight: 700;
  margin: 0;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.summary-section {
  width: 100%;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.summary-title {
  font-size: 1.25rem;
  color: #1226aa;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.summary-value {
  color: #1226aa;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: right;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.button-group {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 180px;
}

.btn-dashboard {
  background: #1226aa;
  color: white;
}

.btn-dashboard:hover:not(:disabled) {
  background: #0f1f88;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(18, 38, 170, 0.3);
}

.btn-download {
  background: #17ccff;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background: #14b3e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 204, 255, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .success-container {
    padding: 2rem 1.5rem;
  }

  .check-icon-container {
    width: 100px;
    height: 100px;
  }

  .success-title {
    font-size: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: auto;
  }
}
</style>

