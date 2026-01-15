<template>
  <div class="vacation-application-view">
    <div class="header-section">
      <div class="header-title-wrapper">
        <h1>{{ isApprovalMode ? '휴가(결무) 결재' : (isEditMode ? '휴가(결무) 수정' : '휴가(결무) 신청') }}</h1>
        <button v-if="isEditMode || isApprovalMode" @click="goBack" class="btn-back">뒤로가기</button>
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
              :disabled="isApprovalMode"
              required 
            />
          </div>

          <div class="form-group">
            <label>시작일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="vacationForm.startDate" 
              :min="minStartDate"
              :disabled="isApprovalMode"
              required 
            />
          </div>

          <div class="form-group">
            <label>종료일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="vacationForm.endDate" 
              :min="minEndDate"
              :disabled="isApprovalMode"
              required 
            />
          </div>

          <div class="form-group">
            <label>휴가 구분 <span class="required">*</span></label>
            <select v-model="vacationForm.vacationType" :disabled="isApprovalMode" required>
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
              :disabled="isApprovalMode"
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
            <textarea v-model="vacationForm.reason" rows="3" :disabled="isApprovalMode"></textarea>
          </div>

          <!-- 첨부파일 -->
          <div class="form-group">
            <label>첨부파일</label>
            <div class="file-upload-section">
              <!-- 파일 선택 input -->
              <div v-if="!isApprovalMode" class="file-input-wrapper">
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileSelect"
                  accept=".png,.jpg,.jpeg,.pdf"
                  class="file-input"
                  id="vacation-file-input"
                />
                <label for="vacation-file-input" class="file-input-label">
                  <span class="file-input-text">파일 선택 (PNG, JPG, PDF, 최대 10MB)</span>
                </label>
              </div>
              
              <!-- 선택된 파일 표시 -->
              <div v-if="selectedFile" class="selected-file">
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
                <button 
                  v-if="!isApprovalMode" 
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
                  v-if="!isApprovalMode" 
                  type="button" 
                  @click="removeExistingFile" 
                  class="btn-remove-file"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>

          <!-- 반려 상태일 때 반려 사유 표시 -->
          <div v-if="(currentVacation?.approvalStatus === 'RB' || currentVacation?.approvalStatus === 'RC') && rejectionReasonFromServer" class="form-group rejection-reason-group">
            <label class="rejection-label">반려 사유</label>
            <div class="rejection-reason-box">
              {{ rejectionReasonFromServer }}
            </div>
          </div>

          <!-- 결재 모드일 때 승인/반려 버튼 또는 다운로드 버튼 표시 -->
          <div v-if="isApprovalMode" class="approval-actions">
            <!-- 최종 승인 상태(C)일 때는 다운로드 버튼 -->
            <button 
              v-if="currentVacation?.approvalStatus === 'C'"
              type="button"
              @click="handleDownloadVacation"
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
          <button v-else type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? (isEditMode ? '수정 중...' : '신청 중...') : (isEditMode ? '수정하기' : '신청하기') }}
          </button>
        </form>
      </div>
    </div>

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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserVacationInfo, type UserVacationInfoResponse } from '@/api/user'
import { getVacationHistory, downloadVacationDocument, type VacationRequest, type VacationHistory } from '@/api/vacation'
import { 
  approveVacationByTeamLeader, 
  rejectVacationByTeamLeader, 
  approveVacationByDivisionHead, 
  rejectVacationByDivisionHead 
} from '@/api/user'
import apiClient from '@/api/axios'

const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.seq)
const isApprovalMode = computed(() => route.query.approval === 'true')
const vacationSeq = computed(() => route.params.seq ? Number(route.params.seq) : null)

