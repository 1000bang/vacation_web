import apiClient from './axios'
import type { ApiResponse } from './types'
import { parseBlobDownload } from '@/utils/downloadUtils'

export interface RentalSupport {
  seq: number
  userId: number
  approvalStatus?: string
  previousAddress?: string
  rentalAddress?: string
  billingReason?: string
  requestDate?: string
  billingYyMonth?: number
  paymentType?: 'PREPAID' | 'POSTPAID'
  billingPeriodStartDate?: string
  billingPeriodEndDate?: string
  paymentDate?: string
  paymentAmount?: number
  contractStartDate: string
  contractEndDate: string
  contractMonthlyRent: number
  billingAmount: number
  billingStartDate: string
  applicant?: string
}

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

export const getRentalSupportList = async (): Promise<ApiResponse<RentalSupport[]>> => {
  const { data } = await apiClient.get<ApiResponse<RentalSupport[]>>('/rental')
  return data
}

export const getRentalSupport = async (seq: number): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.get<ApiResponse<RentalSupport>>(`/rental/${seq}`)
  return data
}

export const getRentalSupportApplication = async (seq: number): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.get<ApiResponse<RentalSupport>>(`/rental/application/${seq}`)
  return data
}

export const createRentalSupport = async (r: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.post<ApiResponse<RentalSupport>>('/rental', r)
  return data
}

export const getRentalSupportApplicationList = async (page = 0, size = 5): Promise<ApiResponse<unknown>> => {
  const { data } = await apiClient.get('/rental/application', { params: { page, size } })
  return data
}

export const createRentalSupportApplication = async (r: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.post<ApiResponse<RentalSupport>>('/rental/application', r)
  return data
}

export const updateRentalSupportApplication = async (seq: number, r: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.put<ApiResponse<RentalSupport>>(`/rental/application/${seq}`, r)
  return data
}

export const updateRentalSupport = async (seq: number, r: RentalSupportRequest): Promise<ApiResponse<RentalSupport>> => {
  const { data } = await apiClient.put<ApiResponse<RentalSupport>>(`/rental/${seq}`, r)
  return data
}

export const deleteRentalSupport = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/rental/${seq}`)
  return data
}

export const deleteRentalSupportApplication = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/rental/application/${seq}`)
  return data
}

export const downloadRentalSupportApplication = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/rental/application/${seq}/download`, { responseType: 'blob' })
  const ct = String((response.headers as Record<string, string>)['content-type'] || '').toLowerCase()
  const isZip = ct.includes('zip')
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return parseBlobDownload(response, `월세지원신청서_${applicant || '신청자'}_${today}${isZip ? '.zip' : '.xlsx'}`)
}

export const downloadRentalProposal = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/rental/${seq}/download-proposal`, { responseType: 'blob' })
  const ct = String((response.headers as Record<string, string>)['content-type'] || '').toLowerCase()
  const isZip = ct.includes('zip')
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return parseBlobDownload(response, `월세지원품의서_${applicant || '신청자'}_${today}${isZip ? '.zip' : '.docx'}`)
}
