<template>
  <div class="expense-application-view">
    <div class="header-section">
      <div class="header-title-wrapper">
        <h1>{{ isApprovalMode ? '개인 비용 결재' : (isEditMode ? '개인 비용 수정' : '개인 비용 신청') }}</h1>
        <button v-if="isEditMode || isApprovalMode" @click="goBack" class="btn-back">뒤로가기</button>
      </div>
    </div>

    <div class="form-wrapper">
      <div class="form-container">
        <h2>업무 관련 개인비용 청구서</h2>
        <form class="form" @submit.prevent="submitExpenseApplication">
          <div class="form-group">
            <label>신청일자 <span class="required">*</span></label>
            <input type="date" v-model="expenseForm.requestDate" :disabled="isApprovalMode" required />
          </div>

          <div class="form-group">
            <label>청구 월 <span class="required">*</span></label>
            <select v-model.number="expenseForm.month" :disabled="isApprovalMode" required class="form-select">
              <option :value="null">월 선택</option>
              <option v-for="month in 12" :key="month" :value="month">
                {{ month }}월
              </option>
            </select>
          </div>


          <!-- 비용 항목 목록 -->
          <div class="expense-items-section">
            <h3 class="label-with-help">
              비용 항목 목록 <span class="required">*</span>
              <button
                type="button"
                class="help-button"
                @click="showHelpModal('expense')"
                aria-label="도움말"
              >
                ?
              </button>
            </h3>
            <div
              v-for="(item, index) in expenseForm.expenseItems"
              :key="index"
              class="expense-item"
            >
              <h4>항목 {{ index + 1 }}</h4>
              <div class="expense-item-grid">
                <div class="form-group">
                  <label>일자</label>
                  <input type="date" v-model="item.date" :disabled="isApprovalMode" />
                </div>
                <div class="form-group">
                  <label>사용 내역</label>
                  <input type="text" v-model="item.usageDetail" :disabled="isApprovalMode" />
                </div>
                <div class="form-group">
                  <label>거래처</label>
                  <input type="text" v-model="item.vendor" :disabled="isApprovalMode" />
                </div>
                <div class="form-group">
                  <label>결재방법</label>
                  <input type="text" v-model="item.paymentMethod" :disabled="isApprovalMode" />
                </div>
                <div class="form-group">
                  <label>프로젝트</label>
                  <input type="text" v-model="item.project" :disabled="isApprovalMode" />
                </div>
                <div class="form-group">
                  <label>금액(원)</label>
                  <div class="input-with-unit">
                    <input
                      type="text"
                      :value="item.amount || ''"
                      @input="handleExpenseAmountInput($event, index)"
                      @keypress="handleKeyPress"
                      :disabled="isApprovalMode"
                    />
                    <div v-if="item.amount && item.amount >= 10000" class="unit-text-below">
                      {{ formatKoreanWon(item.amount) }}
                    </div>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>비고</label>
                  <input type="text" v-model="item.note" :disabled="isApprovalMode" />
                </div>
                <!-- 첨부파일 -->
                <div class="form-group full-width">
                  <label>첨부파일</label>
                  <div class="file-upload-section">
                    <!-- 파일 선택 input -->
                    <div v-if="!isApprovalMode" class="file-input-wrapper">
                      <input
                        type="file"
                        :ref="el => { if (el) fileInputRefs[index] = el as HTMLInputElement }"
                        @change="(e) => handleExpenseItemFileSelect(e, index)"
                        accept=".png,.jpg,.jpeg,.pdf"
                        class="file-input"
                        :id="`expense-item-file-input-${index}`"
                      />
                      <label :for="`expense-item-file-input-${index}`" class="file-input-label">
                        <span class="file-input-text">파일 선택 (PNG, JPG, PDF, 최대 10MB)</span>
                      </label>
                    </div>
                    
                    <!-- 선택된 파일 표시 -->
                    <div v-if="item.selectedFile" class="selected-file">
                      <span class="file-name">{{ item.selectedFile.name }}</span>
                      <span class="file-size">({{ formatFileSize(item.selectedFile.size) }})</span>
                      <button 
                        v-if="!isApprovalMode" 
                        type="button" 
                        @click="removeExpenseItemFile(index)" 
                        class="btn-remove-file"
                      >
                        삭제
                      </button>
                    </div>
                    
                    <!-- 기존 첨부파일 표시 -->
                    <div v-if="item.attachment && !item.selectedFile" class="existing-file">
                      <span class="file-name">{{ item.attachment.fileName }}</span>
                      <span class="file-size">({{ formatFileSize(item.attachment.fileSize) }})</span>
                      <button 
                        v-if="!isApprovalMode" 
                        type="button" 
                        @click="downloadExpenseItemFile(index)" 
                        class="btn-download-file"
                      >
                        다운로드
                      </button>
                      <button 
                        v-if="!isApprovalMode" 
                        type="button" 
                        @click="deleteExpenseItemFile(index)" 
                        class="btn-remove-file"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="expense-item-actions" v-if="!isApprovalMode">
                <button type="button" @click="removeExpenseItem(index)" class="btn btn-danger btn-sm">
                  삭제
                </button>
              </div>
            </div>
            <div class="expense-items-actions" v-if="!isApprovalMode">
              <button
                type="button"
                @click="addExpenseItem"
                class="btn btn-secondary"
                :disabled="expenseForm.expenseItems.length >= 20"
              >
                항목 추가
              </button>
            </div>
          </div>

          <!-- 결재 모드일 때 승인/반려 버튼 표시 -->
          <div v-if="isApprovalMode" class="approval-actions">
            <!-- 최종 승인 상태(C)일 때는 다운로드 버튼 -->
            <button 
              v-if="currentExpenseClaim?.approvalStatus === 'C'"
              type="button"
              @click="handleDownloadExpenseClaim"
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
      alt-text="비용 항목 도움말"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createExpenseClaim, updateExpenseClaim, getExpenseClaim, downloadExpenseClaim, type ExpenseClaimRequest, type ExpenseItem } from '@/api/user'