// 뒤로가기 함수
const goBack = () => {
  if (isApprovalMode.value) {
    router.push('/approval-list')
  } else {
    router.push('/my-applications')
  }
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
const isDownloading = ref(false)
const user = ref<{ authVal: string; name?: string } | null>(null)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const rejectionReasonFromServer = ref<string | null>(null)
const isDataLoaded = ref(false) // 초기 데이터 로드 완료 여부
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const existingAttachment = ref<{ seq: number; fileName: string; fileSize: number } | null>(null)

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
  let options: number[] = []
  
  if (baseDays <= 0) {
    // 계산된 값이 없을 때
    // 수정 모드이고 기존 period가 있으면 그것만 포함
    if (isEditMode.value && currentVacation.value?.period) {
      options = [currentVacation.value.period]
    }
    return options
  }
  
  // 같은 날이면 1일과 0.5일
  if (isSameDay.value) {
    options = [1, 0.5]
  } else {
    // 다른 날이면 계산된 값과 계산된 값 - 0.5
    options = [baseDays, baseDays - 0.5]
  }
  
  // 수정 모드이고 기존 period가 옵션에 없으면 추가
  if (isEditMode.value && currentVacation.value?.period) {
    const existingPeriod = currentVacation.value.period
    if (!options.includes(existingPeriod)) {
      options.push(existingPeriod)
      // 중복 제거 및 내림차순 정렬
      options = [...new Set(options)].sort((a, b) => b - a)
    }
  }
  
  return options
})

// 시작일과 종료일이 변경될 때 신청연차일수 초기화
watch([() => vacationForm.value.startDate, () => vacationForm.value.endDate], () => {
  // 초기 데이터 로드가 완료되지 않았으면 watch 실행하지 않음 (초기값 유지)
  if (!isDataLoaded.value) {
    return
  }
  
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

// 수정 모드에서 신청연차일수가 변경되면 잔여연차일수 자동 계산
watch(() => vacationForm.value.requestedVacationDays, (newValue) => {
  if (isEditMode.value && vacationForm.value.previousRemainingDays != null) {
    // 잔여 연차 = 직전 잔여 연차 - 신청 연차 일수
    vacationForm.value.remainingVacationDays = vacationForm.value.previousRemainingDays - (newValue || 0)
  }
}, { immediate: false })

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
  
  // 연차 정보 로드 (결재 모드가 아닐 때만)
  if (!isApprovalMode.value) {
    await loadVacationInfo()
  }
  
  // 수정 모드 또는 결재 모드인 경우 기존 데이터 로드
  if ((isEditMode.value || isApprovalMode.value) && vacationSeq.value) {
    await loadVacationData(vacationSeq.value)
  } else {
    // 신청 모드인 경우 신청일자를 오늘로 설정
    vacationForm.value.requestDate = getTodayDate()
    // 신청 모드에서는 즉시 watch가 동작하도록 설정
    isDataLoaded.value = true
  }
})

