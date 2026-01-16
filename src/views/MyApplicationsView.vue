<template>
  <div class="my-applications-view">
    <div class="header-section">
      <h1>내 신청 목록</h1>
    </div>

    <div class="applications-container">
      <!-- 휴가 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>휴가 신청</h2>
        <div v-if="vacationHistoryAll.length === 0" class="empty-state">
          신청한 휴가가 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청일</th>
                <th>기간</th>
                <th>일수</th>
                <th>구분</th>
                <th>사유</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="vacation in vacationHistory" 
                :key="vacation.seq"
                @click="handleEditVacation(vacation.seq)"
                class="clickable-row"
              >
                <td>{{ formatDate(vacation.requestDate) }}</td>
                <td>{{ formatDate(vacation.startDate) }} ~ {{ formatDate(vacation.endDate) }}</td>
                <td>{{ vacation.period }}일</td>
                <td>{{ getVacationTypeName(vacation.type) }}</td>
                <td>{{ vacation.reason || '-' }}</td>
                <td>
                  <StatusBadge :status="vacation.approvalStatus" />
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      @click="handleDownloadVacation(vacation.seq)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === vacation.seq"
                    >
                      {{ isDownloading === vacation.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                    <button
                      v-if="canDelete(vacation.approvalStatus)"
                      @click="handleDeleteVacation(vacation.seq)"
                      class="btn btn-delete btn-small"
                      :disabled="isDeleting === vacation.seq"
                    >
                      {{ isDeleting === vacation.seq ? '삭제 중...' : '삭제' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <Pagination
          :current-page="vacationCurrentPage"
          :total-pages="vacationTotalPages"
          :show-pagination="showVacationPagination"
          @prev="vacationCurrentPage = Math.max(1, vacationCurrentPage - 1)"
          @next="vacationCurrentPage = Math.min(vacationTotalPages, vacationCurrentPage + 1)"
        />
      </div>

      <!-- 개인 비용 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>개인 비용 신청</h2>
        <div v-if="expenseClaimListAll.length === 0" class="empty-state">
          신청한 개인 비용이 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th>신청일</th>
                <th>청구월</th>
                <th>항목 수</th>
                <th>총 금액</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="expense in expenseClaimList" :key="expense.seq">
                <!-- 부모 행 -->
                <tr class="parent-row">
                  <td class="expand-icon" @click.stop="openExpenseDetailModal(expense.seq)">
                    <span class="icon">▶</span>
                  </td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatDate(expense.requestDate) }}</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatBillingYyMonth(expense.billingYyMonth) }}</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ expense.childCnt }}개</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatNumber(expense.totalAmount || 0) }}원</td>
                  <td>
                    <StatusBadge :status="expense.approvalStatus" />
                  </td>
                  <td @click.stop>
                    <div class="action-buttons">
                      <button
                        @click="handleDownloadExpenseClaim(expense.seq)"
                        class="btn btn-download btn-small"
                        :disabled="isDownloading === expense.seq"
                      >
                        {{ isDownloading === expense.seq ? '다운로드 중...' : '다운로드' }}
                      </button>
                      <button
                        v-if="canDelete(expense.approvalStatus)"
                        @click="handleDeleteExpenseClaim(expense.seq)"
                        class="btn btn-delete btn-small"
                        :disabled="isDeleting === expense.seq"
                      >
                        {{ isDeleting === expense.seq ? '삭제 중...' : '삭제' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <Pagination
          :current-page="expenseCurrentPage"
          :total-pages="expenseTotalPages"
          :show-pagination="showExpensePagination"
          @prev="expenseCurrentPage = Math.max(1, expenseCurrentPage - 1)"
          @next="expenseCurrentPage = Math.min(expenseTotalPages, expenseCurrentPage + 1)"
        />
      </div>

      <!-- 월세 지원 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>월세 지원 신청</h2>
        <div v-if="rentalSupportApplicationListAll.length === 0" class="empty-state">
          신청한 월세 지원 신청이 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청일</th>
                <th>청구월</th>
                <th>청구 기간</th>
                <th>계약 월세</th>
                <th>청구 금액</th>
                <th>납입일</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="rental in rentalSupportApplicationList" 
                :key="rental.seq"
                @click="handleEditRentalApplication(rental.seq)"
                class="clickable-row"
              >
                <td>{{ formatDate(rental.requestDate) }}</td>
                <td>{{ formatBillingYyMonth(rental.billingYyMonth || 0) }}</td>
                <td>{{ formatDate(rental.billingPeriodStartDate) }} ~ {{ formatDate(rental.billingPeriodEndDate) }}</td>
                <td>{{ formatNumber(rental.contractMonthlyRent) }}원</td>
                <td>{{ formatNumber(rental.billingAmount) }}원</td>
                <td>{{ formatDate(rental.paymentDate) }}</td>
                <td>
                  <StatusBadge :status="rental.approvalStatus" />
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      @click="handleDownloadRentalApplication(rental.seq)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === rental.seq"
                    >
                      {{ isDownloading === rental.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                    <button
                      v-if="canDelete(rental.approvalStatus)"
                      @click="handleDeleteRentalApplication(rental.seq)"
                      class="btn btn-delete btn-small"
                      :disabled="isDeleting === rental.seq"
                    >
                      {{ isDeleting === rental.seq ? '삭제 중...' : '삭제' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <Pagination
          :current-page="rentalCurrentPage"
          :total-pages="rentalTotalPages"
          :show-pagination="showRentalPagination"
          @prev="rentalCurrentPage = Math.max(1, rentalCurrentPage - 1)"
          @next="rentalCurrentPage = Math.min(rentalTotalPages, rentalCurrentPage + 1)"
        />
      </div>

      <!-- 월세 지원 품의 목록 (기존 형식 유지) -->
      <div class="application-section">
        <h2>월세 지원 품의</h2>
        <div v-if="rentalSupportList.length === 0" class="empty-state">
          신청한 월세 지원 품의가 없습니다.
        </div>
        <div v-else class="application-list">
          <div
            v-for="rental in rentalSupportList"
            :key="rental.seq"
            class="application-item"
            @click="editRentalProposal(rental)"
          >
            <div class="application-info">
              <div class="info-row">
                <span class="label">계약 주소:</span>
                <span class="value">{{ rental.rentalAddress }}</span>
              </div>
              <div class="info-row">
                <span class="label">계약 기간:</span>
                <span class="value">{{ formatDate(rental.contractStartDate) }} ~ {{ formatDate(rental.contractEndDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">계약 월세:</span>
                <span class="value">{{ formatNumber(rental.contractMonthlyRent) }}원</span>
              </div>
              <div class="info-row">
                <span class="label">청구 금액:</span>
                <span class="value">{{ formatNumber(rental.billingAmount) }}원</span>
              </div>
              <div class="info-row">
                <span class="label">청구 개시일:</span>
                <span class="value">{{ formatDate(rental.billingStartDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">승인상태:</span>
                <StatusBadge :status="rental.approvalStatus" />
              </div>
            </div>
            <div class="application-actions">
              <button
                @click="downloadRentalProposalDocument(rental.seq)"
                class="btn btn-download"
                :disabled="isDownloading === rental.seq"
              >
                {{ isDownloading === rental.seq ? '다운로드 중...' : '다운로드' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 개인 비용 상세 모달 -->
    <div v-if="showExpenseDetailModal" class="modal-overlay" @click="closeExpenseDetailModal">
      <div class="modal-content expense-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>개인 비용 상세 내역</h2>
          <button class="modal-close-btn" @click="closeExpenseDetailModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedExpenseDetail" class="expense-detail-container">
            <table class="expense-detail-table">
              <thead>
                <tr>
                  <th>일자</th>
                  <th>사용 내역</th>
                  <th>거래처</th>
                  <th>결재방법</th>
                  <th>프로젝트</th>
                  <th>금액</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sub in selectedExpenseDetail.expenseSubList || []" :key="sub.seq">
                  <td>{{ formatDate(sub.date) }}</td>
                  <td>{{ sub.usageDetail || '-' }}</td>
                  <td>{{ sub.vendor || '-' }}</td>
                  <td>{{ sub.paymentMethod || '-' }}</td>
                  <td>{{ sub.project || '-' }}</td>
                  <td>{{ formatNumber(sub.amount) }}원</td>
                  <td>{{ sub.note || '-' }}</td>
                </tr>
                <tr v-if="!selectedExpenseDetail.expenseSubList || selectedExpenseDetail.expenseSubList.length === 0">
                  <td colspan="7" style="text-align: center; padding: 2rem; color: #999;">
                    상세 내역이 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 월세 지원 품의 수정 모달 -->
    <div v-if="showRentalProposalModal" class="modal-overlay" @click="closeRentalProposalForm">
      <div class="modal-content rental-proposal-modal" @click.stop>
        <div class="modal-header">
          <h3>월세 지원 품의 수정</h3>
          <button @click="closeRentalProposalForm" class="btn-close">×</button>
        </div>
        <form @submit.prevent="saveRentalProposal" class="rental-form">
          <div class="form-group">
            <label>기존 거주지 주소</label>
            <input type="text" v-model="rentalProposalForm.previousAddress" />
          </div>

          <div class="form-group">
            <label>월세 계약 주소 <span class="required">*</span></label>
            <input type="text" v-model="rentalProposalForm.rentalAddress" required />
          </div>

          <div class="form-group">
            <label>월세 계약 시작일 <span class="required">*</span></label>
            <input type="date" v-model="rentalProposalForm.contractStartDate" required />
          </div>

          <div v-if="rentalProposalForm.contractStartDate" class="form-group">
            <label>계약 단위 <span class="required">*</span></label>
            <select v-model="rentalProposalForm.contractTermUnit" required class="form-select">
              <option value="">선택</option>
              <option value="1년">1년</option>
              <option value="2년">2년</option>
              <option value="직접입력">직접입력</option>
            </select>
          </div>

          <div class="form-group">
            <label>월세 계약 종료일 <span class="required">*</span></label>
            <input
              type="date"
              v-model="rentalProposalForm.contractEndDate"
              :disabled="rentalProposalForm.contractTermUnit !== '직접입력' && rentalProposalForm.contractTermUnit !== ''"
              required
            />
          </div>

          <div class="form-group">
            <label>계약 월세 금액(원) <span class="required">*</span></label>
            <div class="input-with-unit">
              <input
                type="text"
                v-model="rentalProposalForm.contractMonthlyRent"
                @input="handleRentalNumberInput($event, 'contractMonthlyRent')"
                @keypress="handleKeyPress"
                required
              />
              <div v-if="rentalProposalForm.contractMonthlyRent >= 10000" class="unit-text-below">
                {{ formatKoreanWon(rentalProposalForm.contractMonthlyRent) }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>월세 청구 금액(원) <span class="required">*</span></label>
            <div class="input-with-unit">
              <input
                type="text"
                v-model="rentalProposalForm.billingAmount"
                @input="handleRentalNumberInput($event, 'billingAmount')"
                @keypress="handleKeyPress"
                required
              />
              <div v-if="rentalProposalForm.billingAmount >= 10000" class="unit-text-below">
                {{ formatKoreanWon(rentalProposalForm.billingAmount) }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>월세 청구 개시일 <span class="required">*</span></label>
            <input type="date" v-model="rentalProposalForm.billingStartDate" required />
          </div>

          <div class="form-group">
            <label>월세 청구 사유</label>
            <textarea v-model="rentalProposalForm.billingReason" rows="3"></textarea>
          </div>

          <!-- 첨부파일 -->
          <div class="form-group">
            <label>첨부파일</label>
            <div class="file-upload-section">
              <!-- 파일 선택 input -->
              <div class="file-input-wrapper">
                <input
                  type="file"
                  ref="rentalProposalFileInput"
                  @change="handleRentalProposalFileSelect"
                  accept=".png,.jpg,.jpeg,.pdf"
                  class="file-input"
                  id="rental-proposal-edit-file-input"
                />
                <label for="rental-proposal-edit-file-input" class="file-input-label">
                  <span class="file-input-text">파일 선택 (PNG, JPG, PDF, 최대 10MB)</span>
                </label>
              </div>
              
              <!-- 선택된 파일 표시 -->
              <div v-if="rentalProposalSelectedFile" class="selected-file">
                <span class="file-name">{{ rentalProposalSelectedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(rentalProposalSelectedFile.size) }})</span>
                <button 
                  type="button" 
                  @click="removeRentalProposalSelectedFile" 
                  class="btn-remove-file"
                >
                  삭제
                </button>
              </div>
              
              <!-- 기존 첨부파일 표시 -->
              <div v-if="rentalProposalExistingAttachment && !rentalProposalSelectedFile" class="existing-file">
                <span class="file-name">{{ rentalProposalExistingAttachment.fileName }}</span>
                <span class="file-size">({{ formatFileSize(rentalProposalExistingAttachment.fileSize) }})</span>
                <button 
                  type="button" 
                  @click="downloadRentalProposalAttachment" 
                  class="btn-download-file"
                >
                  다운로드
                </button>
                <button 
                  type="button" 
                  @click="removeRentalProposalExistingFile" 
                  class="btn-remove-file"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeRentalProposalForm" class="btn btn-cancel">취소</button>
            <button type="submit" class="btn btn-save" :disabled="isSavingRentalProposal">
              {{ isSavingRentalProposal ? '수정 중...' : '수정' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getVacationHistoryList, downloadVacationDocument, deleteVacation, type VacationHistory } from '@/api/vacation'
import { 
  getRentalSupportList, 
  getRentalSupportApplicationList, 
  getExpenseClaimList,
  getExpenseClaim,
  deleteExpenseClaim,
  deleteRentalSupportApplication,
  downloadExpenseClaim,
  downloadRentalSupportApplication,
  downloadRentalProposal,
  updateRentalSupport,
  getRentalSupport,
  type RentalSupport,
  type ExpenseClaim,
  type ExpenseClaimDetail
} from '@/api/user'
import apiClient from '@/api/axios'
import { formatDate, formatNumber, formatBillingYyMonth } from '@/utils/formatUtils'
import { canDelete } from '@/utils/statusUtils'
import { getVacationTypeName } from '@/utils/vacationUtils'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()

// 전체 데이터 저장
const vacationHistoryAll = ref<VacationHistory[]>([])
const expenseClaimListAll = ref<ExpenseClaim[]>([])
const rentalSupportApplicationListAll = ref<RentalSupport[]>([])

// totalCount 저장
const vacationTotalCount = ref(0)
const expenseTotalCount = ref(0)
const rentalTotalCount = ref(0)

// 페이징 관련
const itemsPerPage = 5
const vacationCurrentPage = ref(1)
const expenseCurrentPage = ref(1)
const rentalCurrentPage = ref(1)

// 페이지별 데이터 (서버에서 페이징된 데이터를 그대로 사용)
const vacationHistory = computed(() => vacationHistoryAll.value)
const expenseClaimList = computed(() => expenseClaimListAll.value)
const rentalSupportApplicationList = computed(() => rentalSupportApplicationListAll.value)

// 총 페이지 수 계산 (totalCount 사용)
const vacationTotalPages = computed(() => Math.ceil(vacationTotalCount.value / itemsPerPage))
const expenseTotalPages = computed(() => Math.ceil(expenseTotalCount.value / itemsPerPage))
const rentalTotalPages = computed(() => Math.ceil(rentalTotalCount.value / itemsPerPage))

// 페이지 버튼 표시 여부 (totalCount가 5개 이상일 때만)
const showVacationPagination = computed(() => vacationTotalCount.value >= itemsPerPage)
const showExpensePagination = computed(() => expenseTotalCount.value >= itemsPerPage)
const showRentalPagination = computed(() => rentalTotalCount.value >= itemsPerPage)

const rentalSupportList = ref<RentalSupport[]>([])
const expenseDetailMap = ref<Record<number, ExpenseClaimDetail & { totalAmount: number }>>({})
const showExpenseDetailModal = ref(false)
const selectedExpenseDetail = ref<(ExpenseClaimDetail & { totalAmount: number }) | null>(null)
const isDownloading = ref<number | null>(null)
const isDeleting = ref<number | null>(null)

// 월세 지원 품의 수정 모달 관련
const showRentalProposalModal = ref(false)
const editingRentalProposal = ref<RentalSupport | null>(null)
const isSavingRentalProposal = ref(false)
const rentalProposalForm = ref({
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
const rentalProposalFileInput = ref<HTMLInputElement | null>(null)
const rentalProposalSelectedFile = ref<File | null>(null)
const rentalProposalExistingAttachment = ref<{ seq: number; fileName: string; fileSize: number } | null>(null)

// 데이터 로드 함수
const loadVacationHistory = async (page: number = 0) => {
  try {
    const vacationResponse = await getVacationHistoryList(page, itemsPerPage)
    const vacationData = vacationResponse.resultMsg as any
    vacationHistoryAll.value = vacationData?.list || []
    vacationTotalCount.value = vacationData?.totalCount || 0
  } catch (error) {
    console.error('휴가 신청 목록 조회 실패:', error)
  }
}

const loadExpenseClaimList = async (page: number = 0) => {
  try {
    const expenseResponse = await getExpenseClaimList(page, itemsPerPage)
    const expenseData = expenseResponse.resultMsg as any
    expenseClaimListAll.value = expenseData?.list || []
    expenseTotalCount.value = expenseData?.totalCount || 0
  } catch (error) {
    console.error('개인 비용 신청 목록 조회 실패:', error)
  }
}

const loadRentalApplicationList = async (page: number = 0) => {
  try {
    const rentalApplicationResponse = await getRentalSupportApplicationList(page, itemsPerPage)
    const rentalApplicationData = rentalApplicationResponse.resultMsg as any
    rentalSupportApplicationListAll.value = rentalApplicationData?.list || []
    rentalTotalCount.value = rentalApplicationData?.totalCount || 0
  } catch (error) {
    console.error('월세 지원 신청 목록 조회 실패:', error)
  }
}

// 페이지 변경 감지
watch(vacationCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadVacationHistory(newPage - 1) // 프론트엔드는 1부터 시작, 백엔드는 0부터 시작
  }
})

watch(expenseCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadExpenseClaimList(newPage - 1)
  }
})

watch(rentalCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadRentalApplicationList(newPage - 1)
  }
})

// 포맷팅 및 유틸리티 함수는 공통 유틸리티에서 import하여 사용

// 휴가 신청서 다운로드
const handleDownloadVacation = async (seq: number) => {
  isDownloading.value = seq
  try {
    // vacationHistory에서 해당 seq의 applicant 찾기
    const vacation = vacationHistoryAll.value.find(v => v.seq === seq)
    const applicant = vacation?.applicant
    
    const { blob, filename } = await downloadVacationDocument(seq, applicant)
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
    isDownloading.value = null
  }
}

// 월세 지원 신청서 다운로드
const handleDownloadRentalApplication = async (seq: number) => {
  isDownloading.value = seq
  try {
    // rentalSupportApplicationListAll에서 해당 seq의 applicant 찾기
    const rental = rentalSupportApplicationListAll.value.find(r => r.seq === seq)
    const applicant = rental?.applicant
    
    const { blob, filename } = await downloadRentalSupportApplication(seq, applicant)
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
    isDownloading.value = null
  }
}

// 휴가 신청 수정 페이지로 이동
const handleEditVacation = (seq: number) => {
  router.push(`/vacation-application/${seq}`)
}

// 월세 지원 신청 수정 페이지로 이동
const handleEditRentalApplication = (seq: number) => {
  router.push(`/rental-application/${seq}`)
}

// 개인 비용 신청 수정 페이지로 이동
const handleEditExpenseClaim = (seq: number) => {
  router.push(`/expense-application/${seq}`)
}

// 개인 비용 상세 정보 모달 열기
const openExpenseDetailModal = async (seq: number) => {
  // 상세 정보가 없으면 로드
  if (!expenseDetailMap.value[seq]) {
    try {
      const response = await getExpenseClaim(seq)
      const detail = response.resultMsg
      if (detail) {
        const totalAmount = detail.expenseSubList.reduce((sum, sub) => sum + (sub.amount || 0), 0)
        expenseDetailMap.value[seq] = {
          ...detail,
          totalAmount
        }
      }
    } catch (error) {
      console.error('개인 비용 상세 정보 조회 실패:', error)
      alert('상세 정보를 불러오는데 실패했습니다.')
      return
    }
  }
  
  selectedExpenseDetail.value = expenseDetailMap.value[seq]
  showExpenseDetailModal.value = true
}

// 개인 비용 상세 정보 모달 닫기
const closeExpenseDetailModal = () => {
  showExpenseDetailModal.value = false
  selectedExpenseDetail.value = null
}

// 개인 비용 청구서 다운로드
const handleDownloadExpenseClaim = async (seq: number) => {
  isDownloading.value = seq
  try {
    // expenseClaimListAll에서 해당 seq의 applicant 찾기
    const expense = expenseClaimListAll.value.find(e => e.seq === seq)
    const applicant = expense?.applicant
    
    const { blob, filename } = await downloadExpenseClaim(seq, applicant)
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
    isDownloading.value = null
  }
}

// 월세 지원 품의 수정 모달 열기
const editRentalProposal = async (rental: RentalSupport) => {
  editingRentalProposal.value = rental
  rentalProposalForm.value = {
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
    const response = await getRentalSupport(rental.seq)
    const result = response.resultMsg
    // API 응답이 객체인 경우 (rentalApproval와 attachment 포함)
    if (result && (result as any).attachment) {
      rentalProposalExistingAttachment.value = {
        seq: (result as any).attachment.seq,
        fileName: (result as any).attachment.fileName,
        fileSize: (result as any).attachment.fileSize
      }
    } else {
      rentalProposalExistingAttachment.value = null
    }
  } catch (error) {
    console.error('첨부파일 정보 조회 실패:', error)
    rentalProposalExistingAttachment.value = null
  }
  
  rentalProposalSelectedFile.value = null
  if (rentalProposalFileInput.value) {
    rentalProposalFileInput.value.value = ''
  }
  
  showRentalProposalModal.value = true
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

// 숫자 입력 처리 (천 단위 콤마 제거)
const handleRentalNumberInput = (event: Event, field: 'contractMonthlyRent' | 'billingAmount') => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/,/g, '')
  const numValue = parseInt(value) || 0
  
  if (field === 'contractMonthlyRent') {
    rentalProposalForm.value.contractMonthlyRent = numValue
    // 계약 월세 금액이 변경되면 청구 금액 자동 계산
    if (numValue > 0) {
      // 50만원 초과면 최대 25만원, 그 외는 50%
      if (numValue > 500000) {
        rentalProposalForm.value.billingAmount = 250000
      } else {
        rentalProposalForm.value.billingAmount = Math.floor(numValue / 2)
      }
    }
    target.value = value || ''
  } else if (field === 'billingAmount') {
    rentalProposalForm.value.billingAmount = numValue
    target.value = value || ''
  }
}

// 숫자만 입력 허용
const handleKeyPress = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

// 한국 원화 형식으로 변환
const formatKoreanWon = (amount: number): string => {
  if (!amount || amount < 10000) return ''
  
  const man = Math.floor(amount / 10000)
  const remainder = amount % 10000
  
  if (remainder === 0) {
    return `${man}만원`
  } else {
    return `${man}만 ${remainder.toLocaleString()}원`
  }
}

// 파일 선택 처리
const handleRentalProposalFileSelect = (event: Event) => {
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
  
  rentalProposalSelectedFile.value = file
  // 새 파일 선택 시 기존 첨부파일 정보 제거
  rentalProposalExistingAttachment.value = null
}

// 선택된 파일 제거
const removeRentalProposalSelectedFile = () => {
  rentalProposalSelectedFile.value = null
  if (rentalProposalFileInput.value) {
    rentalProposalFileInput.value.value = ''
  }
}

// 기존 파일 제거
const removeRentalProposalExistingFile = () => {
  rentalProposalExistingAttachment.value = null
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
const downloadRentalProposalAttachment = async () => {
  if (!editingRentalProposal.value || !rentalProposalExistingAttachment.value) return
  
  try {
    const response = await apiClient.get(`/rental/${editingRentalProposal.value.seq}/attachment`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = rentalProposalExistingAttachment.value.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('첨부파일 다운로드 실패:', error)
    alert('첨부파일 다운로드에 실패했습니다.')
  }
}

// 월세 지원 품의 저장
const saveRentalProposal = async () => {
  if (!editingRentalProposal.value) return
  
  isSavingRentalProposal.value = true
  try {
    const request: any = {
      previousAddress: rentalProposalForm.value.previousAddress || undefined,
      rentalAddress: rentalProposalForm.value.rentalAddress,
      contractStartDate: rentalProposalForm.value.contractStartDate,
      contractEndDate: rentalProposalForm.value.contractEndDate,
      contractMonthlyRent: rentalProposalForm.value.contractMonthlyRent,
      billingAmount: rentalProposalForm.value.billingAmount,
      billingStartDate: rentalProposalForm.value.billingStartDate,
      billingReason: rentalProposalForm.value.billingReason || undefined
    }
    
    // FormData 생성
    const formData = new FormData()
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
    formData.append('rentalProposalRequest', jsonBlob, 'rentalProposalRequest.json')
    
    // 파일이 있으면 추가
    if (rentalProposalSelectedFile.value) {
      formData.append('file', rentalProposalSelectedFile.value)
    }
    
    await apiClient.put(`/rental/${editingRentalProposal.value.seq}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    alert('수정되었습니다.')
    closeRentalProposalForm()
    await loadRentalSupportList()
  } catch (error) {
    console.error('월세 지원 품의 수정 실패:', error)
    alert('수정에 실패했습니다.')
  } finally {
    isSavingRentalProposal.value = false
  }
}

// 월세 지원 품의 모달 닫기
const closeRentalProposalForm = () => {
  showRentalProposalModal.value = false
  editingRentalProposal.value = null
  rentalProposalForm.value = {
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
  rentalProposalSelectedFile.value = null
  rentalProposalExistingAttachment.value = null
  if (rentalProposalFileInput.value) {
    rentalProposalFileInput.value.value = ''
  }
}

// 계약 월세 금액이 변경될 때 자동 계산
watch(() => rentalProposalForm.value.contractMonthlyRent, (newValue) => {
  if (newValue && newValue > 0) {
    // 월세 청구 금액 계산
    // 50만원 초과면 최대 25만원, 그 외는 50%
    if (newValue > 500000) {
      rentalProposalForm.value.billingAmount = 250000
    } else {
      rentalProposalForm.value.billingAmount = Math.floor(newValue / 2)
    }
  }
})

// 계약 시작일이 변경될 때 청구 개시일 자동 설정
watch(() => rentalProposalForm.value.contractStartDate, (newValue) => {
  if (newValue) {
    rentalProposalForm.value.billingStartDate = newValue
  }
})

// 계약 시작일과 계약 단위가 변경될 때 종료일 자동 계산
watch([() => rentalProposalForm.value.contractStartDate, () => rentalProposalForm.value.contractTermUnit], ([startDate, termUnit]) => {
  if (startDate && termUnit && termUnit !== '직접입력') {
    const start = new Date(startDate + 'T00:00:00')
    const years = termUnit === '1년' ? 1 : 2
    const end = new Date(start)
    end.setFullYear(start.getFullYear() + years)
    end.setDate(end.getDate() - 1) // 종료일은 시작일 + N년 - 1일
    
    const year = end.getFullYear()
    const month = String(end.getMonth() + 1).padStart(2, '0')
    const day = String(end.getDate()).padStart(2, '0')
    rentalProposalForm.value.contractEndDate = `${year}-${month}-${day}`
  } else if (termUnit === '직접입력') {
    // 직접입력으로 변경되면 종료일은 그대로 유지 (사용자가 입력)
  }
})

// 월세 지원 품의 목록 로드
const loadRentalSupportList = async () => {
  try {
    const rentalResponse = await getRentalSupportList()
    rentalSupportList.value = rentalResponse.resultMsg || []
  } catch (error) {
    console.error('월세 지원 품의 목록 조회 실패:', error)
  }
}

// 월세 지원 품의서 다운로드
const downloadRentalProposalDocument = async (seq: number) => {
  isDownloading.value = seq
  try {
    // rentalSupportList에서 해당 seq의 applicant 찾기
    const rental = rentalSupportList.value.find(r => r.seq === seq)
    const applicant = rental?.applicant
    
    const { blob, filename } = await downloadRentalProposal(seq, applicant)
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
    isDownloading.value = null
  }
}

// 휴가 신청 삭제
const handleDeleteVacation = async (seq: number) => {
  if (!confirm('삭제하시겠습니까?')) {
    return
  }

  isDeleting.value = seq
  try {
    await deleteVacation(seq)
    alert('삭제되었습니다.')
    // 목록 새로고침 (현재 페이지 유지)
    await loadVacationHistory(vacationCurrentPage.value - 1)
    // 삭제 후 현재 페이지가 유효하지 않으면 마지막 페이지로 이동
    if (vacationCurrentPage.value > vacationTotalPages.value && vacationTotalPages.value > 0) {
      vacationCurrentPage.value = vacationTotalPages.value
      await loadVacationHistory(vacationCurrentPage.value - 1)
    }
  } catch (error: any) {
    console.error('삭제 실패:', error)
    const errorCode = error.response?.data?.resultMsg?.errorCode
    const errorMessage = error.response?.data?.resultMsg?.errorMessage
    
    // 특정 에러 코드일 때는 errorMessage를 표시
    if (errorCode === '912' && errorMessage) {
      alert(errorMessage)
    } else {
      alert('삭제에 실패했습니다.')
    }
  } finally {
    isDeleting.value = null
  }
}

// 개인 비용 청구 삭제
const handleDeleteExpenseClaim = async (seq: number) => {
  if (!confirm('삭제하시겠습니까?')) {
    return
  }

  isDeleting.value = seq
  try {
    await deleteExpenseClaim(seq)
    alert('삭제되었습니다.')
    // 목록 새로고침 (현재 페이지 유지)
    await loadExpenseClaimList(expenseCurrentPage.value - 1)
    // 삭제 후 현재 페이지가 유효하지 않으면 마지막 페이지로 이동
    if (expenseCurrentPage.value > expenseTotalPages.value && expenseTotalPages.value > 0) {
      expenseCurrentPage.value = expenseTotalPages.value
      await loadExpenseClaimList(expenseCurrentPage.value - 1)
    }
    // 상세 정보 맵에서도 제거
    delete expenseDetailMap.value[seq]
  } catch (error: any) {
    console.error('삭제 실패:', error)
    const errorCode = error.response?.data?.resultMsg?.errorCode
    const errorMessage = error.response?.data?.resultMsg?.errorMessage
    
    // 특정 에러 코드일 때는 errorMessage를 표시
    if (errorCode === '912' && errorMessage) {
      alert(errorMessage)
    } else {
      alert('삭제에 실패했습니다.')
    }
  } finally {
    isDeleting.value = null
  }
}

// 월세 지원 신청 삭제
const handleDeleteRentalApplication = async (seq: number) => {
  if (!confirm('삭제하시겠습니까?')) {
    return
  }

  isDeleting.value = seq
  try {
    await deleteRentalSupportApplication(seq)
    alert('삭제되었습니다.')
    // 목록 새로고침 (현재 페이지 유지)
    await loadRentalApplicationList(rentalCurrentPage.value - 1)
    // 삭제 후 현재 페이지가 유효하지 않으면 마지막 페이지로 이동
    if (rentalCurrentPage.value > rentalTotalPages.value && rentalTotalPages.value > 0) {
      rentalCurrentPage.value = rentalTotalPages.value
      await loadRentalApplicationList(rentalCurrentPage.value - 1)
    }
  } catch (error: any) {
    console.error('삭제 실패:', error)
    const errorCode = error.response?.data?.resultMsg?.errorCode
    const errorMessage = error.response?.data?.resultMsg?.errorMessage
    
    // 특정 에러 코드일 때는 errorMessage를 표시
    if (errorCode === '912' && errorMessage) {
      alert(errorMessage)
    } else {
      alert('삭제에 실패했습니다.')
    }
  } finally {
    isDeleting.value = null
  }
}

onMounted(async () => {
  try {
    // 휴가 신청 목록 로드
    await loadVacationHistory(0)
    vacationCurrentPage.value = 1

    // 개인 비용 신청 목록 로드
    await loadExpenseClaimList(0)
    expenseCurrentPage.value = 1

    // 월세 지원 신청 목록 로드 (청구서)
    await loadRentalApplicationList(0)
    rentalCurrentPage.value = 1

    // 월세 지원 품의 목록 로드 (품의서)
    const rentalResponse = await getRentalSupportList()
    rentalSupportList.value = rentalResponse.resultMsg || []
  } catch (error) {
    console.error('신청 목록 조회 실패:', error)
  }
})
</script>

<style scoped>
.my-applications-view {
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

.applications-container {
  max-width: 1200px;
  margin: 0 auto;
}

.application-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.application-section h2 {
  margin-bottom: 1.5rem;
  color: #1226aa;
  border-bottom: 2px solid #1226aa;
  padding-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

.application-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fafafa;
  transition: box-shadow 0.3s;
}

.application-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.application-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
}

.info-row .label {
  font-weight: 600;
  color: #555;
  min-width: 80px;
}

.info-row .value {
  color: #333;
}

.application-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.btn-download {
  background-color: #1226aa;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background-color: #0f1f88;
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
}

.btn-delete:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-container {
  overflow-x: auto;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table thead {
  background-color: #1226aa;
  color: white;
}

.data-table th {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #0f1f88;
  vertical-align: middle;
}

.data-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.data-table td:last-child {
  display: flex;
  justify-content: center;
  align-items: center;
}

.data-table td .action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  align-items: center;
  min-width: calc(2 * (0.4rem * 2 + 0.8rem * 2 + 2.5rem) + 0.5rem);
  width: calc(2 * (0.4rem * 2 + 0.8rem * 2 + 2.5rem) + 0.5rem);
  margin: 0 auto;
}

/* 다운로드 버튼만 있을 때도 동일한 크기 유지 */
.data-table td .action-buttons .btn-download:only-child {
  min-width: calc(2 * (0.4rem * 2 + 0.8rem * 2 + 2.5rem) + 0.5rem);
  width: calc(2 * (0.4rem * 2 + 0.8rem * 2 + 2.5rem) + 0.5rem);
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #e8f4f8 !important;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.parent-row {
  transition: background-color 0.2s;
}

/* parent-row 호버 시 expand-icon을 제외한 나머지 셀들에 호버 효과 */
.parent-row:hover td:not(.expand-icon) {
  background-color: #e8f4f8;
}

.parent-row.expanded {
  background-color: #e8f4f8;
}

.parent-row.expanded td:not(.expand-icon) {
  background-color: #e8f4f8;
}

.clickable-cell {
  cursor: pointer;
}

.expand-icon {
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* expand-icon은 따로 호버 효과 */
.expand-icon:hover {
  background-color: #d0e8f0;
}

.expand-icon .icon {
  display: inline-block;
  font-size: 0.8rem;
  color: #1226aa;
  transition: transform 0.2s;
}

.child-row {
  background-color: #fafafa;
}

.child-row td {
  padding: 0;
  border-top: none;
  width: 100%;
  position: relative;
  left: 0;
  right: 0;
}

.expense-detail-container {
  padding: 1rem;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  overflow-x: auto;
  display: block;
}

.expense-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: auto;
}

.expense-detail-table thead {
  background-color: #f5f5f5;
}

.expense-detail-table th {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-detail-table td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.expense-detail-table tbody tr:hover {
  background-color: #f9f9f9;
}

.expense-detail-table tbody tr:last-child td {
  border-bottom: none;
}

/* 페이징 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #1226aa;
  color: white;
  border-color: #1226aa;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
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

@media (max-width: 768px) {
  .my-applications-view {
    padding: 1rem;
  }

  .application-section {
    padding: 1.5rem;
  }

  .application-item {
    flex-direction: column;
    gap: 1rem;
  }

  .application-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
  }

  .data-table {
    font-size: 0.8rem;
    min-width: 600px;
    width: 100%;
  }

  .data-table th,
  .data-table td {
    padding: 0.6rem 0.4rem;
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
  }

  /* 각 컬럼별 너비 조정 */
  .data-table th:nth-child(1),
  .data-table td:nth-child(1) {
    min-width: 80px;
    text-align: center;
  }

  .data-table th:nth-child(2),
  .data-table td:nth-child(2) {
    min-width: 180px;
    text-align: center;
  }

  .data-table th:nth-child(3),
  .data-table td:nth-child(3) {
    min-width: 60px;
    text-align: center;
  }

  .data-table th:nth-child(4),
  .data-table td:nth-child(4) {
    min-width: 70px;
    text-align: center;
  }

  .data-table th:nth-child(5),
  .data-table td:nth-child(5) {
    min-width: 100px;
    text-align: left;
  }

  /* 작업 컬럼 스타일 */
  .data-table th:last-child,
  .data-table td:last-child {
    min-width: 90px;
    text-align: center;
  }

  .data-table td:last-child {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 버튼 크기 조정 */
  .action-buttons {
    flex-direction: column;
    gap: 0.3rem;
    min-width: calc(2 * (0.5rem * 2 + 0.5rem * 2 + 2.5rem) + 0.3rem);
    width: calc(2 * (0.5rem * 2 + 0.5rem * 2 + 2.5rem) + 0.3rem);
    align-items: stretch;
    margin: 0 auto;
  }

  /* 다운로드 버튼만 있을 때도 동일한 크기 유지 */
  .action-buttons .btn-download:only-child {
    min-width: calc(2 * (0.5rem * 2 + 0.5rem * 2 + 2.5rem) + 0.3rem);
    width: calc(2 * (0.5rem * 2 + 0.5rem * 2 + 2.5rem) + 0.3rem);
  }

  .btn-small {
    padding: 0.5rem 0.5rem;
    font-size: 0.7rem;
    white-space: nowrap;
    width: 100%;
    min-width: 60px;
  }

  /* 모바일에서도 버튼 색상 유지 */
  .btn-download {
    background-color: #1226aa !important;
    color: white !important;
  }

  .btn-delete {
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.expense-detail-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1226aa;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #1226aa;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.expense-detail-modal .expense-detail-container {
  padding: 0;
  margin: 0;
  width: 100%;
}

/* 월세 지원 품의 수정 모달 스타일 */
.rental-proposal-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.rental-proposal-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.rental-proposal-modal .modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1226aa;
}

.rental-proposal-modal .btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.rental-proposal-modal .btn-close:hover {
  color: #1226aa;
}

.rental-proposal-modal .rental-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.rental-proposal-modal .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.rental-proposal-modal .form-group label {
  font-weight: 500;
  color: #555;
}

.rental-proposal-modal .form-group .required {
  color: #dc3545;
}

.rental-proposal-modal .form-group input,
.rental-proposal-modal .form-group select,
.rental-proposal-modal .form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.rental-proposal-modal .form-group input:focus,
.rental-proposal-modal .form-group select:focus,
.rental-proposal-modal .form-group textarea:focus {
  outline: none;
  border-color: #1226aa;
}

.rental-proposal-modal .form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.rental-proposal-modal .form-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.rental-proposal-modal .input-with-unit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rental-proposal-modal .unit-text-below {
  font-size: 0.85rem;
  color: #666;
  padding-left: 0.5rem;
}

.rental-proposal-modal .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.rental-proposal-modal .btn-save {
  background-color: #1226aa;
  color: white;
}

.rental-proposal-modal .btn-save:hover:not(:disabled) {
  background-color: #0f1f88;
}

.rental-proposal-modal .btn-cancel {
  background-color: #999;
  color: white;
}

.rental-proposal-modal .btn-cancel:hover {
  background-color: #777;
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

