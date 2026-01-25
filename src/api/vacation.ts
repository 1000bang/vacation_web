import apiClient from './axios'
import type { ApiResponse } from './types'
import { parseBlobDownload } from '@/utils/downloadUtils'

export interface VacationRequest {
  requestDate: string
  startDate: string
  endDate: string
  vacationType: string
  period?: number
  requestedVacationDays?: number
  reason?: string
  isCountedAsUsedVacation?: boolean
  annualVacationDays?: number
  previousRemainingDays?: number
  remainingVacationDays?: number
}

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
  annualVacationDays?: number
  previousRemainingDays?: number
  usedVacationDays?: number
  remainingVacationDays?: number
  approvalStatus?: string
}

export interface VacationHistoryDetail extends VacationHistory {
  rejectionReason?: string
  attachment?: { seq: number; fileName: string; fileSize: number }
}

export interface UserVacationInfoResponse {
  seq: number
  userId: number
  annualVacationDays: number
  usedVacationDays: number
  reservedVacationDays: number
  remainingVacationDays: number
  isFirstLogin: boolean
}

export interface UpdateVacationInfoRequest {
  annualVacationDays?: number
  usedVacationDays?: number
  reservedVacationDays?: number
}

export const getVacationHistoryList = async (page = 0, size = 5): Promise<ApiResponse<unknown>> => {
  const { data } = await apiClient.get('/vacation/history', { params: { page, size } })
  return data
}

export const getCalendarVacationList = async (year?: number, month?: number): Promise<ApiResponse<VacationHistory[]>> => {
  const params: Record<string, string> = {}
  if (year !== undefined) params.year = String(year)
  if (month !== undefined) params.month = String(month)
  const { data } = await apiClient.get<ApiResponse<VacationHistory[]>>('/vacation/calendar', { params })
  return data
}

export const getVacationHistory = async (seq: number): Promise<ApiResponse<VacationHistoryDetail>> => {
  const { data } = await apiClient.get<ApiResponse<VacationHistoryDetail>>(`/vacation/history/${seq}`)
  return data
}

export const downloadVacationDocument = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/vacation/history/${seq}/download`, { responseType: 'blob' })
  const ct = String((response.headers as Record<string, string>)['content-type'] || '').toLowerCase()
  const isZip = ct.includes('zip')
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return parseBlobDownload(response, `휴가(결무)신청서_${applicant || '신청자'}_${today}${isZip ? '.zip' : '.docx'}`)
}

export const deleteVacation = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/vacation/${seq}`)
  return data
}

export const getUserVacationInfo = async (): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserVacationInfoResponse>>('/vacation/info')
  return data
}

export const updateVacationInfo = async (r: UpdateVacationInfoRequest): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserVacationInfoResponse>>('/vacation/info', r)
  return data
}

export const getUserVacationInfoByUserId = async (userId: number): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserVacationInfoResponse>>(`/vacation/info/${userId}`)
  return data
}

export const updateUserVacationInfoByUserId = async (userId: number, r: UpdateVacationInfoRequest): Promise<ApiResponse<UserVacationInfoResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserVacationInfoResponse>>(`/vacation/info/${userId}`, r)
  return data
}