import { 
  approveExpenseClaimByTeamLeader, 
  rejectExpenseClaimByTeamLeader, 
  approveExpenseClaimByDivisionHead, 
  rejectExpenseClaimByDivisionHead,
  uploadExpenseItemFile,
  downloadExpenseItemFile as downloadExpenseItemFileApi,
  deleteExpenseItemFile as deleteExpenseItemFileApi
} from '@/api/user'
import HelpModal from '@/components/HelpModal.vue'
import expenseImage from '@/assets/image/help/expense.png'
import { getTodayDate } from '@/utils/formatUtils'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.seq)
const isApprovalMode = computed(() => route.query.approval === 'true')
const expenseSeq = computed(() => route.params.seq ? Number(route.params.seq) : null)

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

// 도움말 모달 열기
const showHelpModal = (imageKey: string) => {
  if (imageKey === 'expense') {
    helpModal.imageSrc = expenseImage
  }
  helpModal.isOpen = true
}

// 도움말 모달 닫기
const closeHelpModal = () => {
  helpModal.isOpen = false
}

// getTodayDate는 공통 유틸리티에서 import하여 사용

const expenseForm = reactive<{
  requestDate: string
  month: number | null
  expenseItems: (ExpenseItem & { selectedFile?: File })[]
}>({
  requestDate: getTodayDate(),
  month: null,
  expenseItems: [
    {
      date: '',
      usageDetail: '',
      vendor: '',
      paymentMethod: '',
      project: '',
      amount: 0,
      note: ''
    }
  ]
})

const isSubmitting = ref(false)
const isDownloading = ref(false)
const user = ref<{ authVal: string; name?: string } | null>(null)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const currentExpenseClaim = ref<any>(null)
const fileInputRefs = ref<{ [key: number]: HTMLInputElement }>({})
const uploadingFiles = ref<{ [key: number]: boolean }>({})

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

