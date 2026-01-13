<template>
  <div class="rental-application-view">
    <div class="header-section">
      <div class="header-title-wrapper">
        <h1>{{ isApprovalMode ? '월세 지원 결재' : (isEditMode ? '월세 지원 수정' : '월세 지원 신청') }}</h1>
        <button v-if="isEditMode || isApprovalMode" @click="goBack" class="btn-back">뒤로가기</button>
      </div>
    </div>

    <div class="form-wrapper">
      <div class="form-container">
        <h2>월세 지원 청구서</h2>
        <form class="form" @submit.prevent="submitRentalApplication">
          <div class="form-group">
            <label>신청일자 <span class="required">*</span></label>
            <input type="date" v-model="rentalForm.requestDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label>청구 월 <span class="required">*</span></label>
            <select v-model.number="rentalForm.month" :disabled="isApprovalMode" required class="form-select">
              <option :value="null">월 선택</option>
              <option v-for="month in 12" :key="month" :value="month">
                {{ month }}월
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-with-help">
              월세 총 계약 시작일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_cont_period')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input type="date" v-model="rentalForm.contractStartDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label class="label-with-help">
              월세 총 계약 종료일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_cont_period')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input
              type="date"
              v-model="rentalForm.contractEndDate"
              :disabled="isApprovalMode"
              required
            />
          </div>

          <div class="form-group">
            <label class="label-with-help">
              계약 월세 금액(원) <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_contract_price')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <div class="input-with-unit">
              <input
                type="text"
                v-model="rentalForm.contractMonthlyRent"
                @input="handleNumberInput($event, 'contractMonthlyRent')"
                @keypress="handleKeyPress"
                :disabled="isApprovalMode"
                required
              />
              <div v-if="rentalForm.contractMonthlyRent >= 10000" class="unit-text-below">
                {{ formatKoreanWon(rentalForm.contractMonthlyRent) }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>선불/후불 구분 <span class="required">*</span></label>
            <select v-model="rentalForm.paymentType" :disabled="isApprovalMode" required>
              <option value="">선택하세요</option>
              <option value="PREPAID">선불</option>
              <option value="POSTPAID">후불</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-with-help">
              월세 청구 개시일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_billing_startdate')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input type="date" v-model="rentalForm.billingStartDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label class="label-with-help">
              청구 월세 시작일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_billing_period')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input type="date" v-model="rentalForm.billingPeriodStartDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label class="label-with-help">
              청구 월세 종료일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_billing_period')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input type="date" v-model="rentalForm.billingPeriodEndDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label class="label-with-help">
              월세 납입일 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('rental_payment_date')"
                aria-label="도움말"
              >
                ?
              </button>
            </label>
            <input type="date" v-model="rentalForm.paymentDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label>월세 납입 금액(원) <span class="required">*</span></label>
            <div class="input-with-unit">
              <input
                type="text"
                v-model="rentalForm.paymentAmount"
                @input="handleNumberInput($event, 'paymentAmount')"
                @keypress="handleKeyPress"
                :disabled="isApprovalMode"
                required
              />
              <div v-if="rentalForm.paymentAmount >= 10000" class="unit-text-below">
                {{ formatKoreanWon(rentalForm.paymentAmount) }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>월세 청구 금액(원) <span class="required">*</span></label>
            <div class="input-with-unit">
              <input
                type="text"
                v-model="rentalForm.billingAmount"
                @input="handleNumberInput($event, 'billingAmount')"
                @keypress="handleKeyPress"
                :disabled="isApprovalMode"
                required
              />
              <div v-if="rentalForm.billingAmount >= 10000" class="unit-text-below">
                {{ formatKoreanWon(rentalForm.billingAmount) }}
              </div>
            </div>
          </div>

          <!-- 결재 모드일 때 승인/반려 버튼 표시 -->
          <div v-if="isApprovalMode" class="approval-actions">
            <!-- 최종 승인 상태(C)일 때는 다운로드 버튼 -->
            <button 
              v-if="currentRentalSupport?.approvalStatus === 'C'"
              type="button"
              @click="handleDownloadRentalApplication"
              class="btn btn-download"
              :disabled="isDownloading"
            >
              {{ isDownloading ? '다운로드 중...' : '다운로드' }}
            </button>
            <!-- 그 외 상태일 때는 승인/반려 버튼 -->
            <template v-else>
              <button 
                type="button"
                @click="handleApprove"
                class="btn btn-approve"
                :disabled="isSubmitting || !canApprove"
              >
                {{ isSubmitting ? '처리 중...' : '승인하기' }}
              </button>
              <button 
                type="button"
                @click="handleReject"
                class="btn btn-reject"
                :disabled="isSubmitting || !canReject"
              >
                {{ isSubmitting ? '처리 중...' : '반려하기' }}
              </button>
            </template>
          </div>
          
          <!-- 일반 모드일 때만 제출 버튼 표시 -->
          <div v-else class="form-actions">
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? (isEditMode ? '수정 중...' : '신청 중...') : (isEditMode ? '수정하기' : '신청하기') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 도움말 모달 -->
    <HelpModal
      :is-open="helpModal.isOpen"
      :image-src="helpModal.imageSrc"
      alt-text="월세 지원 신청 도움말"
      @close="closeHelpModal"
    />

    <!-- 반려 모달 -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3>반려 사유 입력</h3>
        <textarea 
          v-model="rejectionReason" 
          placeholder="반려 사유를 입력해주세요."
          rows="5"
          class="reject-reason-input"
        ></textarea>
        <div class="modal-actions">
          <button @click="closeRejectModal" class="btn btn-cancel">취소</button>
          <button @click="confirmReject" class="btn btn-reject" :disabled="!rejectionReason.trim() || isSubmitting">
            반려하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createRentalSupportApplication, updateRentalSupportApplication, getRentalSupportApplication, type RentalSupportRequest, getRentalSupportList } from '@/api/user'
import { 
  approveRentalSupportByTeamLeader, 
  rejectRentalSupportByTeamLeader, 
  approveRentalSupportByDivisionHead, 
  rejectRentalSupportByDivisionHead 
} from '@/api/user'
import HelpModal from '@/components/HelpModal.vue'
import rentalContPeriodImage from '@/assets/image/help/rental_cont_period.png'
import rentalContractPriceImage from '@/assets/image/help/rental_contract_price.png'
import rentalBillingStartDateImage from '@/assets/image/help/rental_billing_startdate.png'
import rentalBillingPeriodImage from '@/assets/image/help/rental_billing_period.png'
import rentalPaymentDateImage from '@/assets/image/help/rental_paymentDate.png'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.seq)
const isApprovalMode = computed(() => route.query.approval === 'true')
const rentalSeq = computed(() => route.params.seq ? Number(route.params.seq) : null)