// 기존 휴가 데이터 로드
const loadVacationData = async (seq: number) => {
  try {
    // 초기 데이터 로드 중에는 watch가 실행되지 않도록 설정
    isDataLoaded.value = false
    
    const response = await getVacationHistory(seq)
    const result = response.resultMsg
    
    if (result) {
      // API 응답이 객체인 경우 (vacationHistory와 rejectionReason 포함)
      const vacation = result.vacationHistory || result
      
      // 첨부파일 정보 저장
      if (result.attachment) {
        existingAttachment.value = {
          seq: result.attachment.seq,
          fileName: result.attachment.fileName,
          fileSize: result.attachment.fileSize
        }
      } else {
        existingAttachment.value = null
      }
      
      // 수정 모드에서 표시할 연차 정보 저장
      currentVacation.value = vacation
      
      // 모든 데이터를 먼저 설정
      vacationForm.value.requestDate = vacation.requestDate || getTodayDate()
      vacationForm.value.vacationType = vacation.type
      vacationForm.value.reason = vacation.reason || ''
      // 연차 정보도 폼에 로드
      vacationForm.value.annualVacationDays = vacation.annualVacationDays || 0
      vacationForm.value.previousRemainingDays = vacation.previousRemainingDays || 0
      vacationForm.value.remainingVacationDays = vacation.remainingVacationDays || 0
      
      // requestedVacationDays를 먼저 설정 (watch가 실행되지 않도록)
      vacationForm.value.requestedVacationDays = vacation.period
      
      // startDate와 endDate를 나중에 설정 (이때 watch가 실행되지만 requestedVacationDays는 이미 설정됨)
      vacationForm.value.startDate = vacation.startDate
      vacationForm.value.endDate = vacation.endDate
      
      // 반려 사유 저장
      if (result.rejectionReason) {
        rejectionReasonFromServer.value = result.rejectionReason
      } else {
        rejectionReasonFromServer.value = null
      }
      
      // 모든 데이터 로드 완료 후 watch 활성화
      // nextTick을 사용하여 현재 실행 중인 watch가 완료된 후에 활성화
      await nextTick()
      isDataLoaded.value = true
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

// 승인 가능 여부 확인
const canApprove = computed(() => {
  if (!user.value || !currentVacation.value) return false
  const authVal = user.value.authVal
  const status = currentVacation.value.approvalStatus || 'A'
  
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
  if (!user.value || !currentVacation.value) return false
  const authVal = user.value.authVal
  const status = currentVacation.value.approvalStatus || 'A'
  
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
  if (!vacationSeq.value || !user.value) return
  
  if (!confirm('승인하시겠습니까?')) {
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await approveVacationByTeamLeader(vacationSeq.value)
    } else if (authVal === 'bb') {
      await approveVacationByDivisionHead(vacationSeq.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentVacation.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await approveVacationByTeamLeader(vacationSeq.value)
      } else if (status === 'B') {
        await approveVacationByDivisionHead(vacationSeq.value)
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
  if (!vacationSeq.value || !existingAttachment.value) return
  
  try {
    const response = await apiClient.get(`/vacation/history/${vacationSeq.value}/attachment`, {
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

// 휴가 신청서 다운로드
const handleDownloadVacation = async () => {
  if (!vacationSeq.value) return
  
  isDownloading.value = true
  try {
    const applicant = (user.value as any)?.name || ''
    const { blob, filename } = await downloadVacationDocument(vacationSeq.value, applicant)
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

// 반려 확정 처리
const confirmReject = async () => {
  if (!vacationSeq.value || !user.value || !rejectionReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  
  isSubmitting.value = true
  try {
    const authVal = user.value.authVal
    
    if (authVal === 'tj') {
      await rejectVacationByTeamLeader(vacationSeq.value, rejectionReason.value)
    } else if (authVal === 'bb') {
      await rejectVacationByDivisionHead(vacationSeq.value, rejectionReason.value)
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할에 따라 처리
      const status = currentVacation.value?.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        await rejectVacationByTeamLeader(vacationSeq.value, rejectionReason.value)
      } else if (status === 'B') {
        await rejectVacationByDivisionHead(vacationSeq.value, rejectionReason.value)
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
      period: vacationForm.value.requestedVacationDays,
      reason: vacationForm.value.reason || ''
    }
    
    // 수정 모드용 연차 정보 추가
    if (isEditMode.value) {
      request.annualVacationDays = vacationForm.value.annualVacationDays
      request.previousRemainingDays = vacationForm.value.previousRemainingDays
      request.remainingVacationDays = vacationForm.value.remainingVacationDays
    }
    
    // FormData 생성
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
    formData.append('vacationRequest', jsonBlob, 'vacationRequest.json')
    
    // 파일이 있으면 추가
    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }
    
    if (isEditMode.value && vacationSeq.value) {
      // 수정 모드
      await apiClient.put(`/vacation/${vacationSeq.value}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('수정되었습니다.')
      router.push('/my-applications')
    } else {
      // 신청 모드
      const response = await apiClient.post('/vacation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // 성공 페이지로 리다이렉트 (신청 타입과 seq 전달)
      if (response.data.resultMsg && response.data.resultMsg.seq) {
        router.push({
          path: '/application-success',
          query: {
            type: 'vacation',
            seq: response.data.resultMsg.seq
          }
        })
      } else {
        router.push('/my-applications')
      }
    }
  } catch (error: any) {
    console.error(isEditMode.value ? '휴가 수정 실패:' : '휴가 신청 실패:', error)
    // BaseController를 통한 에러 응답: error.response.data.resultMsg.errorMessage
    // GlobalExceptionHandler를 통한 에러 응답: error.response.data.errorMessage
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || 
                        error.response?.data?.errorMessage || 
                        error.message || 
                        (isEditMode.value ? '휴가 수정에 실패했습니다.' : '휴가 신청에 실패했습니다.')
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

.rejection-reason-group {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #dc3545;
}

.rejection-label {
  color: #dc3545;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.rejection-reason-box {
  background-color: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 1rem;
  color: #991b1b;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
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
</style>