// 비용 항목 금액 입력 처리
const handleExpenseAmountInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  const numValue = value ? Number(value) : 0
  
  if (expenseForm.expenseItems[index]) {
    expenseForm.expenseItems[index].amount = numValue
  }
  target.value = value || ''
}

// 비용 항목 추가 (최대 20개)
const addExpenseItem = () => {
  if (expenseForm.expenseItems.length < 20) {
    expenseForm.expenseItems.push({
      date: '',
      usageDetail: '',
      vendor: '',
      paymentMethod: '',
      project: '',
      amount: 0,
      note: ''
    })
  }
}

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 항목별 파일 선택 처리
const handleExpenseItemFileSelect = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.')
      target.value = ''
      return
    }
    
    // 파일 확장자 검증
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      alert('PNG, JPG, PDF 파일만 업로드 가능합니다.')
      target.value = ''
      return
    }
    
    expenseForm.expenseItems[index].selectedFile = file
  }
}

// 항목별 파일 삭제 (선택된 파일)
const removeExpenseItemFile = (index: number) => {
  expenseForm.expenseItems[index].selectedFile = undefined
  if (fileInputRefs.value[index]) {
    fileInputRefs.value[index].value = ''
  }
}

// 항목별 파일 다운로드
const downloadExpenseItemFile = async (index: number) => {
  const item = expenseForm.expenseItems[index]
  if (!item.expenseSubSeq || !expenseSeq.value) return
  
  try {
    const { blob, filename } = await downloadExpenseItemFileApi(expenseSeq.value, item.expenseSubSeq)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('파일 다운로드 실패:', error)
    alert('파일 다운로드에 실패했습니다.')
  }
}

// 항목별 파일 삭제 (기존 파일)
const deleteExpenseItemFile = async (index: number) => {
  const item = expenseForm.expenseItems[index]
  if (!item.expenseSubSeq || !expenseSeq.value) return
  
  if (!confirm('첨부파일을 삭제하시겠습니까?')) {
    return
  }
  
  try {
    await deleteExpenseItemFileApi(expenseSeq.value, item.expenseSubSeq)
    item.attachment = undefined
    alert('첨부파일이 삭제되었습니다.')
  } catch (error) {
    console.error('파일 삭제 실패:', error)
    alert('파일 삭제에 실패했습니다.')
  }
}

// 비용 항목 삭제
const removeExpenseItem = (index: number) => {
  if (expenseForm.expenseItems.length > 1) {
    expenseForm.expenseItems.splice(index, 1)
  }
}

onMounted(async () => {
  // 사용자 정보 로드
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  
  // 수정 모드 또는 결재 모드인 경우 기존 데이터 로드
  if ((isEditMode.value || isApprovalMode.value) && expenseSeq.value) {
    await loadExpenseClaimData(expenseSeq.value)
  }
})

// 기존 개인 비용 신청 데이터 로드
const loadExpenseClaimData = async (seq: number) => {
  try {
    const response = await getExpenseClaim(seq)
    const detail = response.resultMsg
    
    if (detail) {
      const claim = detail
      currentExpenseClaim.value = claim
      expenseForm.requestDate = claim.requestDate || getTodayDate()
      expenseForm.month = claim.billingYyMonth ? Math.floor(claim.billingYyMonth % 100) : null
      
      // 비용 항목 목록 채우기
      if (detail.expenseSubList && detail.expenseSubList.length > 0) {
        expenseForm.expenseItems = detail.expenseSubList.map((sub) => {
          return {
            date: sub.date || '',
            usageDetail: sub.usageDetail || '',
            vendor: sub.vendor || '',
            paymentMethod: sub.paymentMethod || '',
            project: sub.project || '',
            amount: sub.amount || 0,
            note: sub.note || '',
            expenseSubSeq: sub.seq,
            attachment: sub.attachment // 서버에서 이미 첨부파일 정보를 포함하여 전달
          }
        })
      }
    }
  } catch (error) {
    console.error('개인 비용 신청 데이터 조회 실패:', error)
    alert('개인 비용 신청 데이터를 불러오는데 실패했습니다.')
    if (isApprovalMode.value) {
      router.push('/approval-list')
    } else {
      router.push('/my-applications')
    }
  }
}