// 뒤로가기 함수
const goBack = () => {
  if (isApprovalMode.value) {
    router.push('/approval-list')
  } else {
    router.push('/my-applications')
  }
}

// 도움말 모달 상태
const helpModal = reactive<{
  isOpen: boolean
  imageSrc: string
}>({
  isOpen: false,
  imageSrc: ''
})

// 도움말 이미지 맵
const helpImageMap: Record<string, string> = {
  rental_cont_period: rentalContPeriodImage,
  rental_contract_price: rentalContractPriceImage,
  rental_billing_startdate: rentalBillingStartDateImage,
  rental_billing_period: rentalBillingPeriodImage,
  rental_payment_date: rentalPaymentDateImage
}

// 도움말 모달 열기
const showHelpModal = (imageKey: string) => {
  helpModal.imageSrc = helpImageMap[imageKey] || ''
  helpModal.isOpen = true
}

// 도움말 모달 닫기
const closeHelpModal = () => {
  helpModal.isOpen = false
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const rentalForm = reactive({
  requestDate: getTodayDate(),
  month: null as number | null,
  contractStartDate: '',
  contractEndDate: '',
  contractMonthlyRent: 0,
  paymentType: 'POSTPAID' as string, // 후불이 기본값
  billingStartDate: '',
  billingPeriodStartDate: '',
  billingPeriodEndDate: '',
  paymentDate: '',
  paymentAmount: 0,
  billingAmount: 0
})

const isSubmitting = ref(false)
const user = ref<{ authVal: string } | null>(null)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const currentRentalSupport = ref<any>(null)

// 숫자를 한글 만원 단위로 변환
const formatKoreanWon = (amount: number): string => {
  if (!amount || amount < 10000) {
    return ''
  }

  const man = Math.floor(amount / 10000)
  const remainder = amount % 10000
  const koreanNumbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

  let manStr = ''
  if (man === 1) {
    manStr = '만'
  } else if (man < 10) {
    manStr = koreanNumbers[man] + '만'
  } else if (man < 100) {
    const ten = Math.floor(man / 10)
    const one = man % 10
    if (ten === 1) {
      manStr = one > 0 ? '십' + koreanNumbers[one] + '만' : '십만'
    } else {
      manStr = koreanNumbers[ten] + '십' + (one > 0 ? koreanNumbers[one] : '') + '만'
    }
  } else if (man < 1000) {
    const hundred = Math.floor(man / 100)
    const remainder2 = man % 100
    manStr = koreanNumbers[hundred] + '백'
    if (remainder2 > 0) {
      const ten = Math.floor(remainder2 / 10)
      const one = remainder2 % 10
      if (ten > 0) {
        manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
      }
      if (one > 0) {
        manStr += koreanNumbers[one]
      }
    }
    manStr += '만'
  } else {
    const thousand = Math.floor(man / 1000)
    const remainder2 = man % 1000
    manStr = koreanNumbers[thousand] + '천'
    if (remainder2 > 0) {
      const hundred = Math.floor(remainder2 / 100)
      const remainder3 = remainder2 % 100
      if (hundred > 0) {
        manStr += koreanNumbers[hundred] + '백'
      }
      if (remainder3 > 0) {
        const ten = Math.floor(remainder3 / 10)
        const one = remainder3 % 10
        if (ten > 0) {
          manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
        }
        if (one > 0) {
          manStr += koreanNumbers[one]
        }
      }
    }
    manStr += '만'
  }

  let remainderStr = ''
  if (remainder > 0) {
    const cheon = Math.floor(remainder / 1000)
    const remainderAfterCheon = remainder % 1000
    const baek = Math.floor(remainderAfterCheon / 100)
    
    if (cheon > 0) {
      remainderStr = cheon === 1 ? '천' : koreanNumbers[cheon] + '천'
    }
    
    if (baek > 0) {
      remainderStr += baek === 1 ? '백' : koreanNumbers[baek] + '백'
    }
  }

  return manStr + remainderStr + '원'
}

// 숫자만 입력되도록 키 입력 차단
const handleKeyPress = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which || event.keyCode)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

