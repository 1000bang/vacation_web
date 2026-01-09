import apiClient from './axios'

// 휴가 신청 요청 타입
export interface VacationRequest {
  requestDate: string
  startDate: string
  endDate: string
  vacationType: string
  requestedVacationDays: number
  reason?: string
}

// 휴가 내역 응답 타입
export interface VacationHistory {
  seq: number
  userId: number
  startDate: string
  endDate: string
  period: number
  type: string
  reason?: string
  requestDate: string
  applicant?: string
}

// API 응답 타입
export interface ApiResponse<T> {
  transactionId: string
  resultCode: string
  resultMsg: T
  messageTemplateId?: string
}

/**
 * 휴가 신청
 */
export const createVacation = async (vacationRequest: VacationRequest): Promise<ApiResponse<VacationHistory>> => {
  const requestData = {
    requestDate: vacationRequest.requestDate,
    startDate: vacationRequest.startDate,
    endDate: vacationRequest.endDate,
    vacationType: vacationRequest.vacationType,
    period: vacationRequest.requestedVacationDays,
    reason: vacationRequest.reason || ''
  }
  const response = await apiClient.post<ApiResponse<VacationHistory>>('/vacation', requestData)
  return response.data
}

/**
 * 휴가 내역 목록 조회
 */
export const getVacationHistoryList = async (): Promise<ApiResponse<VacationHistory[]>> => {
  const response = await apiClient.get<ApiResponse<VacationHistory[]>>('/vacation/history')
  return response.data
}

/**
 * 휴가 내역 조회
 */
export const getVacationHistory = async (seq: number): Promise<ApiResponse<VacationHistory>> => {
  const response = await apiClient.get<ApiResponse<VacationHistory>>(`/vacation/history/${seq}`)
  return response.data
}

/**
 * 휴가 신청서 다운로드
 */
export const downloadVacationDocument = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/vacation/history/${seq}/download`, {
    responseType: 'blob'
  })
  
  // Content-Disposition 헤더에서 파일명 추출
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
  
  // 파일명 생성: applicant와 오늘 날짜 사용
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let filename = `휴가(결무)신청서_${applicant || '신청자'}_${today}.docx`
  
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
 * 휴가 신청 삭제
 */
export const deleteVacation = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/vacation/${seq}`)
  return response.data
}

// 연차 정보 응답 타입
export interface UserVacationInfoResponse {
  seq: number
  userId: number
  annualVacationDays: number
  usedVacationDays: number
  reservedVacationDays: number
  remainingVacationDays: number
  isFirstLogin: boolean
}

// 연차 정보 수정 요청 타입
export interface UpdateVacationInfoRequest {
  annualVacationDays?: number
  usedVacationDays?: number
  reservedVacationDays?: number
}

/**
 * 특정 사용자 연차 정보 조회 (관리자용)
 */
export const getUserVacationInfoByUserId = async (userId: number): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const response = await apiClient.get<ApiResponse<UserVacationInfoResponse>>(`/vacation/info/${userId}`)
  return response.data
}

/**
 * 특정 사용자 연차 정보 수정 (관리자용)
 */
export const updateUserVacationInfoByUserId = async (userId: number, updateRequest: UpdateVacationInfoRequest): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const response = await apiClient.put<ApiResponse<UserVacationInfoResponse>>(`/vacation/info/${userId}`, updateRequest)
  return response.data
}