// 승인 가능 여부 확인
const canApprove = computed(() => {
  if (!user.value || !currentExpenseClaim.value) return false
  const authVal = user.value.authVal
  const status = currentExpenseClaim.value.approvalStatus || 'A'
  
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
  if (!user.value || !currentExpenseClaim.value) return false
  const authVal = user.value.authVal
  const status = currentExpenseClaim.value.approvalStatus || 'A'
  
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
  if (!expenseSeq.value || !user.value) return
  
  if (!confirm('승인하시겠습니까?')) {
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await approveExpenseClaimByTeamLeader(expenseSeq.value)
    } else if (authVal === 'bb') {
      await approveExpenseClaimByDivisionHead(expenseSeq.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentExpenseClaim.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await approveExpenseClaimByTeamLeader(expenseSeq.value)
      } else if (status === 'B') {
        await approveExpenseClaimByDivisionHead(expenseSeq.value)
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

// 개인 비용 청구서 다운로드
const handleDownloadExpenseClaim = async () => {
  if (!expenseSeq.value) return
  
  isDownloading.value = true
  try {
    const applicant = currentExpenseClaim.value?.userId ? 
      (user.value?.name || '') : undefined
    const { blob, filename } = await downloadExpenseClaim(expenseSeq.value, applicant)
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
  if (!expenseSeq.value || !user.value || !rejectionReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await rejectExpenseClaimByTeamLeader(expenseSeq.value, rejectionReason.value)
    } else if (authVal === 'bb') {
      await rejectExpenseClaimByDivisionHead(expenseSeq.value, rejectionReason.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentExpenseClaim.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await rejectExpenseClaimByTeamLeader(expenseSeq.value, rejectionReason.value)
      } else if (status === 'B') {
        await rejectExpenseClaimByDivisionHead(expenseSeq.value, rejectionReason.value)
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

const submitExpenseApplication = async () => {
  // 필수 항목 검증
  if (!expenseForm.requestDate || !expenseForm.month || expenseForm.expenseItems.length === 0) {
    alert('신청일자, 청구 월, 비용 항목을 입력해주세요.')
    return
  }

  // 비용 항목 검증 (최소 1개 이상, 금액이 0보다 큰 항목이 있어야 함)
  const validItems = expenseForm.expenseItems.filter(item => 
    item.date && item.amount && item.amount > 0
  )
  
  if (validItems.length === 0) {
    alert('최소 1개 이상의 유효한 비용 항목을 입력해주세요. (일자와 금액 필수)')
    return
  }

  isSubmitting.value = true
  try {
    const request: ExpenseClaimRequest = {
      requestDate: expenseForm.requestDate,
      month: expenseForm.month,
      expenseItems: validItems.map(item => ({
        date: item.date,
        usageDetail: item.usageDetail || undefined,
        vendor: item.vendor || undefined,
        paymentMethod: item.paymentMethod || undefined,
        project: item.project || undefined,
        amount: item.amount || 0,
        note: item.note || undefined
      }))
    }
    
    let savedSeq: number | null = null
    
    if (isEditMode.value && expenseSeq.value) {
      // 수정 모드
      await updateExpenseClaim(expenseSeq.value, request)
      savedSeq = expenseSeq.value
      
      // 수정 후 항목 목록 다시 조회하여 expenseSubSeq 확인
      const detailResponse = await getExpenseClaim(expenseSeq.value)
      if (detailResponse.resultMsg && detailResponse.resultMsg.expenseSubList) {
        const expenseSubList = detailResponse.resultMsg.expenseSubList
        // 각 항목의 파일 업로드
        for (let i = 0; i < expenseForm.expenseItems.length; i++) {
          const item = expenseForm.expenseItems[i]
          if (item.selectedFile && expenseSubList[i] && expenseSubList[i].seq) {
            try {
              uploadingFiles.value[i] = true
              await uploadExpenseItemFile(expenseSeq.value, expenseSubList[i].seq, item.selectedFile)
              item.selectedFile = undefined
            } catch (error) {
              console.error(`항목 ${i + 1} 파일 업로드 실패:`, error)
            } finally {
              uploadingFiles.value[i] = false
            }
          }
        }
      }
      
      alert('수정되었습니다.')
      router.push('/my-applications')
    } else {
      // 신청 모드
      const response = await createExpenseClaim(request)
      // 성공 페이지로 리다이렉트 (신청 타입과 seq 전달)
      if (response.resultMsg && response.resultMsg.seq) {
        savedSeq = response.resultMsg.seq
        
        // 신청 후 항목 목록 다시 조회하여 expenseSubSeq 확인
        const detailResponse = await getExpenseClaim(savedSeq)
        if (detailResponse.resultMsg && detailResponse.resultMsg.expenseSubList) {
          const expenseSubList = detailResponse.resultMsg.expenseSubList
          // 각 항목의 파일 업로드
          for (let i = 0; i < expenseForm.expenseItems.length; i++) {
            const item = expenseForm.expenseItems[i]
            if (item.selectedFile && expenseSubList[i] && expenseSubList[i].seq) {
              try {
                uploadingFiles.value[i] = true
                await uploadExpenseItemFile(savedSeq, expenseSubList[i].seq, item.selectedFile)
                item.selectedFile = undefined
              } catch (error) {
                console.error(`항목 ${i + 1} 파일 업로드 실패:`, error)
              } finally {
                uploadingFiles.value[i] = false
              }
            }
          }
        }
        
        router.push({
          path: '/application-success',
          query: {
            type: 'expense',
            seq: savedSeq
          }
        })
      } else {
        router.push('/my-applications')
      }
    }
  } catch (error: any) {
    console.error(isEditMode.value ? '개인 비용 수정 실패:' : '개인 비용 신청 실패:', error)
    // BaseController를 통한 에러 응답: error.response.data.resultMsg.errorMessage
    // GlobalExceptionHandler를 통한 에러 응답: error.response.data.errorMessage
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || 
                        error.response?.data?.errorMessage || 
                        error.message || 
                        (isEditMode.value ? '개인 비용 수정에 실패했습니다.' : '개인 비용 신청에 실패했습니다.')
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.expense-application-view {
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

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #17ccff;
  box-shadow: 0 0 0 3px rgba(23, 204, 255, 0.1);
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

.expense-items-section {
  margin-top: 1rem;
}

.expense-items-section h3 {
  margin: 1.5rem 0 1rem;
  color: #666;
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

.expense-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fafafa;
}

.expense-item h4 {
  margin-bottom: 1rem;
  color: #1226aa;
}

.expense-item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.expense-item-grid .form-group.full-width {
  grid-column: 1 / -1;
}

.expense-item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.expense-items-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
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
  .expense-application-view {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .department-select-group {
    flex-direction: column;
  }

  .expense-item-grid {
    grid-template-columns: 1fr;
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

.btn-download {
  background-color: #1226aa;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background-color: #0f1f88;
}

/* 파일 업로드 스타일 */
.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.file-input-label:hover {
  background-color: #e9ecef;
}

.file-input-text {
  color: #666;
}

.selected-file,
.existing-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.file-name {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.file-size {
  color: #666;
  font-size: 0.85rem;
}

.btn-remove-file,
.btn-download-file {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-remove-file {
  background-color: #dc3545;
  color: white;
}

.btn-remove-file:hover {
  background-color: #c82333;
}

.btn-download-file {
  background-color: #1226aa;
  color: white;
}

.btn-download-file:hover {
  background-color: #0f1f88;
}
</style>