// 숫자만 입력하도록 처리
const handleNumberInput = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  const numValue = value ? Number(value) : 0
  
  if (field === 'contractMonthlyRent') {
    rentalForm.contractMonthlyRent = numValue
    // 계약 월세 금액이 변경되면 납입 금액과 청구 금액 자동 계산
    if (numValue > 0) {
      rentalForm.paymentAmount = numValue
      // 50만원 초과면 최대 25만원, 그 외는 1/2
      if (numValue > 500000) {
        rentalForm.billingAmount = 250000
      } else {
        rentalForm.billingAmount = Math.floor(numValue / 2)
      }
    }
    target.value = value || ''
  } else if (field === 'paymentAmount') {
    rentalForm.paymentAmount = numValue
    target.value = value || ''
  } else if (field === 'billingAmount') {
    rentalForm.billingAmount = numValue
    target.value = value || ''
  }
}

// 계약 월세 금액이 변경될 때 자동 계산
watch(() => rentalForm.contractMonthlyRent, (newValue) => {
  if (newValue && newValue > 0) {
    // 월세 납입 금액 = 계약 월세 금액
    rentalForm.paymentAmount = newValue
    
    // 월세 청구 금액 계산
    // 50만원 초과면 최대 25만원, 그 외는 1/2
    if (newValue > 500000) {
      rentalForm.billingAmount = 250000
    } else {
      rentalForm.billingAmount = Math.floor(newValue / 2)
    }
  }
})

// 월세 지원 청구서: 계약 시작일이 변경될 때 청구 개시일 자동 설정
watch(() => rentalForm.contractStartDate, (newValue) => {
  if (newValue) {
    rentalForm.billingStartDate = newValue
    // 계약 시작일이 변경되면 청구월세 기간도 재계산
    calculateBillingPeriod()
  }
})

