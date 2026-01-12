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
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="expense in expenseClaimList" :key="expense.seq">
                <!-- 부모 행 -->
                <tr 
                  class="parent-row"
                  :class="{ 'expanded': expandedExpenseClaims.includes(expense.seq) }"
                >
                  <td class="expand-icon" @click.stop="toggleExpenseDetail(expense.seq)">
                    <span class="icon">{{ expandedExpenseClaims.includes(expense.seq) ? '▼' : '▶' }}</span>
                  </td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatDate(expense.requestDate) }}</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatBillingYyMonth(expense.billingYyMonth) }}</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ expense.childCnt }}개</td>
                  <td class="clickable-cell" @click="handleEditExpenseClaim(expense.seq)">{{ formatNumber(expense.totalAmount || 0) }}원</td>
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
                        @click="handleDeleteExpenseClaim(expense.seq)"
                        class="btn btn-delete btn-small"
                        :disabled="isDeleting === expense.seq"
                      >
                        {{ isDeleting === expense.seq ? '삭제 중...' : '삭제' }}
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- 자식 행들 (펼쳐질 때만 표시) -->
                <tr v-if="expandedExpenseClaims.includes(expense.seq)" class="child-row">
                  <td colspan="6">
                    <div class="expense-detail-container">
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
                          <tr v-for="sub in expenseDetailMap[expense.seq]?.expenseSubList || []" :key="sub.seq">
                            <td>{{ formatDate(sub.date) }}</td>
                            <td>{{ sub.usageDetail || '-' }}</td>
                            <td>{{ sub.vendor || '-' }}</td>
                            <td>{{ sub.paymentMethod || '-' }}</td>
                            <td>{{ sub.project || '-' }}</td>
                            <td>{{ formatNumber(sub.amount) }}원</td>
                            <td>{{ sub.note || '-' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
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
  type RentalSupport,
  type ExpenseClaim,
  type ExpenseClaimDetail
} from '@/api/user'

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
const expandedExpenseClaims = ref<number[]>([])
const isDownloading = ref<number | null>(null)
const isDeleting = ref<number | null>(null)

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
const formatBillingYyMonth = (billingYyMonth: number): string => {
  if (!billingYyMonth) return ''
  const year = Math.floor(billingYyMonth / 100)
  const month = billingYyMonth % 100
  return `${year}.${month.toString().padStart(2, '0')}`
}

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

// 개인 비용 상세 정보 토글
const toggleExpenseDetail = async (seq: number) => {
  const index = expandedExpenseClaims.value.indexOf(seq)
  
  if (index > -1) {
    // 이미 펼쳐져 있으면 닫기
    expandedExpenseClaims.value.splice(index, 1)
  } else {
    // 펼치기
    expandedExpenseClaims.value.push(seq)
    
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
      }
    }
  }
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
    const index = expandedExpenseClaims.value.indexOf(seq)
    if (index > -1) {
      expandedExpenseClaims.value.splice(index, 1)
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

.data-table td .action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  align-items: center;
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
}

.expense-detail-container {
  padding: 1rem;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.expense-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
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

  /* 버튼 크기 조정 */
  .action-buttons {
    flex-direction: column;
    gap: 0.3rem;
    min-width: 70px;
    align-items: stretch;
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
</style>

