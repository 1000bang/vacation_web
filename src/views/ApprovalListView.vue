<template>
  <div class="approval-list-view">
    <div class="header-section">
      <h1>나의 결재 목록</h1>
    </div>

    <div class="applications-container">
      <!-- 휴가 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>휴가 신청</h2>
        <div v-if="vacationList.length === 0" class="empty-state">
          승인 대기 중인 휴가 신청이 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청자</th>
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
                v-for="vacation in vacationList" 
                :key="'vacation-' + vacation.seq"
                @click="handleViewDetail(vacation)"
                class="clickable-row"
              >
                <td>{{ vacation.applicant || '-' }}</td>
                <td>{{ formatDate(vacation.startDate) }}</td>
                <td>{{ formatDate(vacation.startDate) }} ~ {{ formatDate(vacation.endDate) }}</td>
                <td>{{ vacation.period }}일</td>
                <td>{{ getVacationTypeName(vacation.type) }}</td>
                <td>{{ vacation.reason || '-' }}</td>
                <td>
                  <span :class="getApprovalStatusClass(vacation.approvalStatus)">
                    {{ getApprovalStatusName(vacation.approvalStatus) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      v-if="canApprove(vacation.approvalStatus)"
                      @click="handleApprove(vacation)"
                      class="btn btn-approve btn-small"
                      :disabled="isProcessing === vacation.seq"
                    >
                      승인
                    </button>
                    <button
                      v-if="canReject(vacation.approvalStatus)"
                      @click="handleReject(vacation)"
                      class="btn btn-reject btn-small"
                      :disabled="isProcessing === vacation.seq"
                    >
                      반려
                    </button>
                    <button
                      v-if="vacation.approvalStatus === 'C'"
                      @click="handleDownloadVacation(vacation.seq, vacation.applicant)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === vacation.seq"
                    >
                      {{ isDownloading === vacation.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <div v-if="showVacationPagination" class="pagination">
          <button 
            @click="vacationCurrentPage = Math.max(1, vacationCurrentPage - 1)"
            :disabled="vacationCurrentPage === 1"
            class="pagination-btn"
          >
            이전
          </button>
          <span class="pagination-info">
            {{ vacationCurrentPage }} / {{ vacationTotalPages }}
          </span>
          <button 
            @click="vacationCurrentPage = Math.min(vacationTotalPages, vacationCurrentPage + 1)"
            :disabled="vacationCurrentPage === vacationTotalPages"
            class="pagination-btn"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 개인 비용 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>개인 비용 신청</h2>
        <div v-if="expenseList.length === 0" class="empty-state">
          승인 대기 중인 개인 비용 신청이 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청자</th>
                <th>신청일</th>
                <th>청구월</th>
                <th>항목 수</th>
                <th>총 금액</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="expense in expenseList" 
                :key="'expense-' + expense.seq"
                @click="handleViewDetail(expense)"
                class="clickable-row"
              >
                <td>{{ expense.applicant || '-' }}</td>
                <td>{{ formatDate(expense.requestDate) }}</td>
                <td>{{ formatBillingYyMonth(expense.billingYyMonth) }}</td>
                <td>{{ expense.childCnt }}개</td>
                <td>{{ formatNumber(expense.totalAmount || 0) }}원</td>
                <td>
                  <span :class="getApprovalStatusClass(expense.approvalStatus)">
                    {{ getApprovalStatusName(expense.approvalStatus) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      v-if="canApprove(expense.approvalStatus)"
                      @click="handleApprove(expense)"
                      class="btn btn-approve btn-small"
                      :disabled="isProcessing === expense.seq"
                    >
                      승인
                    </button>
                    <button
                      v-if="canReject(expense.approvalStatus)"
                      @click="handleReject(expense)"
                      class="btn btn-reject btn-small"
                      :disabled="isProcessing === expense.seq"
                    >
                      반려
                    </button>
                    <button
                      v-if="expense.approvalStatus === 'C'"
                      @click="handleDownloadExpenseClaim(expense.seq, expense.applicant)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === expense.seq"
                    >
                      {{ isDownloading === expense.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <div v-if="showExpensePagination" class="pagination">
          <button 
            @click="expenseCurrentPage = Math.max(1, expenseCurrentPage - 1)"
            :disabled="expenseCurrentPage === 1"
            class="pagination-btn"
          >
            이전
          </button>
          <span class="pagination-info">
            {{ expenseCurrentPage }} / {{ expenseTotalPages }}
          </span>
          <button 
            @click="expenseCurrentPage = Math.min(expenseTotalPages, expenseCurrentPage + 1)"
            :disabled="expenseCurrentPage === expenseTotalPages"
            class="pagination-btn"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 월세 지원 신청 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>월세 지원 신청</h2>
        <div v-if="rentalList.length === 0" class="empty-state">
          승인 대기 중인 월세 지원 신청이 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청자</th>
                <th>신청일</th>
                <th>청구월</th>
                <th>계약 월세</th>
                <th>청구 금액</th>
                <th>납입일</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="rental in rentalList" 
                :key="'rental-' + rental.seq"
                @click="handleViewDetail(rental)"
                class="clickable-row"
              >
                <td>{{ rental.applicant || '-' }}</td>
                <td>{{ formatDate(rental.requestDate) }}</td>
                <td>{{ formatBillingYyMonth(rental.billingYyMonth) }}</td>
                <td>{{ formatNumber(rental.contractMonthlyRent || 0) }}원</td>
                <td>{{ formatNumber(rental.billingAmount || 0) }}원</td>
                <td>{{ formatDate(rental.paymentDate) }}</td>
                <td>
                  <span :class="getApprovalStatusClass(rental.approvalStatus)">
                    {{ getApprovalStatusName(rental.approvalStatus) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      v-if="canApprove(rental.approvalStatus)"
                      @click="handleApprove(rental)"
                      class="btn btn-approve btn-small"
                      :disabled="isProcessing === rental.seq"
                    >
                      승인
                    </button>
                    <button
                      v-if="canReject(rental.approvalStatus)"
                      @click="handleReject(rental)"
                      class="btn btn-reject btn-small"
                      :disabled="isProcessing === rental.seq"
                    >
                      반려
                    </button>
                    <button
                      v-if="rental.approvalStatus === 'C'"
                      @click="handleDownloadRentalApplication(rental.seq, rental.applicant)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === rental.seq"
                    >
                      {{ isDownloading === rental.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <div v-if="showRentalPagination" class="pagination">
          <button 
            @click="rentalCurrentPage = Math.max(1, rentalCurrentPage - 1)"
            :disabled="rentalCurrentPage === 1"
            class="pagination-btn"
          >
            이전
          </button>
          <span class="pagination-info">
            {{ rentalCurrentPage }} / {{ rentalTotalPages }}
          </span>
          <button 
            @click="rentalCurrentPage = Math.min(rentalTotalPages, rentalCurrentPage + 1)"
            :disabled="rentalCurrentPage === rentalTotalPages"
            class="pagination-btn"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 월세 지원 품의서 목록 (테이블 형식) -->
      <div class="application-section">
        <h2>월세 지원 품의서</h2>
        <div v-if="rentalApprovalList.length === 0" class="empty-state">
          승인 대기 중인 월세 지원 품의서가 없습니다.
        </div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>신청자</th>
                <th>계약 기간</th>
                <th>계약 월세</th>
                <th>청구 금액</th>
                <th>청구 개시일</th>
                <th>승인상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="rentalApproval in rentalApprovalList" 
                :key="'rental-approval-' + rentalApproval.seq"
                @click="openRentalApprovalModal(rentalApproval)"
                class="clickable-row"
              >
                <td>{{ rentalApproval.applicant || '-' }}</td>
                <td>{{ formatDate(rentalApproval.contractStartDate) }} ~ {{ formatDate(rentalApproval.contractEndDate) }}</td>
                <td>{{ formatNumber(rentalApproval.contractMonthlyRent || 0) }}원</td>
                <td>{{ formatNumber(rentalApproval.billingAmount || 0) }}원</td>
                <td>{{ formatDate(rentalApproval.billingStartDate) }}</td>
                <td>
                  <span :class="getApprovalStatusClass(rentalApproval.approvalStatus)">
                    {{ getApprovalStatusName(rentalApproval.approvalStatus) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      v-if="canApprove(rentalApproval.approvalStatus)"
                      @click="handleApprove(rentalApproval)"
                      class="btn btn-approve btn-small"
                      :disabled="isProcessing === rentalApproval.seq"
                    >
                      승인
                    </button>
                    <button
                      v-if="canReject(rentalApproval.approvalStatus)"
                      @click="handleReject(rentalApproval)"
                      class="btn btn-reject btn-small"
                      :disabled="isProcessing === rentalApproval.seq"
                    >
                      반려
                    </button>
                    <button
                      v-if="rentalApproval.approvalStatus === 'C'"
                      @click="handleDownloadRentalProposal(rentalApproval.seq, rentalApproval.applicant)"
                      class="btn btn-download btn-small"
                      :disabled="isDownloading === rentalApproval.seq"
                    >
                      {{ isDownloading === rentalApproval.seq ? '다운로드 중...' : '다운로드' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 페이징 버튼 -->
        <div v-if="showRentalApprovalPagination" class="pagination">
          <button 
            @click="rentalApprovalCurrentPage = Math.max(1, rentalApprovalCurrentPage - 1)"
            :disabled="rentalApprovalCurrentPage === 1"
            class="pagination-btn"
          >
            이전
          </button>
          <span class="pagination-info">
            {{ rentalApprovalCurrentPage }} / {{ rentalApprovalTotalPages }}
          </span>
          <button 
            @click="rentalApprovalCurrentPage = Math.min(rentalApprovalTotalPages, rentalApprovalCurrentPage + 1)"
            :disabled="rentalApprovalCurrentPage === rentalApprovalTotalPages"
            class="pagination-btn"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- 월세 지원 품의서 상세 모달 -->
    <div v-if="showRentalApprovalModal" class="rental-approval-modal" @click="closeRentalApprovalModal">
      <div class="modal-content rental-modal-content" @click.stop>
        <div class="modal-header">
          <h3>월세 지원 품의서 상세</h3>
          <button @click="closeRentalApprovalModal" class="btn-close">×</button>
        </div>
        <div v-if="rentalApprovalDetail" class="rental-detail-content">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">신청자:</span>
              <span class="detail-value">{{ rentalApprovalDetail.applicant || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인상태:</span>
              <span :class="getApprovalStatusClass(rentalApprovalDetail.approvalStatus)">
                {{ getApprovalStatusName(rentalApprovalDetail.approvalStatus) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">기존 거주지 주소:</span>
              <span class="detail-value">{{ rentalApprovalDetail.previousAddress || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">월세 계약 주소:</span>
              <span class="detail-value">{{ rentalApprovalDetail.rentalAddress || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 시작일:</span>
              <span class="detail-value">{{ formatDate(rentalApprovalDetail.contractStartDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 종료일:</span>
              <span class="detail-value">{{ formatDate(rentalApprovalDetail.contractEndDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 월세 금액:</span>
              <span class="detail-value">{{ formatNumber(rentalApprovalDetail.contractMonthlyRent || 0) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 금액:</span>
              <span class="detail-value">{{ formatNumber(rentalApprovalDetail.billingAmount || 0) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 개시일:</span>
              <span class="detail-value">{{ formatDate(rentalApprovalDetail.billingStartDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 사유:</span>
              <span class="detail-value">{{ rentalApprovalDetail.billingReason || '-' }}</span>
            </div>
            <!-- 첨부파일 -->
            <div v-if="rentalApprovalDetail.attachment" class="detail-row">
              <span class="detail-label">첨부파일:</span>
              <div class="attachment-info">
                <span class="file-name">{{ rentalApprovalDetail.attachment.fileName }}</span>
                <span class="file-size">({{ formatFileSize(rentalApprovalDetail.attachment.fileSize) }})</span>
                <button 
                  type="button" 
                  @click="downloadRentalApprovalAttachment" 
                  class="btn-download-file"
                >
                  다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 승인/반려 모달 -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <h3>반려 사유 입력</h3>
        <textarea
          v-model="rejectionReason"
          placeholder="반려 사유를 입력해주세요."
          rows="5"
          class="rejection-textarea"
        ></textarea>
        <div class="modal-actions">
          <button @click="closeRejectModal" class="btn btn-cancel">취소</button>
          <button @click="confirmReject" class="btn btn-confirm" :disabled="!rejectionReason.trim()">
            확인
          </button>
        </div>
      </div>
    </div>

    <!-- 신청서 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedApplication?.applicant }}님의 {{ getApplicationTypeName(selectedApplication) }} 신청서</h3>
          <button @click="closeDetailModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <!-- 휴가 신청 상세 -->
          <div v-if="selectedApplication?.type" class="detail-section">
            <h4>휴가 정보</h4>
            <div class="detail-row">
              <span class="detail-label">신청일:</span>
              <span class="detail-value">{{ formatDate(selectedApplication.startDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">기간:</span>
              <span class="detail-value">{{ formatDate(selectedApplication.startDate) }} ~ {{ formatDate(selectedApplication.endDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">일수:</span>
              <span class="detail-value">{{ selectedApplication.period }}일</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">구분:</span>
              <span class="detail-value">{{ getVacationTypeName(selectedApplication.type) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">사유:</span>
              <span class="detail-value">{{ selectedApplication.reason || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인상태:</span>
              <span :class="getApprovalStatusClass(selectedApplication.approvalStatus)">
                {{ getApprovalStatusName(selectedApplication.approvalStatus) }}
              </span>
            </div>
          </div>
          
          <!-- 개인 비용 신청 상세 -->
          <div v-else-if="selectedApplication?.billingYyMonth && !selectedApplication?.contractMonthlyRent" class="detail-section">
            <h4>개인 비용 정보</h4>
            <div class="detail-row">
              <span class="detail-label">신청일:</span>
              <span class="detail-value">{{ formatDate(selectedApplication.requestDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구월:</span>
              <span class="detail-value">{{ formatBillingYyMonth(selectedApplication.billingYyMonth) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">항목 수:</span>
              <span class="detail-value">{{ selectedApplication.childCnt }}개</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">총 금액:</span>
              <span class="detail-value">{{ formatNumber(selectedApplication.totalAmount || 0) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인상태:</span>
              <span :class="getApprovalStatusClass(selectedApplication.approvalStatus)">
                {{ getApprovalStatusName(selectedApplication.approvalStatus) }}
              </span>
            </div>
          </div>
          
          <!-- 월세 지원 신청 상세 -->
          <div v-else-if="selectedApplication?.contractMonthlyRent" class="detail-section">
            <h4>월세 지원 정보</h4>
            <div class="detail-row">
              <span class="detail-label">신청일:</span>
              <span class="detail-value">{{ formatDate(selectedApplication.requestDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구월:</span>
              <span class="detail-value">{{ formatBillingYyMonth(selectedApplication.billingYyMonth) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">계약 월세:</span>
              <span class="detail-value">{{ formatNumber(selectedApplication.contractMonthlyRent) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">청구 금액:</span>
              <span class="detail-value">{{ formatNumber(selectedApplication.billingAmount || 0) }}원</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">납입일:</span>
              <span class="detail-value">{{ formatDate(selectedApplication.paymentDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인상태:</span>
              <span :class="getApprovalStatusClass(selectedApplication.approvalStatus)">
                {{ getApprovalStatusName(selectedApplication.approvalStatus) }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="canApprove(selectedApplication?.approvalStatus)"
            @click="handleApprove(selectedApplication)"
            class="btn btn-approve"
            :disabled="isProcessing === selectedApplication?.seq"
          >
            승인하기
          </button>
          <button
            v-if="canReject(selectedApplication?.approvalStatus)"
            @click="handleReject(selectedApplication)"
            class="btn btn-reject"
            :disabled="isProcessing === selectedApplication?.seq"
          >
            반려하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getPendingApprovals, 
  approveVacationByTeamLeader,
  rejectVacationByTeamLeader,
  approveVacationByDivisionHead,
  rejectVacationByDivisionHead,
  approveExpenseClaimByTeamLeader,
  rejectExpenseClaimByTeamLeader,
  approveExpenseClaimByDivisionHead,
  rejectExpenseClaimByDivisionHead,
  approveRentalSupportByTeamLeader,
  rejectRentalSupportByTeamLeader,
  approveRentalSupportByDivisionHead,
  rejectRentalSupportByDivisionHead,
  approveRentalApprovalByTeamLeader,
  rejectRentalApprovalByTeamLeader,
  approveRentalApprovalByDivisionHead,
  rejectRentalApprovalByDivisionHead,
  downloadExpenseClaim,
  downloadRentalSupportApplication,
  downloadRentalProposal,
  getRentalSupport,
  type PendingApproval
} from '@/api/user'
import { downloadVacationDocument } from '@/api/vacation'
import apiClient from '@/api/axios'

const router = useRouter()

// 페이징 관련
const itemsPerPage = 5
const vacationCurrentPage = ref(1)
const expenseCurrentPage = ref(1)
const rentalCurrentPage = ref(1)
const rentalApprovalCurrentPage = ref(1)

const vacationList = ref<PendingApproval[]>([])
const expenseList = ref<PendingApproval[]>([])
const rentalList = ref<PendingApproval[]>([])
const rentalApprovalList = ref<PendingApproval[]>([])

const vacationTotalCount = ref(0)
const expenseTotalCount = ref(0)
const rentalTotalCount = ref(0)
const rentalApprovalTotalCount = ref(0)

// 총 페이지 수 계산
const vacationTotalPages = computed(() => Math.ceil(vacationTotalCount.value / itemsPerPage))
const expenseTotalPages = computed(() => Math.ceil(expenseTotalCount.value / itemsPerPage))
const rentalTotalPages = computed(() => Math.ceil(rentalTotalCount.value / itemsPerPage))
const rentalApprovalTotalPages = computed(() => Math.ceil(rentalApprovalTotalCount.value / itemsPerPage))

// 페이지 버튼 표시 여부
const showVacationPagination = computed(() => vacationTotalCount.value >= itemsPerPage)
const showExpensePagination = computed(() => expenseTotalCount.value >= itemsPerPage)
const showRentalPagination = computed(() => rentalTotalCount.value >= itemsPerPage)
const showRentalApprovalPagination = computed(() => rentalApprovalTotalCount.value >= itemsPerPage)

const isProcessing = ref<number | null>(null)
const isDownloading = ref<number | null>(null)
const showRejectModal = ref(false)
const rejectionReason = ref('')
const currentRejectItem = ref<PendingApproval | null>(null)
const showDetailModal = ref(false)
const selectedApplication = ref<PendingApproval | null>(null)

// 월세 지원 품의서 모달 관련
const showRentalApprovalModal = ref(false)
const rentalApprovalDetail = ref<any>(null)
const rentalApprovalSeq = ref<number | null>(null)

const user = ref<{ authVal: string } | null>(null)

// 날짜 포맷팅
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// 숫자 포맷팅
const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR')
}

// 청구 년월 포맷팅 (YYYYMM -> YYYY.MM)
const formatBillingYyMonth = (billingYyMonth: number | undefined): string => {
  if (!billingYyMonth) return ''
  const year = Math.floor(billingYyMonth / 100)
  const month = billingYyMonth % 100
  return `${year}.${month.toString().padStart(2, '0')}`
}

// 휴가 구분 한글 변환
const getVacationTypeName = (type: string | undefined): string => {
  if (!type) return '-'
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

// 승인 상태 한글 변환
const getApprovalStatusName = (status: string | undefined | null): string => {
  // null이면 "A"로 간주 (초기 생성 상태)
  const actualStatus = status || 'A'
  const statusMap: Record<string, string> = {
    'A': '요청',
    'AM': '수정후 재요청',
    'B': '팀장 승인',
    'RB': '팀장 반려',
    'C': '본부장 승인',
    'RC': '본부장 반려'
  }
  return statusMap[actualStatus] || actualStatus
}

// 승인 상태 스타일 클래스
const getApprovalStatusClass = (status: string | undefined | null): string => {
  // null이면 "A"로 간주 (초기 생성 상태)
  const actualStatus = status || 'A'
  // 반려 상태만 빨간색
  if (actualStatus === 'RB' || actualStatus === 'RC') {
    return 'status-rejected'
  }
  // 최종 승인 상태만 초록색
  if (actualStatus === 'C') {
    return 'status-final-approved'
  }
  // 나머지는 기본 색상
  return 'status-default'
}

// 승인 가능 여부 확인
const canApprove = (status: string | undefined | null): boolean => {
  if (!user.value) return false
  
  // null이면 "A"로 간주 (초기 생성 상태)
  const actualStatus = status || 'A'
  const authVal = user.value.authVal
  
  // 팀장: A, AM 상태만 승인 가능
  if (authVal === 'tj') {
    return actualStatus === 'A' || actualStatus === 'AM'
  }
  
  // 본부장: B 상태만 승인 가능
  if (authVal === 'bb') {
    return actualStatus === 'B'
  }
  
  // 관리자: 모든 상태 승인 가능 (필요시)
  if (authVal === 'ma') {
    return actualStatus === 'A' || actualStatus === 'AM' || actualStatus === 'B'
  }
  
  return false
}

// 반려 가능 여부 확인
const canReject = (status: string | undefined | null): boolean => {
  if (!user.value) return false
  
  // null이면 "A"로 간주 (초기 생성 상태)
  const actualStatus = status || 'A'
  const authVal = user.value.authVal
  
  // 팀장: A, AM 상태만 반려 가능
  if (authVal === 'tj') {
    return actualStatus === 'A' || actualStatus === 'AM'
  }
  
  // 본부장: B 상태만 반려 가능
  if (authVal === 'bb') {
    return actualStatus === 'B'
  }
  
  // 관리자: 모든 상태 반려 가능 (필요시)
  if (authVal === 'ma') {
    return actualStatus === 'A' || actualStatus === 'AM' || actualStatus === 'B'
  }
  
  return false
}

// 신청서 타입 이름
const getApplicationTypeName = (application: PendingApproval | null): string => {
  if (!application) return '신청'
  if (application.type) return '휴가'
  if (application.billingYyMonth) {
    if (application.contractMonthlyRent) return '월세 지원'
    return '개인 비용'
  }
  return '신청'
}

// 데이터 로드 함수
const loadVacationList = async (page: number = 0) => {
  try {
    const response = await getPendingApprovals(undefined, 'vacation', page, itemsPerPage)
    const data = response.resultMsg as any
    if (data?.vacation) {
      vacationList.value = data.vacation.list || []
      vacationTotalCount.value = data.vacation.totalCount || 0
    }
  } catch (error) {
    console.error('휴가 신청 목록 조회 실패:', error)
  }
}

const loadExpenseList = async (page: number = 0) => {
  try {
    const response = await getPendingApprovals(undefined, 'expense', page, itemsPerPage)
    const data = response.resultMsg as any
    if (data?.expense) {
      expenseList.value = data.expense.list || []
      expenseTotalCount.value = data.expense.totalCount || 0
    }
  } catch (error) {
    console.error('개인 비용 신청 목록 조회 실패:', error)
  }
}

const loadRentalList = async (page: number = 0) => {
  try {
    const response = await getPendingApprovals(undefined, 'rental', page, itemsPerPage)
    const data = response.resultMsg as any
    if (data?.rental) {
      rentalList.value = data.rental.list || []
      rentalTotalCount.value = data.rental.totalCount || 0
    }
  } catch (error) {
    console.error('월세 지원 신청 목록 조회 실패:', error)
  }
}

const loadRentalApprovalList = async (page: number = 0) => {
  try {
    const response = await getPendingApprovals(undefined, 'rentalApproval', page, itemsPerPage)
    const data = response.resultMsg as any
    if (data?.rentalApproval) {
      rentalApprovalList.value = data.rentalApproval.list || []
      rentalApprovalTotalCount.value = data.rentalApproval.totalCount || 0
    }
  } catch (error) {
    console.error('월세 지원 품의서 목록 조회 실패:', error)
  }
}

// 페이지 변경 감지
watch(vacationCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadVacationList(newPage - 1)
  }
})

watch(expenseCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadExpenseList(newPage - 1)
  }
})

watch(rentalCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadRentalList(newPage - 1)
  }
})

watch(rentalApprovalCurrentPage, (newPage) => {
  if (newPage > 0) {
    loadRentalApprovalList(newPage - 1)
  }
})

// 데이터 로드 (초기 로드)
const loadPendingApprovals = async () => {
  await Promise.all([
    loadVacationList(0),
    loadExpenseList(0),
    loadRentalList(0),
    loadRentalApprovalList(0)
  ])
  vacationCurrentPage.value = 1
  expenseCurrentPage.value = 1
  rentalCurrentPage.value = 1
  rentalApprovalCurrentPage.value = 1
}

// 신청서 상세 보기 (신청 페이지로 이동)
const handleViewDetail = (application: PendingApproval) => {
  if (application.applicationType === 'VACATION') {
    router.push({
      path: `/vacation-application/${application.seq}`,
      query: { approval: 'true' }
    })
  } else if (application.applicationType === 'EXPENSE') {
    router.push({
      path: `/expense-application/${application.seq}`,
      query: { approval: 'true' }
    })
  } else if (application.applicationType === 'RENTAL') {
    router.push({
      path: `/rental-application/${application.seq}`,
      query: { approval: 'true' }
    })
  } else if (application.applicationType === 'RENTAL_APPROVAL') {
    // 월세 지원 품의서는 모달로 표시
    openRentalApprovalModal(application.seq)
  }
}

// 월세 지원 품의서 모달 열기
const openRentalApprovalModal = async (rentalApproval: PendingApproval | number) => {
  try {
    let seq: number
    let applicant: string | undefined
    
    if (typeof rentalApproval === 'number') {
      seq = rentalApproval
      // seq만 전달된 경우 API로 조회
      const response = await getRentalSupport(seq)
      const result = response.resultMsg
      // API 응답이 객체인 경우 (rentalApproval와 attachment 포함)
      const rental = (result as any)?.rentalApproval || result
      rentalApprovalDetail.value = {
        ...rental,
        attachment: (result as any)?.attachment || null,
        applicant: undefined // API 응답에 applicant가 없을 수 있음
      }
      rentalApprovalSeq.value = seq
    } else {
      // PendingApproval 객체가 전달된 경우
      seq = rentalApproval.seq
      applicant = rentalApproval.applicant
      const response = await getRentalSupport(seq)
      const result = response.resultMsg
      // API 응답이 객체인 경우 (rentalApproval와 attachment 포함)
      const rental = (result as any)?.rentalApproval || result
      rentalApprovalDetail.value = {
        ...rental,
        attachment: (result as any)?.attachment || null,
        applicant: applicant // PendingApproval에서 가져온 applicant 사용
      }
      rentalApprovalSeq.value = seq
    }
    showRentalApprovalModal.value = true
  } catch (error) {
    console.error('월세 지원 품의서 조회 실패:', error)
    alert('월세 지원 품의서 정보를 불러오는데 실패했습니다.')
  }
}

// 월세 지원 품의서 모달 닫기
const closeRentalApprovalModal = () => {
  showRentalApprovalModal.value = false
  rentalApprovalDetail.value = null
  rentalApprovalSeq.value = null
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
const downloadRentalApprovalAttachment = async () => {
  if (!rentalApprovalSeq.value || !rentalApprovalDetail.value?.attachment) return
  
  try {
    const response = await apiClient.get(`/rental/${rentalApprovalSeq.value}/attachment`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = rentalApprovalDetail.value.attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('첨부파일 다운로드 실패:', error)
    alert('첨부파일 다운로드에 실패했습니다.')
  }
}

// 상세 모달 닫기
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedApplication.value = null
}

// 승인 처리
const handleApprove = async (application: PendingApproval | null) => {
  if (!application || !user.value) return
  
  if (!confirm('승인하시겠습니까?')) {
    return
  }

  isProcessing.value = application.seq
  try {
    const authVal = user.value.authVal
    // applicationType을 applicationType 필드로 먼저 확인
    const applicationType = application.applicationType || 
                            (application.type ? 'VACATION' : 
                            (application.contractMonthlyRent ? 
                              (application.rentalAddress ? 'RENTAL_APPROVAL' : 'RENTAL') : 'EXPENSE'))
    
    console.log('승인 처리 시작:', { seq: application.seq, applicationType, authVal, currentStatus: application.approvalStatus })
    
    if (authVal === 'tj') {
      if (applicationType === 'VACATION') {
        await approveVacationByTeamLeader(application.seq)
      } else if (applicationType === 'EXPENSE') {
        await approveExpenseClaimByTeamLeader(application.seq)
      } else if (applicationType === 'RENTAL') {
        await approveRentalSupportByTeamLeader(application.seq)
      } else if (applicationType === 'RENTAL_APPROVAL') {
        await approveRentalApprovalByTeamLeader(application.seq)
      }
    } else if (authVal === 'bb') {
      if (applicationType === 'VACATION') {
        await approveVacationByDivisionHead(application.seq)
      } else if (applicationType === 'EXPENSE') {
        await approveExpenseClaimByDivisionHead(application.seq)
      } else if (applicationType === 'RENTAL') {
        await approveRentalSupportByDivisionHead(application.seq)
      } else if (applicationType === 'RENTAL_APPROVAL') {
        await approveRentalApprovalByDivisionHead(application.seq)
      }
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할 수행 가능
      const status = application.approvalStatus || 'A'
      if (status === 'A' || status === 'AM') {
        if (applicationType === 'VACATION') {
          await approveVacationByTeamLeader(application.seq)
        } else if (applicationType === 'EXPENSE') {
          await approveExpenseClaimByTeamLeader(application.seq)
        } else if (applicationType === 'RENTAL') {
          await approveRentalSupportByTeamLeader(application.seq)
        } else if (applicationType === 'RENTAL_APPROVAL') {
          await approveRentalApprovalByTeamLeader(application.seq)
        }
      } else if (status === 'B') {
        if (applicationType === 'VACATION') {
          await approveVacationByDivisionHead(application.seq)
        } else if (applicationType === 'EXPENSE') {
          await approveExpenseClaimByDivisionHead(application.seq)
        } else if (applicationType === 'RENTAL') {
          await approveRentalSupportByDivisionHead(application.seq)
        } else if (applicationType === 'RENTAL_APPROVAL') {
          await approveRentalApprovalByDivisionHead(application.seq)
        }
      }
    }
    
    console.log('승인 API 호출 성공, 목록 새로고침 시작')
    alert('승인되었습니다.')
    
    // 목록 새로고침 (현재 페이지 유지)
    if (applicationType === 'VACATION') {
      await loadVacationList(vacationCurrentPage.value - 1)
    } else if (applicationType === 'EXPENSE') {
      await loadExpenseList(expenseCurrentPage.value - 1)
    } else if (applicationType === 'RENTAL') {
      await loadRentalList(rentalCurrentPage.value - 1)
    } else if (applicationType === 'RENTAL_APPROVAL') {
      await loadRentalApprovalList(rentalApprovalCurrentPage.value - 1)
    }
    console.log('목록 새로고침 완료')
    
    closeDetailModal()
  } catch (error: any) {
    console.error('승인 실패:', error)
    console.error('에러 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || 
                        error.response?.data?.resultMsg || 
                        error.message || 
                        '승인에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isProcessing.value = null
  }
}

// 반려 처리
const handleReject = (application: PendingApproval | null) => {
  if (!application) return
  currentRejectItem.value = application
  rejectionReason.value = ''
  showRejectModal.value = true
}

// 반려 모달 닫기
const closeRejectModal = () => {
  showRejectModal.value = false
  currentRejectItem.value = null
  rejectionReason.value = ''
}

// 반려 확인
const confirmReject = async () => {
  if (!currentRejectItem.value || !user.value) return
  
  if (!rejectionReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }

  isProcessing.value = currentRejectItem.value.seq
  try {
    const authVal = user.value.authVal
    // applicationType을 applicationType 필드로 먼저 확인
    const applicationType = currentRejectItem.value.applicationType || 
                            (currentRejectItem.value.type ? 'VACATION' : 
                            (currentRejectItem.value.contractMonthlyRent ? 
                              (currentRejectItem.value.rentalAddress ? 'RENTAL_APPROVAL' : 'RENTAL') : 'EXPENSE'))
    
    console.log('반려 처리 시작:', { seq: currentRejectItem.value.seq, applicationType, authVal, currentStatus: currentRejectItem.value.approvalStatus })
    
    if (authVal === 'tj') {
      if (applicationType === 'VACATION') {
        await rejectVacationByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'EXPENSE') {
        await rejectExpenseClaimByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'RENTAL') {
        await rejectRentalSupportByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'RENTAL_APPROVAL') {
        await rejectRentalApprovalByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
      }
    } else if (authVal === 'bb') {
      if (applicationType === 'VACATION') {
        await rejectVacationByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'EXPENSE') {
        await rejectExpenseClaimByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'RENTAL') {
        await rejectRentalSupportByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
      } else if (applicationType === 'RENTAL_APPROVAL') {
        await rejectRentalApprovalByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
      }
    } else if (authVal === 'ma') {
      // 관리자는 팀장 또는 본부장 역할 수행 가능
      if (currentRejectItem.value.approvalStatus === 'A' || currentRejectItem.value.approvalStatus === 'AM') {
        if (applicationType === 'VACATION') {
          await rejectVacationByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'EXPENSE') {
          await rejectExpenseClaimByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'RENTAL') {
          await rejectRentalSupportByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'RENTAL_APPROVAL') {
          await rejectRentalApprovalByTeamLeader(currentRejectItem.value.seq, rejectionReason.value)
        }
      } else if (currentRejectItem.value.approvalStatus === 'B') {
        if (applicationType === 'VACATION') {
          await rejectVacationByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'EXPENSE') {
          await rejectExpenseClaimByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'RENTAL') {
          await rejectRentalSupportByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
        } else if (applicationType === 'RENTAL_APPROVAL') {
          await rejectRentalApprovalByDivisionHead(currentRejectItem.value.seq, rejectionReason.value)
        }
      }
    }
    
    console.log('반려 API 호출 성공, 목록 새로고침 시작')
    alert('반려되었습니다.')
    
    // 목록 새로고침 (현재 페이지 유지)
    const rejectApplicationType = currentRejectItem.value.applicationType || 
                            (currentRejectItem.value.type ? 'VACATION' : 
                            (currentRejectItem.value.contractMonthlyRent ? 
                              (currentRejectItem.value.rentalAddress ? 'RENTAL_APPROVAL' : 'RENTAL') : 'EXPENSE'))
    if (rejectApplicationType === 'VACATION') {
      await loadVacationList(vacationCurrentPage.value - 1)
    } else if (applicationType === 'EXPENSE') {
      await loadExpenseList(expenseCurrentPage.value - 1)
    } else if (applicationType === 'RENTAL') {
      await loadRentalList(rentalCurrentPage.value - 1)
    } else if (applicationType === 'RENTAL_APPROVAL') {
      await loadRentalApprovalList(rentalApprovalCurrentPage.value - 1)
    }
    console.log('목록 새로고침 완료')
    
    closeRejectModal()
    closeDetailModal()
  } catch (error: any) {
    console.error('반려 실패:', error)
    console.error('에러 상세:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || 
                        error.response?.data?.resultMsg || 
                        error.message || 
                        '반려에 실패했습니다.'
    alert(errorMessage)
  } finally {
    isProcessing.value = null
  }
}

// 사용자 정보 로드
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
}

onMounted(async () => {
  loadUserInfo()
  await loadPendingApprovals()
})

// 휴가 신청서 다운로드
const handleDownloadVacation = async (seq: number, applicant?: string) => {
  isDownloading.value = seq
  try {
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

// 개인 비용 청구서 다운로드
const handleDownloadExpenseClaim = async (seq: number, applicant?: string) => {
  isDownloading.value = seq
  try {
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

// 월세 지원 신청서 다운로드
const handleDownloadRentalApplication = async (seq: number, applicant?: string) => {
  isDownloading.value = seq
  try {
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

// 월세 지원 품의서 다운로드
const handleDownloadRentalProposal = async (seq: number, applicant?: string) => {
  isDownloading.value = seq
  try {
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

// 페이지가 활성화될 때마다 목록 새로고침 (다른 페이지에서 돌아올 때)
onActivated(async () => {
  await loadPendingApprovals()
})
</script>

<style scoped>
.approval-list-view {
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

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #e8f4f8 !important;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-buttons .btn-download {
  min-width: calc(2 * (0.4rem * 2 + 0.85rem * 3) + 0.5rem);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
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
  min-width: calc(2 * (0.4rem * 2 + 0.8rem * 2 + 2.5rem) + 0.5rem);
}

.btn-download:hover:not(:disabled) {
  background-color: #0f1f88;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
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

/* 월세 지원 품의서 모달 스타일 */
.rental-approval-modal {
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

.rental-modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rental-modal-content .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1226aa;
}

.rental-modal-content .modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.rental-modal-content .btn-close {
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
  transition: color 0.2s;
}

.rental-modal-content .btn-close:hover {
  color: #333;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}

.attachment-info .file-name {
  flex: 1;
  color: #2c3e50;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.attachment-info .file-size {
  color: #666;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.btn-download-file {
  padding: 0.4rem 0.8rem;
  background-color: #1226aa;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-download-file:hover {
  background-color: #0f1f8a;
}

.rental-detail-content {
  margin-top: 0;
}

.rental-detail-content .detail-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.rental-detail-content .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.rental-detail-content .detail-row:last-child {
  border-bottom: none;
}

.rental-detail-content .detail-label {
  min-width: 150px;
  font-weight: 500;
  color: #555;
  flex-shrink: 0;
}

.rental-detail-content .detail-value {
  flex: 1;
  color: #333;
  word-break: break-word;
  line-height: 1.5;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .rental-modal-content {
    max-width: 95%;
    padding: 1.5rem;
  }

  .rental-detail-content .detail-row {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 0;
  }

  .rental-detail-content .detail-label {
    min-width: auto;
    font-weight: 600;
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

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.rejection-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-confirm {
  background-color: #dc3545;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #c82333;
}

/* 상세 모달 스타일 */
.detail-modal {
  max-width: 600px;
  width: 90%;
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
  color: #1226aa;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin-bottom: 1rem;
  color: #1226aa;
  font-size: 1.1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
  margin-right: 1rem;
}

.detail-value {
  color: #333;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.modal-footer .btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .approval-list-view {
    padding: 1rem;
  }

  .application-section {
    padding: 1.5rem;
  }

  .data-table {
    font-size: 0.8rem;
    min-width: 800px;
  }

  .data-table th,
  .data-table td {
    padding: 0.6rem 0.4rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.3rem;
  }

  .btn-small {
    width: 100%;
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }

  /* 모바일에서 버튼 색상 명확하게 표시 */
  .btn-approve {
    background-color: #28a745 !important;
    color: white !important;
  }

  .btn-reject {
    background-color: #dc3545 !important;
    color: white !important;
  }

  .btn-download {
    background-color: #1226aa !important;
    color: white !important;
  }

  .btn-approve:disabled,
  .btn-reject:disabled,
  .btn-download:disabled {
    opacity: 0.6 !important;
    background-color: #6c757d !important;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