// 청구월세 기간 계산 함수
const calculateBillingPeriod = () => {
  if (!rentalForm.contractStartDate || !rentalForm.month || !rentalForm.requestDate) {
    return
  }

  try {
    // 계약 시작일 파싱
    const contractStart = new Date(rentalForm.contractStartDate + 'T00:00:00')
    const contractDay = contractStart.getDate() // 계약 시작일의 일(day) 추출

    // 신청일자의 연도 가져오기 (현재 연도가 아닌 신청일자의 연도 사용)
    const requestDate = new Date(rentalForm.requestDate + 'T00:00:00')
    const requestYear = requestDate.getFullYear()
    const requestMonth = requestDate.getMonth() + 1 // 신청일자의 월 (1-12)
    const billingMonth: number = Number(rentalForm.month) // 청구월 (1-12)

    // 청구월이 신청일자의 월보다 크면 전년도 기준 (예: 신청일자 1월, 청구월 12월 → 전년도 12월)
    let baseYear = requestYear
    if (billingMonth > requestMonth) {
      baseYear = requestYear - 1
    }

    // 청구월세 시작일: (청구월 - 1)월의 계약일자
    // 예: 청구월이 1월이면 전년도 12월의 계약일자
    let startYear = baseYear
    let startMonth: number = billingMonth - 1
    
    if (startMonth === 0) {
      // 청구월이 1월이면 전년도 12월
      startMonth = 12
      startYear = baseYear - 1
    }

    // 청구월세 시작일 생성
    const billingStartDate = new Date(startYear, startMonth - 1, contractDay)
    
    // 청구월세 종료일: 시작일 + 한달 - 1일
    const billingEndDate = new Date(billingStartDate)
    billingEndDate.setMonth(billingEndDate.getMonth() + 1) // 한달 추가
    billingEndDate.setDate(billingEndDate.getDate() - 1) // 하루 전

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    rentalForm.billingPeriodStartDate = formatDate(billingStartDate)
    rentalForm.billingPeriodEndDate = formatDate(billingEndDate)
    
    // 월세 납입일 계산
    if (rentalForm.paymentType === 'POSTPAID') {
      // 후불: 청구월세 종료일 + 1일
      const paymentDate = new Date(billingEndDate)
      paymentDate.setDate(paymentDate.getDate() + 1) // 종료일에서 1일 후
      rentalForm.paymentDate = formatDate(paymentDate)
    } else if (rentalForm.paymentType === 'PREPAID') {
      // 선불: 청구월세 시작일 - 1일
      const paymentDate = new Date(billingStartDate)
      paymentDate.setDate(paymentDate.getDate() - 1) // 시작일에서 1일 전
      rentalForm.paymentDate = formatDate(paymentDate)
    }
  } catch (error) {
    console.error('청구월세 기간 계산 오류:', error)
  }
}

// 청구월이 변경될 때도 청구월세 기간 재계산
watch(() => rentalForm.month, () => {
  if (rentalForm.contractStartDate && rentalForm.month) {
    calculateBillingPeriod()
  }
})

// 청구월세 기간이 변경되면 월세 납입일도 자동 업데이트
watch([() => rentalForm.billingPeriodStartDate, () => rentalForm.billingPeriodEndDate, () => rentalForm.paymentType], ([startDate, endDate, paymentType]) => {
  if (!startDate || !endDate || !paymentType) {
    return
  }
  
  try {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    if (paymentType === 'POSTPAID') {
      // 후불: 청구월세 종료일 + 1일
      const endDateObj = new Date(endDate + 'T00:00:00')
      const paymentDate = new Date(endDateObj)
      paymentDate.setDate(paymentDate.getDate() + 1) // 종료일에서 1일 후
      rentalForm.paymentDate = formatDate(paymentDate)
    } else if (paymentType === 'PREPAID') {
      // 선불: 청구월세 시작일 - 1일
      const startDateObj = new Date(startDate + 'T00:00:00')
      const paymentDate = new Date(startDateObj)
      paymentDate.setDate(paymentDate.getDate() - 1) // 시작일에서 1일 전
      rentalForm.paymentDate = formatDate(paymentDate)
    }
  } catch (error) {
    console.error('월세 납입일 계산 오류:', error)
  }
})

// 신청일자 기준으로 청구월 자동 계산
// 15일 전이면 전달, 15일 이후면 이번달
const calculateBillingMonth = (requestDate: string): number | null => {
  if (!requestDate) return null
  
  try {
    const request = new Date(requestDate + 'T00:00:00')
    const day = request.getDate()
    const currentMonth = request.getMonth() + 1 // 1-12
    
    if (day <= 15) {
      // 15일 전이면 전달
      if (currentMonth === 1) {
        return 12 // 전년도 12월
      } else {
        return currentMonth - 1
      }
    } else {
      // 15일 이후면 이번달
      return currentMonth
    }
  } catch (error) {
    console.error('청구월 계산 오류:', error)
    return null
  }
}

