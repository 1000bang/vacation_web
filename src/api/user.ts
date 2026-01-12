import apiClient from './axios'

// 회원가입 요청 타입
export interface JoinRequest {
  email: string
  name: string
  password: string
  division: string
  team: string
  position: string
  joinDate: string
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string
  password: string
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  firstLogin: boolean
  authVal: string
}

// Refresh Token 요청 타입
export interface RefreshTokenRequest {
  refreshToken: string
}

// Refresh Token 응답 타입
export interface RefreshTokenResponse {
  accessToken: string
}

// API 응답 타입
export interface ApiResponse<T> {
  transactionId: string
  resultCode: string
  resultMsg: T
  messageTemplateId?: string
}

/**
 * 회원가입 API
 */
export const join = async (joinRequest: JoinRequest): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/user/join', joinRequest)
  return response.data
}

/**
 * 로그인 API
 */
export const login = async (loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/user/login', loginRequest)
  return response.data
}

/**
 * Refresh Token으로 새로운 Access Token 발급
 */
export const refreshToken = async (refreshTokenRequest: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/user/refresh', refreshTokenRequest)
  return response.data
}

// 사용자 정보 응답 타입
export interface UserInfoResponse {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  firstLogin: boolean
  joinDate: string
  authVal: string
}

// 사용자 정보 수정 요청 타입
export interface UpdateUserRequest {
  division: string
  team: string
  position: string
  joinDate?: string
  status?: string
  authVal?: string
  firstLogin?: boolean
}

// 월세 지원 정보 타입 (품의서와 청구서 공통)
export interface RentalSupport {
  seq: number
  userId: number
  // 품의서용 필드
  previousAddress?: string
  rentalAddress?: string
  billingReason?: string
  // 청구서용 필드
  requestDate?: string
  billingYyMonth?: number // YYYYMM 형식 (예: 202501)
  paymentType?: 'PREPAID' | 'POSTPAID'
  billingPeriodStartDate?: string
  billingPeriodEndDate?: string
  paymentDate?: string
  paymentAmount?: number
  // 공통 필드
  contractStartDate: string
  contractEndDate: string
  contractMonthlyRent: number
  billingAmount: number
  billingStartDate: string
  applicant?: string
}

// 월세 지원 정보 요청 타입
export interface RentalSupportRequest {
  requestDate: string
  month: number
  contractStartDate: string
  contractEndDate: string
  contractMonthlyRent: number
  paymentType: 'PREPAID' | 'POSTPAID'
  billingStartDate: string
  billingPeriodStartDate: string
  billingPeriodEndDate: string
  paymentDate: string
  paymentAmount: number
  billingAmount: number
}

/**
 * 사용자 정보 조회
 */
export const getUserInfo = async (): Promise<ApiResponse<UserInfoResponse>> => {
  const response = await apiClient.get<ApiResponse<UserInfoResponse>>('/user/info')
  return response.data
}

/**
 * 사용자 정보 수정
 */
export const updateUserInfo = async (updateRequest: UpdateUserRequest): Promise<ApiResponse<UserInfoResponse>> => {
  const response = await apiClient.put<ApiResponse<UserInfoResponse>>('/user/info', updateRequest)
  return response.data
}

/**
 * 월세 지원 정보 목록 조회
 */
export const getRentalSupportList = async (): Promise<ApiResponse<RentalSupport[]>> => {
  const response = await apiClient.get<ApiResponse<RentalSupport[]>>('/rental')
  return response.data
}

/**
 * 월세 지원 정보 조회
 */
export const getRentalSupport = async (seq: number): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.get<ApiResponse<RentalSupport>>(`/rental/${seq}`)
  return response.data
}

/**
 * 월세 지원 신청 조회 (청구서용)
 */
export const getRentalSupportApplication = async (seq: number): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.get<ApiResponse<RentalSupport>>(`/rental/application/${seq}`)
  return response.data
}

/**
 * 월세 지원 정보 생성 (품의서용)
 */
export const createRentalSupport = async (rentalSupportRequest: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.post<ApiResponse<RentalSupport>>('/rental', rentalSupportRequest)
  return response.data
}

/**
 * 월세 지원 신청 목록 조회 (청구서용, 페이징)
 */
export const getRentalSupportApplicationList = async (page: number = 0, size: number = 5): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/rental/application', {
    params: { page, size }
  })
  return response.data
}

/**
 * 월세 지원 신청 생성 (청구서용)
 */
export const createRentalSupportApplication = async (rentalSupportRequest: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.post<ApiResponse<RentalSupport>>('/rental/application', rentalSupportRequest)
  return response.data
}

/**
 * 월세 지원 신청 수정 (청구서용)
 */
export const updateRentalSupportApplication = async (seq: number, rentalSupportRequest: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.put<ApiResponse<RentalSupport>>(`/rental/application/${seq}`, rentalSupportRequest)
  return response.data
}

/**
 * 월세 지원 정보 수정
 */
export const updateRentalSupport = async (seq: number, rentalSupportRequest: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const response = await apiClient.put<ApiResponse<RentalSupport>>(`/rental/${seq}`, rentalSupportRequest)
  return response.data
}

/**
 * 월세 지원 정보 삭제 (품의서용)
 */
export const deleteRentalSupport = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/rental/${seq}`)
  return response.data
}

/**
 * 월세 지원 신청 삭제 (청구서용)
 */
export const deleteRentalSupportApplication = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/rental/application/${seq}`)
  return response.data
}

/**
 * 월세 지원 신청서 다운로드 (청구서용)
 */
