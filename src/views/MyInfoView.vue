<template>
  <div class="my-info-view">
    <div class="header-section">
      <h1>내 정보</h1>
    </div>

    <!-- 사용자 정보 섹션 -->
    <div class="info-section">
      <h2>사용자 정보</h2>
      <div class="info-form">
        <div class="form-group">
          <label>이메일</label>
          <input type="email" :value="userInfo?.email" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>이름</label>
          <input type="text" :value="userInfo?.name" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>본부</label>
          <input
            type="text"
            :value="userInfo?.division"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label>팀</label>
          <input
            type="text"
            :value="userInfo?.team"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label>직급</label>
          <input
            type="text"
            :value="userInfo?.position"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label>입사일</label>
          <input
            type="text"
            :value="userInfo?.joinDate ? formatDate(userInfo.joinDate) : '-'"
            disabled
            class="disabled-input"
          />
        </div>
      </div>
    </div>

    <!-- 연차 정보 섹션 -->
    <div class="info-section">
      <div class="section-header">
        <h2>연차 정보</h2>
        <template v-if="vacationInfo?.firstLogin">
          <button 
            v-if="!isEditingVacation" 
            @click="startEditVacation" 
            class="btn btn-edit"
          >
            수정
          </button>
          <div v-else class="vacation-edit-actions">
            <button @click="cancelEditVacation" class="btn btn-cancel">취소</button>
            <button @click="saveVacationInfo" class="btn btn-save" :disabled="isUpdatingVacation">
              {{ isUpdatingVacation ? '저장 중...' : '저장' }}
            </button>
          </div>
        </template>
      </div>
      <div v-if="vacationInfo" class="vacation-info">
        <div class="vacation-item">
          <span class="vacation-label">금년 발생 연차:</span>
          <input 
            v-if="isEditingVacation && vacationInfo?.firstLogin" 
            type="number" 
            v-model.number="editableVacationInfo.annualVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.annualVacationDays }}일</span>
        </div>
        <div class="vacation-item">
          <span class="vacation-label">사용 연차:</span>
          <input 
            v-if="isEditingVacation && vacationInfo?.firstLogin" 
            type="number" 
            v-model.number="editableVacationInfo.usedVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.usedVacationDays }}일</span>
        </div>
        <div class="vacation-item">
          <span class="vacation-label">예약중 연차:</span>
          <input 
            v-if="isEditingVacation && vacationInfo?.firstLogin" 
            type="number" 
            v-model.number="editableVacationInfo.reservedVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.reservedVacationDays }}일</span>
        </div>
        <div class="vacation-item highlight">
          <span class="vacation-label">남은 연차:</span>
          <span class="vacation-value">{{ calculatedRemainingDays }}일</span>
        </div>
      </div>
      <div v-else class="empty-message">연차 정보를 불러오는 중...</div>
    </div>

    <!-- 월세 품의 정보 섹션 -->
    <div class="info-section">
      <div class="section-header">
        <h2>월세 품의 정보</h2>
        <button 
          v-if="rentalSupportList.length === 0" 
          @click="showAddRentalForm = true" 
          class="btn btn-add"
        >
          추가
        </button>
      </div>

      <!-- 월세 신청 정보 목록 -->
      <div v-if="rentalSupportList.length > 0" class="rental-list">
        <div
          v-for="rental in rentalSupportList"
          :key="rental.seq"
          class="rental-item"
        >
          <div class="rental-header">
            <span class="rental-address">{{ rental.rentalAddress }}</span>
            <div class="rental-actions">
              <button @click="editRental(rental)" class="btn btn-edit">수정</button>
              <button @click="deleteRental(rental.seq)" class="btn btn-delete">삭제</button>
            </div>
          </div>
          <div class="rental-details">
            <div class="detail-row">
              <span class="detail-label">승인상태:</span>
              <span :class="getApprovalStatusClass(rental.approvalStatus)">
                {{ getApprovalStatusName(rental.approvalStatus) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">기존 거주지 주소:</span>
              <span>{{ rental.previousAddress || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 시작일:</span>
              <span>{{ formatDate(rental.contractStartDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 종료일:</span>
              <span>{{ formatDate(rental.contractEndDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 월세 금액:</span>
              <span>{{ formatNumber(rental.contractMonthlyRent) }}원</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">청구 금액:</span>
              <span>{{ formatNumber(rental.billingAmount) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 개시일:</span>
              <span>{{ formatDate(rental.billingStartDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 사유:</span>
              <span>{{ rental.billingReason || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-message">등록된 월세 품의 정보가 없습니다.</div>

      <!-- 월세 품의 정보 추가/수정 폼 -->
      <div v-if="showAddRentalForm || editingRental" class="rental-form-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingRental ? '수정' : '추가' }}</h3>
            <button @click="closeRentalForm" class="btn-close">×</button>
          </div>
          <form @submit.prevent="saveRentalSupport" class="rental-form">
            <div class="form-group">
              <label>신청일자 (품의 일자) <span class="required">*</span></label>
              <input type="date" v-model="rentalForm.requestDate" required />
            </div>

            <div class="form-group">
              <label>기존 거주지 주소</label>
              <input type="text" v-model="rentalForm.previousAddress" />
            </div>

            <div class="form-group">
              <label>월세 계약 주소</label>
              <input type="text" v-model="rentalForm.rentalAddress" />
            </div>

            <div class="form-group">
              <label class="label-with-help">
                월세 계약 시작일 <span class="required">*</span>
                <button
                  type="button"
                  class="help-button"
                  @click="showHelpModal('prop_period')"
                  aria-label="도움말"
                >
                  ?
                </button>
              </label>
              <input type="date" v-model="rentalForm.contractStartDate" required />
            </div>

            <div v-if="rentalForm.contractStartDate" class="form-group">
              <label>계약 단위 <span class="required">*</span></label>
              <select v-model="rentalForm.contractTermUnit" required class="form-select">
                <option value="">선택</option>
                <option value="1년">1년</option>
                <option value="2년">2년</option>
                <option value="직접입력">직접입력</option>
              </select>
            </div>

            <div class="form-group">
              <label class="label-with-help">
                월세 계약 종료일 <span class="required">*</span>
                <button
                  type="button"
                  class="help-button"
                  @click="showHelpModal('prop_period')"
                  aria-label="도움말"
                >
                  ?
                </button>
              </label>
              <input
                type="date"
                v-model="rentalForm.contractEndDate"
                :disabled="rentalForm.contractTermUnit !== '직접입력' && rentalForm.contractTermUnit !== ''"
                required
              />
            </div>

            <div class="form-group">
              <label class="label-with-help">
                계약 월세 금액(원) <span class="required">*</span>
                <button
                  type="button"
                  class="help-button"
                  @click="showHelpModal('prop_amount')"
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
                  required
                />
                <div v-if="rentalForm.contractMonthlyRent >= 10000" class="unit-text-below">
                  {{ formatKoreanWon(rentalForm.contractMonthlyRent) }}
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
                  required
                />
                <div v-if="rentalForm.billingAmount >= 10000" class="unit-text-below">
                  {{ formatKoreanWon(rentalForm.billingAmount) }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="label-with-help">
                월세 청구 개시일 <span class="required">*</span>
                <button
                  type="button"
                  class="help-button"
                  @click="showHelpModal('prop_billingstart')"
                  aria-label="도움말"
                >
                  ?
                </button>
              </label>
              <input type="date" v-model="rentalForm.billingStartDate" required />
            </div>

            <div class="form-group">
              <label>월세 청구 사유</label>
              <textarea v-model="rentalForm.billingReason" rows="3"></textarea>
            </div>

            <!-- 첨부파일 -->
            <div class="form-group">
              <label>첨부파일</label>
              <div class="file-upload-section">
                <!-- 파일 선택 input -->
                <div class="file-input-wrapper">
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileSelect"
                    accept=".png,.jpg,.jpeg,.pdf"
                    class="file-input"
                    id="rental-proposal-file-input"
                  />
                  <label for="rental-proposal-file-input" class="file-input-label">
                    <span class="file-input-text">파일 선택 (PNG, JPG, PDF, 최대 10MB)</span>
                  </label>
                </div>
                
                <!-- 선택된 파일 표시 -->
                <div v-if="selectedFile" class="selected-file">
                  <span class="file-name">{{ selectedFile.name }}</span>
                  <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
                  <button 
                    type="button" 
                    @click="removeSelectedFile" 
                    class="btn-remove-file"
                  >
                    삭제
                  </button>
                </div>
                
                <!-- 기존 첨부파일 표시 -->
                <div v-if="existingAttachment && !selectedFile" class="existing-file">
                  <span class="file-name">{{ existingAttachment.fileName }}</span>
                  <span class="file-size">({{ formatFileSize(existingAttachment.fileSize) }})</span>
                  <button 
                    type="button" 
                    @click="downloadAttachment" 
                    class="btn-download-file"
                  >
                    다운로드
                  </button>
                  <button 
                    type="button" 
                    @click="removeExistingFile" 
                    class="btn-remove-file"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeRentalForm" class="btn btn-cancel">취소</button>
              <button type="submit" class="btn btn-save" :disabled="isSaving">
                {{ isSaving ? '저장 중...' : '저장' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 도움말 모달 -->
    <HelpModal
      :is-open="helpModal.isOpen"
      :image-src="helpModal.imageSrc"
      alt-text="월세 품의 정보 도움말"
      @close="closeHelpModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue'
import {
  getUserInfo,
  getRentalSupportList,
  createRentalSupport,
  updateRentalSupport,
  deleteRentalSupport,
  getUserVacationInfo,
  updateVacationInfo,
  type UserInfoResponse,
  type RentalSupport,
  type UserVacationInfoResponse,
  type UpdateVacationInfoRequest
} from '@/api/user'
import HelpModal from '@/components/HelpModal.vue'
import propPeriodImage from '@/assets/image/help/prop_period.png'
import propAmountImage from '@/assets/image/help/prop_amount.png'
import propBillingStartImage from '@/assets/image/help/prop_billingStart.png'
import apiClient from '@/api/axios'
import { formatDate, formatNumber, getTodayDate } from '@/utils/formatUtils'
import { getApprovalStatusName, getApprovalStatusClass } from '@/utils/statusUtils'
import StatusBadge from '@/components/StatusBadge.vue'

const userInfo = ref<UserInfoResponse | null>(null)

const rentalSupportList = ref<RentalSupport[]>([])
const showAddRentalForm = ref(false)
const editingRental = ref<RentalSupport | null>(null)
const isSaving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const existingAttachment = ref<{ seq: number; fileName: string; fileSize: number } | null>(null)

const vacationInfo = ref<UserVacationInfoResponse | null>(null)
const isEditingVacation = ref(false)
const isUpdatingVacation = ref(false)
const editableVacationInfo = ref({
  annualVacationDays: 0,
  usedVacationDays: 0,
  reservedVacationDays: 0
})

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
  prop_period: propPeriodImage,
  prop_amount: propAmountImage,
  prop_billingstart: propBillingStartImage
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

const rentalForm = ref({
  requestDate: getTodayDate(),
  previousAddress: '',
  rentalAddress: '',
  contractStartDate: '',
  contractTermUnit: '', // 1년, 2년, 직접입력
  contractEndDate: '',
  contractMonthlyRent: 0,
  billingAmount: 0,
  billingStartDate: '',
  billingReason: ''
})

onMounted(async () => {
  await loadUserInfo()
  await loadRentalSupportList()
  await loadVacationInfo()
})

const loadUserInfo = async () => {
  try {
    const response = await getUserInfo()
    userInfo.value = response.resultMsg
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    alert('사용자 정보를 불러오는데 실패했습니다.')
  }
}

const loadRentalSupportList = async () => {
  try {
    const response = await getRentalSupportList()
    rentalSupportList.value = response.resultMsg
  } catch (error) {
    console.error('월세 지원 정보 목록 조회 실패:', error)
    alert('월세 지원 정보를 불러오는데 실패했습니다.')
  }
}

// 계약 기간으로 계약 단위 계산
const calculateContractTermUnit = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return ''
  
  try {
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    
    // 정확히 1년인지 확인 (시작일과 종료일이 정확히 1년 차이)
    const startNextYear = new Date(start)
    startNextYear.setFullYear(start.getFullYear() + 1)
    startNextYear.setDate(startNextYear.getDate() - 1) // 1년 후 - 1일
    
    if (startNextYear.toDateString() === end.toDateString()) {
      return '1년'
    }
    
    // 정확히 2년인지 확인
    const startTwoYears = new Date(start)
    startTwoYears.setFullYear(start.getFullYear() + 2)
    startTwoYears.setDate(startTwoYears.getDate() - 1) // 2년 후 - 1일
    
    if (startTwoYears.toDateString() === end.toDateString()) {
      return '2년'
    }
    
    // 그 외는 직접입력
    return '직접입력'
  } catch (error) {
    console.error('계약 단위 계산 오류:', error)
    return '직접입력'
  }
}

const editRental = async (rental: RentalSupport) => {
  editingRental.value = rental
  rentalForm.value = {
    requestDate: getTodayDate(), // 품의서에는 requestDate가 없으므로 오늘 날짜로 설정
    previousAddress: rental.previousAddress || '',
    rentalAddress: rental.rentalAddress || '',
    contractStartDate: rental.contractStartDate,
    contractTermUnit: calculateContractTermUnit(rental.contractStartDate, rental.contractEndDate),
    contractEndDate: rental.contractEndDate,
    contractMonthlyRent: rental.contractMonthlyRent,
    billingAmount: rental.billingAmount,
    billingStartDate: rental.billingStartDate,
    billingReason: rental.billingReason || ''
  }
  
  // 첨부파일 정보 로드
  try {
    const response = await apiClient.get(`/rental/${rental.seq}`)
    const result = response.data.resultMsg
    if (result && result.attachment) {
      existingAttachment.value = {
        seq: result.attachment.seq,
        fileName: result.attachment.fileName,
        fileSize: result.attachment.fileSize
      }
    } else {
      existingAttachment.value = null
    }
  } catch (error) {
    console.error('첨부파일 정보 조회 실패:', error)
    existingAttachment.value = null
  }
  
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  showAddRentalForm.value = true
}

const deleteRental = async (seq: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return
  }

  try {
    await deleteRentalSupport(seq)
    alert('삭제되었습니다.')
    await loadRentalSupportList()
    // 삭제 후 추가 버튼이 다시 표시되도록 (rentalSupportList.length === 0이면 자동으로 표시됨)
  } catch (error) {
    console.error('월세 지원 정보 삭제 실패:', error)
    alert('삭제에 실패했습니다.')
  }
}

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
    rentalForm.value.contractMonthlyRent = numValue
    // 계약 월세 금액이 변경되면 청구 금액 자동 계산
    if (numValue > 0) {
      // 50만원 초과면 최대 25만원, 그 외는 50%
      if (numValue > 500000) {
        rentalForm.value.billingAmount = 250000
      } else {
        rentalForm.value.billingAmount = Math.floor(numValue / 2)
      }
    }
    target.value = value || ''
  } else if (field === 'billingAmount') {
    rentalForm.value.billingAmount = numValue
    target.value = value || ''
  }
}

// 계약 월세 금액이 변경될 때 자동 계산
watch(() => rentalForm.value.contractMonthlyRent, (newValue) => {
  if (newValue && newValue > 0) {
    // 월세 청구 금액 계산
    // 50만원 초과면 최대 25만원, 그 외는 50%
    if (newValue > 500000) {
      rentalForm.value.billingAmount = 250000
    } else {
      rentalForm.value.billingAmount = Math.floor(newValue / 2)
    }
  }
})

// 품의서: 계약 시작일이 변경될 때 청구 개시일 자동 설정
watch(() => rentalForm.value.contractStartDate, (newValue) => {
  if (newValue) {
    rentalForm.value.billingStartDate = newValue
  }
})

// 품의서: 계약 시작일과 계약 단위가 변경될 때 종료일 자동 계산
watch([() => rentalForm.value.contractStartDate, () => rentalForm.value.contractTermUnit], ([startDate, termUnit]) => {
  if (startDate && termUnit && termUnit !== '직접입력') {
    const start = new Date(startDate + 'T00:00:00')
    const years = termUnit === '1년' ? 1 : 2
    const end = new Date(start)
    end.setFullYear(start.getFullYear() + years)
    end.setDate(end.getDate() - 1) // 종료일은 시작일 + N년 - 1일
    
    const year = end.getFullYear()
    const month = String(end.getMonth() + 1).padStart(2, '0')
    const day = String(end.getDate()).padStart(2, '0')
    rentalForm.value.contractEndDate = `${year}-${month}-${day}`
  } else if (termUnit === '직접입력') {
    // 직접입력으로 변경되면 종료일은 그대로 유지 (사용자가 입력)
  }
})

// 파일 선택 처리
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 파일 크기 검증 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('파일 크기는 10MB를 초과할 수 없습니다.')
    target.value = ''
    return
  }
  
  // 파일 확장자 검증
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf']
  const fileName = file.name.toLowerCase()
  const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (!isValidExtension) {
    alert('PNG, JPG, PDF 파일만 업로드 가능합니다.')
    target.value = ''
    return
  }
  
  selectedFile.value = file
  // 새 파일 선택 시 기존 첨부파일 정보 제거
  existingAttachment.value = null
}

// 선택된 파일 제거
const removeSelectedFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 기존 파일 제거
const removeExistingFile = () => {
  existingAttachment.value = null
}

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 첨부파일 다운로드
const downloadAttachment = async () => {
  if (!editingRental.value || !existingAttachment.value) return
  
  try {
    const response = await apiClient.get(`/rental/${editingRental.value.seq}/attachment`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = existingAttachment.value.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('첨부파일 다운로드 실패:', error)
    alert('첨부파일 다운로드에 실패했습니다.')
  }
}

const saveRentalSupport = async () => {
  isSaving.value = true
  try {
    // RentalSupportRequest에 맞게 변환 (requestDate, contractTermUnit 제외)
    const request: any = {
      previousAddress: rentalForm.value.previousAddress || undefined,
      rentalAddress: rentalForm.value.rentalAddress,
      contractStartDate: rentalForm.value.contractStartDate,
      contractEndDate: rentalForm.value.contractEndDate,
      contractMonthlyRent: rentalForm.value.contractMonthlyRent,
      billingAmount: rentalForm.value.billingAmount,
      billingStartDate: rentalForm.value.billingStartDate,
      billingReason: rentalForm.value.billingReason || undefined
    }
    
    // FormData 생성
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
    formData.append('rentalProposalRequest', jsonBlob, 'rentalProposalRequest.json')
    
    // 파일이 있으면 추가
    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }
    
    if (editingRental.value) {
      await apiClient.put(`/rental/${editingRental.value.seq}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('수정되었습니다.')
    } else {
      const response = await apiClient.post('/rental', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('추가되었습니다.')
    }
    closeRentalForm()
    await loadRentalSupportList()
  } catch (error) {
    console.error('월세 지원 정보 저장 실패:', error)
    alert('저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

const closeRentalForm = () => {
  showAddRentalForm.value = false
  editingRental.value = null
  rentalForm.value = {
    requestDate: getTodayDate(),
    previousAddress: '',
    rentalAddress: '',
    contractStartDate: '',
    contractTermUnit: '',
    contractEndDate: '',
    contractMonthlyRent: 0,
    billingAmount: 0,
    billingStartDate: '',
    billingReason: ''
  }
  selectedFile.value = null
  existingAttachment.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 포맷팅 및 유틸리티 함수는 공통 유틸리티에서 import하여 사용
// formatCurrency는 formatNumber로 대체

const loadVacationInfo = async () => {
  try {
    const response = await getUserVacationInfo()
    vacationInfo.value = response.resultMsg
    editableVacationInfo.value = {
      annualVacationDays: response.resultMsg.annualVacationDays,
      usedVacationDays: response.resultMsg.usedVacationDays,
      reservedVacationDays: response.resultMsg.reservedVacationDays
    }
  } catch (error) {
    console.error('연차 정보 조회 실패:', error)
    alert('연차 정보를 불러오는데 실패했습니다.')
  }
}

const startEditVacation = () => {
  if (vacationInfo.value) {
    editableVacationInfo.value = {
      annualVacationDays: vacationInfo.value.annualVacationDays,
      usedVacationDays: vacationInfo.value.usedVacationDays,
      reservedVacationDays: vacationInfo.value.reservedVacationDays
    }
  }
  isEditingVacation.value = true
}

const cancelEditVacation = () => {
  isEditingVacation.value = false
  if (vacationInfo.value) {
    editableVacationInfo.value = {
      annualVacationDays: vacationInfo.value.annualVacationDays,
      usedVacationDays: vacationInfo.value.usedVacationDays,
      reservedVacationDays: vacationInfo.value.reservedVacationDays
    }
  }
}

const saveVacationInfo = async () => {
  isUpdatingVacation.value = true
  try {
    const updateRequest: UpdateVacationInfoRequest = {
      annualVacationDays: editableVacationInfo.value.annualVacationDays,
      usedVacationDays: editableVacationInfo.value.usedVacationDays,
      reservedVacationDays: editableVacationInfo.value.reservedVacationDays
    }
    const response = await updateVacationInfo(updateRequest)
    vacationInfo.value = response.resultMsg
    isEditingVacation.value = false
    
    // 연차 정보 수정 후 사용자 정보 다시 로드 (firstLogin이 false로 변경됨)
    await loadUserInfo()
    
    alert('연차 정보가 수정되었습니다.')
  } catch (error) {
    console.error('연차 정보 수정 실패:', error)
    alert('연차 정보 수정에 실패했습니다.')
  } finally {
    isUpdatingVacation.value = false
  }
}

const calculatedRemainingDays = computed(() => {
  if (!vacationInfo.value) return 0
  if (isEditingVacation.value) {
    return editableVacationInfo.value.annualVacationDays 
      - editableVacationInfo.value.usedVacationDays 
      - editableVacationInfo.value.reservedVacationDays
  }
  return vacationInfo.value.remainingVacationDays
})
</script>

<style scoped>
.my-info-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.header-section {
  max-width: 900px;
  margin: 0 auto 2rem;
  text-align: left;
}

.header-section h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
  padding-left: 30px;
}

.info-section {
  max-width: 900px;
  margin: 0 auto 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #1226aa;
  padding-bottom: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin-bottom: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.info-form {
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
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

.input-with-unit {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unit-text-below {
  font-size: 0.875rem;
  color: #666;
}

.form-select {
  width: 100%;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #17ccff;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.required {
  color: #e74c3c;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background-color: #1226aa;
  color: white;
  align-self: flex-start;
}

.btn-save:hover:not(:disabled) {
  background-color: #0f1f88;
}

.btn-add {
  background-color: #17ccff;
  color: white;
}

.btn-add:hover {
  background-color: #14b8e6;
}

.btn-edit {
  background-color: #1226aa;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-edit:hover {
  background-color: #0f1f88;
}

.btn-delete {
  background-color: #0d1f7a;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-delete:hover {
  background-color: #0a1755;
}

.btn-cancel {
  background-color: #999;
  color: white;
}

.btn-cancel:hover {
  background-color: #777;
}

.rental-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rental-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1.5rem;
  background-color: #f9f9f9;
}

.rental-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.rental-address {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.rental-actions {
  display: flex;
  gap: 0.5rem;
}

.rental-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-label {
  font-weight: 500;
  color: #555;
  min-width: 150px;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.vacation-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vacation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.vacation-item.highlight {
  background-color: #e8f4f8;
  border-color: #17ccff;
  font-weight: 600;
}

.vacation-label {
  font-weight: 500;
  color: #555;
}

.vacation-value {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.vacation-item.highlight .vacation-value {
  color: #1226aa;
  font-size: 1.2rem;
}

.vacation-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.vacation-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100px;
  text-align: right;
}

.vacation-input:focus {
  outline: none;
  border-color: #17ccff;
}

.rental-form-modal {
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
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1226aa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.rental-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* 파일 업로드 스타일 */
.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.file-input-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.file-input-label:hover {
  background-color: #e9ecef;
  border-color: #1226aa;
}

.file-input-text {
  color: #666;
  font-size: 0.9rem;
}

.selected-file,
.existing-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.file-name {
  flex: 1;
  color: #2c3e50;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #666;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.btn-download-file,
.btn-remove-file {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-download-file {
  background-color: #1226aa;
  color: white;
}

.btn-download-file:hover {
  background-color: #0f1f8a;
}

.btn-remove-file {
  background-color: #dc3545;
  color: white;
}

.btn-remove-file:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .my-info-view {
    padding: 1rem;
  }

  .info-section {
    padding: 1.5rem;
  }

  .rental-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    min-width: auto;
  }
}

/* 모바일 화면 (600px 이하) */
@media (max-width: 600px) {
  .my-info-view {
    padding: 0.75rem;
  }

  .info-section {
    padding: 1rem;
  }

  .header-section h1 {
    font-size: 1.5rem;
    padding-left: 0;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  /* 모바일에서도 버튼 색상 유지 */
  .btn-save {
    background-color: #1226aa !important;
    color: white !important;
  }

  .btn-add {
    background-color: #17ccff !important;
    color: white !important;
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
  }

  .btn-edit {
    background-color: #1226aa !important;
    color: white !important;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .btn-delete {
    background-color: #0d1f7a !important;
    color: white !important;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .btn-cancel {
    background-color: #999 !important;
    color: white !important;
  }

  .vacation-edit-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .vacation-edit-actions .btn {
    width: 100%;
  }

  .rental-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .rental-actions .btn {
    width: 100%;
  }
}

/* 승인 상태 스타일 */
.status-rejected {
  color: #dc3545;
  font-weight: 600;
}

.status-final-approved {
  color: #28a745;
  font-weight: 600;
}

.status-default {
  color: #666;
  font-weight: 500;
}
</style>