// 신청일자가 변경될 때 청구월 자동 계산
watch(() => rentalForm.requestDate, (newValue) => {
  if (newValue) {
    const calculatedMonth = calculateBillingMonth(newValue)
    if (calculatedMonth !== null) {
      rentalForm.month = calculatedMonth
      // 청구월이 변경되면 청구월세 기간도 재계산
      if (rentalForm.contractStartDate) {
        calculateBillingPeriod()
      }
    }
  }
})


// RentalSupport 정보로 폼 채우기
const fillFormFromRentalSupport = (rentalSupport: any) => {
  if (!rentalSupport) return
  
  // 계약 정보
  if (rentalSupport.contractStartDate) {
    rentalForm.contractStartDate = rentalSupport.contractStartDate
  }
  if (rentalSupport.contractEndDate) {
    rentalForm.contractEndDate = rentalSupport.contractEndDate
  }
  if (rentalSupport.contractMonthlyRent) {
    rentalForm.contractMonthlyRent = rentalSupport.contractMonthlyRent
  }
  if (rentalSupport.billingAmount) {
    rentalForm.billingAmount = rentalSupport.billingAmount
  }
  if (rentalSupport.billingStartDate) {
    rentalForm.billingStartDate = rentalSupport.billingStartDate
  }
  
  // 납입 금액은 계약 월세 금액과 동일
  if (rentalSupport.contractMonthlyRent) {
    rentalForm.paymentAmount = rentalSupport.contractMonthlyRent
  }
}

onMounted(async () => {
  // 수정 모드인 경우 기존 데이터 로드
  if (isEditMode.value && rentalSeq.value) {
    await loadRentalApplicationData(rentalSeq.value)
  } else {
    // 신청 모드인 경우 신청일자 기준으로 청구월 자동 계산
    const calculatedMonth = calculateBillingMonth(rentalForm.requestDate)
    if (calculatedMonth !== null) {
      rentalForm.month = calculatedMonth
    }
    
    // 월세 지원 정보 목록 조회하여 가장 최신 정보로 폼 채우기
    try {
      const response = await getRentalSupportList()
      const rentalSupportList = response.resultMsg
      
      if (rentalSupportList && rentalSupportList.length > 0) {
        // seq가 가장 큰 것(가장 최신)을 선택
        const latestRentalSupport = rentalSupportList.reduce((prev: any, current: any) => {
          return (prev.seq > current.seq) ? prev : current
        })
        
        fillFormFromRentalSupport(latestRentalSupport)
      }
    } catch (error) {
      console.error('월세 지원 정보 조회 실패:', error)
      // 에러가 발생해도 계속 진행 (새로 작성하는 경우)
    }
  }
})

// 기존 월세 지원 신청 데이터 로드
const loadRentalApplicationData = async (seq: number) => {
  try {
    const response = await getRentalSupportApplication(seq)
    const rental = response.resultMsg
    
    if (rental) {
      currentRentalSupport.value = rental
      rentalForm.requestDate = rental.requestDate || getTodayDate()
      rentalForm.month = rental.billingYyMonth ? Math.floor(rental.billingYyMonth % 100) : null
      rentalForm.contractStartDate = rental.contractStartDate || ''
      rentalForm.contractEndDate = rental.contractEndDate || ''
      rentalForm.contractMonthlyRent = rental.contractMonthlyRent || 0
      // paymentType 변환: 백엔드에서 한글 값("선불", "후불")로 올 수 있으므로 변환 필요
      if (rental.paymentType) {
        const paymentTypeStr = String(rental.paymentType)
        if (paymentTypeStr === '선불' || paymentTypeStr === 'PREPAID') {
          rentalForm.paymentType = 'PREPAID'
        } else if (paymentTypeStr === '후불' || paymentTypeStr === 'POSTPAID') {
          rentalForm.paymentType = 'POSTPAID'
        } else {
          rentalForm.paymentType = 'POSTPAID' // 기본값
        }
      } else {
        rentalForm.paymentType = 'POSTPAID' // 기본값
      }
      rentalForm.billingStartDate = rental.billingStartDate || ''
      rentalForm.billingPeriodStartDate = rental.billingPeriodStartDate || ''
      rentalForm.billingPeriodEndDate = rental.billingPeriodEndDate || ''
      rentalForm.paymentDate = rental.paymentDate || ''
      rentalForm.paymentAmount = rental.paymentAmount || 0
      rentalForm.billingAmount = rental.billingAmount || 0
      
      // 디버깅을 위한 로그
      console.log('월세 지원 신청 데이터 로드:', {
        seq,
        paymentType: rental.paymentType,
        paymentTypeType: typeof rental.paymentType,
        setPaymentType: rentalForm.paymentType
      })
    }
  } catch (error) {
    console.error('월세 지원 신청 데이터 조회 실패:', error)
    alert('월세 지원 신청 데이터를 불러오는데 실패했습니다.')
    if (isApprovalMode.value) {
      router.push('/approval-list')
    } else {
      router.push('/my-applications')
    }
  }
}