export const downloadRentalSupportApplication = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/rental/application/${seq}/download`, {
    responseType: 'blob'
  })
  
  // Content-Disposition 헤더에서 파일명 추출
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
  
  // 파일명 생성: applicant와 오늘 날짜 사용
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let filename = `월세지원신청서_${applicant || '신청자'}_${today}.xlsx`
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
      try {
        filename = decodeURIComponent(filename)
      } catch {
        // 디코딩 실패 시 그대로 사용
      }
    }
  }
  
  return {
    blob: response.data,
    filename
  }
}

/**
 * 월세 지원 품의서 다운로드
 */
export const downloadRentalProposal = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/rental/${seq}/download-proposal`, {
    responseType: 'blob'
  })
  
  // Content-Disposition 헤더에서 파일명 추출
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
  
  // 파일명 생성: applicant와 오늘 날짜 사용
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let filename = `월세지원품의서_${applicant || '신청자'}_${today}.docx`
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
      try {
        filename = decodeURIComponent(filename)
      } catch {
        // 디코딩 실패 시 그대로 사용
      }
    }
  }
  
  return {
    blob: response.data,
    filename
  }
}

// 개인 비용 청구 타입
export interface ExpenseClaim {
  seq: number
  userId: number
  requestDate: string // 신청일자
  billingYyMonth: number // YYYYMM 형식 (예: 202501)
  childCnt: number
  totalAmount?: number
  applicant?: string
}

export interface ExpenseSub {
  seq: number
  parentSeq: number
  childNo: number
  date: string
  usageDetail?: string
  vendor?: string
  paymentMethod?: string
  project?: string
  amount: number
  note?: string
}

export interface ExpenseItem {
  date: string
  usageDetail?: string
  vendor?: string
  paymentMethod?: string
  project?: string
  amount: number
  note?: string
}

export interface ExpenseClaimDetail {
  expenseClaim: ExpenseClaim
  expenseSubList: ExpenseSub[]
}

export interface ExpenseClaimRequest {
  requestDate: string
  month: number
  expenseItems: ExpenseItem[]
}

/**
 * 개인 비용 청구 목록 조회 (페이징)
 */
export const getExpenseClaimList = async (page: number = 0, size: number = 5): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/expense', {
    params: { page, size }
  })
  return response.data
}

/**
 * 개인 비용 청구 조회
 */
export const getExpenseClaim = async (seq: number): Promise<ApiResponse<ExpenseClaimDetail>> => {
  const response = await apiClient.get<ApiResponse<ExpenseClaimDetail>>(`/expense/${seq}`)
  return response.data
}

/**
 * 개인 비용 청구 생성
 */
export const createExpenseClaim = async (expenseClaimRequest: ExpenseClaimRequest): Promise<ApiResponse<ExpenseClaim>> => {
  const response = await apiClient.post<ApiResponse<ExpenseClaim>>('/expense', expenseClaimRequest)
  return response.data
}

/**
 * 개인 비용 청구 수정
 */
export const updateExpenseClaim = async (seq: number, expenseClaimRequest: ExpenseClaimRequest): Promise<ApiResponse<ExpenseClaim>> => {
  const response = await apiClient.put<ApiResponse<ExpenseClaim>>(`/expense/${seq}`, expenseClaimRequest)
  return response.data
}

/**
 * 개인 비용 청구 삭제
 */
export const deleteExpenseClaim = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/expense/${seq}`)
  return response.data
}

/**
 * 개인 비용 청구서 다운로드
 */
export const downloadExpenseClaim = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/expense/${seq}/download`, {
    responseType: 'blob'
  })
  
  // Content-Disposition 헤더에서 파일명 추출
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
  
  // 파일명 생성: applicant와 오늘 날짜 사용
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let filename = `개인비용신청서_${applicant || '신청자'}_${today}.xlsx`
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
      try {
        filename = decodeURIComponent(filename)
      } catch {
        // 디코딩 실패 시 그대로 사용
      }
    }
  }
  
  return {
    blob: response.data,
    filename
  }
}

// 연차 정보 응답 타입
export interface UserVacationInfoResponse {
  seq: number
  userId: number
  annualVacationDays: number
  usedVacationDays: number
  reservedVacationDays: number
  remainingVacationDays: number
  firstLogin: boolean
}

/**
 * 연차 정보 조회
 */
export const getUserVacationInfo = async (): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const response = await apiClient.get<ApiResponse<UserVacationInfoResponse>>('/vacation/info')
  return response.data
}

// 연차 정보 수정 요청 타입
export interface UpdateVacationInfoRequest {
  annualVacationDays?: number
  usedVacationDays?: number
  reservedVacationDays?: number
}

/**
 * 연차 정보 수정
 */
export const updateVacationInfo = async (updateRequest: UpdateVacationInfoRequest): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const response = await apiClient.put<ApiResponse<UserVacationInfoResponse>>('/vacation/info', updateRequest)
  return response.data
}

// 사용자 목록 항목 타입
export interface UserListItem {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  joinDate: string
  authVal: string
}

/**
 * 사용자 목록 조회
 */
export const getUserInfoList = async (): Promise<ApiResponse<UserListItem[]>> => {
  const response = await apiClient.get<ApiResponse<UserListItem[]>>('/user/info/list')
  return response.data
}

/**
 * 특정 사용자 정보 조회 (관리자용)
 */
export const getUserInfoByUserId = async (userId: number): Promise<ApiResponse<UserInfoResponse>> => {
  const response = await apiClient.get<ApiResponse<UserInfoResponse>>(`/user/info/${userId}`)
  return response.data
}

/**
 * 특정 사용자 정보 수정 (관리자용)
 */
export const updateUserInfoByUserId = async (userId: number, updateRequest: UpdateUserRequest): Promise<ApiResponse<UserInfoResponse>> => {
  const response = await apiClient.put<ApiResponse<UserInfoResponse>>(`/user/info/${userId}`, updateRequest)
  return response.data
}