// 승인 가능 여부 확인
const canApprove = computed(() => {
  if (!user.value || !currentRentalSupport.value) return false
  const authVal = user.value.authVal
  const status = currentRentalSupport.value.approvalStatus || 'A'
  
  // 팀장: A, AM 상태만 승인 가능
  if (authVal === 'tj') {
    return status === 'A' || status === 'AM'
  }
  
  // 본부장: B 상태만 승인 가능
  if (authVal === 'bb') {
    return status === 'B'
  }
  
  // 관리자: 모든 상태 승인 가능
  if (authVal === 'ma') {
    return status === 'A' || status === 'AM' || status === 'B'
  }
  
  return false
})

// 반려 가능 여부 확인
const canReject = computed(() => {
  if (!user.value || !currentRentalSupport.value) return false
  const authVal = user.value.authVal
  const status = currentRentalSupport.value.approvalStatus || 'A'
  
  // 팀장: A, AM 상태만 반려 가능
  if (authVal === 'tj') {
    return status === 'A' || status === 'AM'
  }
  
  // 본부장: B 상태만 반려 가능
  if (authVal === 'bb') {
    return status === 'B'
  }
  
  // 관리자: 모든 상태 반려 가능
  if (authVal === 'ma') {
    return status === 'A' || status === 'AM' || status === 'B'
  }
  
  return false
})

// 승인 처리
const handleApprove = async () => {
  if (!rentalSeq.value || !user.value) return
  
  if (!confirm('승인하시겠습니까?')) {
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await approveRentalSupportByTeamLeader(rentalSeq.value)
    } else if (authVal === 'bb') {
      await approveRentalSupportByDivisionHead(rentalSeq.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentRentalSupport.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await approveRentalSupportByTeamLeader(rentalSeq.value)
      } else if (status === 'B') {
        await approveRentalSupportByDivisionHead(rentalSeq.value)
      }
    }
    
    alert('승인되었습니다.')
    router.push('/approval-list')
  } catch (error: any) {
    console.error('승인 처리 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || error.message || '승인 처리에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 월세 지원 신청서 다운로드
const handleDownloadRentalApplication = async () => {
  if (!rentalSeq.value) return
  
  isDownloading.value = true
  try {
    const applicant = user.value?.name || ''
    const { blob, filename } = await downloadRentalSupportApplication(rentalSeq.value, applicant)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('다운로드 실패:', error)
    alert('다운로드에 실패했습니다.')
  } finally {
    isDownloading.value = false
  }
}

// 반려 처리
const handleReject = () => {
  if (!canReject.value) return
  showRejectModal.value = true
}

// 반려 모달 닫기
const closeRejectModal = () => {
  showRejectModal.value = false
  rejectionReason.value = ''
}

// 월세 지원 신청서 다운로드
const handleDownloadRentalApplication = async () => {
  if (!rentalSeq.value) return
  
  isDownloading.value = true
  try {
    const applicant = currentRentalSupport.value?.userId ? 
      (user.value?.name || '') : undefined
    const { blob, filename } = await downloadRentalSupportApplication(rentalSeq.value, applicant)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('다운로드 실패:', error)
    alert('다운로드에 실패했습니다.')
  } finally {
    isDownloading.value = false
  }
}

// 반려 확정 처리
const confirmReject = async () => {
  if (!rentalSeq.value || !user.value || !rejectionReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await rejectRentalSupportByTeamLeader(rentalSeq.value, rejectionReason.value)
    } else if (authVal === 'bb') {
      await rejectRentalSupportByDivisionHead(rentalSeq.value, rejectionReason.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentRentalSupport.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await rejectRentalSupportByTeamLeader(rentalSeq.value, rejectionReason.value)
      } else if (status === 'B') {
        await rejectRentalSupportByDivisionHead(rentalSeq.value, rejectionReason.value)
      }
    }
    
    alert('반려되었습니다.')
    router.push('/approval-list')
  } catch (error: any) {
    console.error('반려 처리 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || error.message || '반려 처리에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
    closeRejectModal()
  }
}

const submitRentalApplication = async () => {
  if (!rentalForm.requestDate || !rentalForm.month || !rentalForm.contractStartDate || 
      !rentalForm.contractEndDate || !rentalForm.contractMonthlyRent || !rentalForm.paymentType ||
      !rentalForm.billingStartDate || !rentalForm.billingPeriodStartDate || 
      !rentalForm.billingPeriodEndDate || !rentalForm.paymentDate || 
      !rentalForm.paymentAmount || !rentalForm.billingAmount) {
    alert('모든 필수 항목을 입력해주세요.')
    return
  }

  isSubmitting.value = true
  try {
    const request: RentalSupportRequest = {
      requestDate: rentalForm.requestDate,
      month: rentalForm.month,
      contractStartDate: rentalForm.contractStartDate,
      contractEndDate: rentalForm.contractEndDate,
      contractMonthlyRent: rentalForm.contractMonthlyRent,
      paymentType: rentalForm.paymentType as 'PREPAID' | 'POSTPAID',
      billingStartDate: rentalForm.billingStartDate,
      billingPeriodStartDate: rentalForm.billingPeriodStartDate,
      billingPeriodEndDate: rentalForm.billingPeriodEndDate,
      paymentDate: rentalForm.paymentDate,
      paymentAmount: rentalForm.paymentAmount,
      billingAmount: rentalForm.billingAmount
    }
    
    if (isEditMode.value && rentalSeq.value) {
      // 수정 모드
      await updateRentalSupportApplication(rentalSeq.value, request)
      alert('수정되었습니다.')
      router.push('/my-applications')
    } else {
      // 신청 모드
      const response = await createRentalSupportApplication(request)
      // 성공 페이지로 리다이렉트 (신청 타입과 seq 전달)
      if (response.resultMsg && response.resultMsg.seq) {
        router.push({
          path: '/application-success',
          query: {
            type: 'rental',
            seq: response.resultMsg.seq
          }
        })
      } else {
        router.push('/my-applications')
      }
    }
  } catch (error: any) {
    console.error(isEditMode.value ? '월세 지원 수정 실패:' : '월세 지원 신청 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || error.message || (isEditMode.value ? '월세 지원 수정에 실패했습니다.' : '월세 지원 신청에 실패했습니다.')
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.rental-application-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.header-section {
  max-width: 1200px;
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

.form-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
  margin-bottom: 1.5rem;
  color: #1226aa;
  border-bottom: 2px solid #1226aa;
  padding-bottom: 0.5rem;
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
  color: #333;
}

.label-with-help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #1226aa;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.help-button:hover {
  background-color: #0f1f88;
}

.help-button:active {
  transform: scale(0.95);
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #17ccff;
  box-shadow: 0 0 0 3px rgba(23, 204, 255, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.department-select-group {
  display: flex;
  gap: 0.5rem;
}

.department-select {
  flex: 1;
}

.department-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-with-unit {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unit-text-below {
  font-size: 0.875rem;
  color: #666;
}

.form-actions {
  margin-top: 2rem;
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
  width: 100%;
}

.submit-button:hover:not(:disabled) {
  background-color: #0f1f88;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .rental-application-view {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .department-select-group {
    flex-direction: column;
  }
}

/* 결재 모드 스타일 */
.approval-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.approval-actions .btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-approve {
  background-color: #28a745;
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background-color: #218838;
}

.btn-reject {
  background-color: #dc3545;
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-download {
  background-color: #1226aa;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background-color: #0f1f88;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 반려 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.reject-reason-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1.5rem;
}

.reject-reason-input:focus {
  outline: none;
  border-color: #17ccff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-actions .btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}
</style>
