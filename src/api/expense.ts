import apiClient from './axios'
import type { ApiResponse } from './types'
import { parseBlobDownload } from '@/utils/downloadUtils'

export interface ExpenseClaim {
  seq: number
  userId: number
  requestDate: string
  billingYyMonth: number
  childCnt: number
  approvalStatus?: string
  totalAmount?: number
  applicant?: string
}

export interface ExpenseSub {
  seq: number
  parentSeq: number
  expenseClaimSeq?: number
  childNo: number
  date: string
  usageDetail?: string
  itemName?: string
  vendor?: string
  paymentMethod?: string
  project?: string
  amount: number
  note?: string
  description?: string
  createdAt?: string
  attachment?: { seq: number; fileName: string; fileSize: number }
}

export interface ExpenseItem {
  date: string
  usageDetail?: string
  vendor?: string
  paymentMethod?: string
  project?: string
  amount: number
  note?: string
  expenseSubSeq?: number
  attachment?: { seq: number; fileName: string; fileSize: number }
}

export interface ExpenseClaimDetail extends ExpenseClaim {
  expenseSubList: ExpenseSub[]
}

export interface ExpenseClaimRequest {
  requestDate: string
  month: number
  expenseItems: ExpenseItem[]
}

export const getExpenseClaimList = async (page = 0, size = 5): Promise<ApiResponse<unknown>> => {
  const { data } = await apiClient.get('/expense', { params: { page, size } })
  return data
}

export const getExpenseClaim = async (seq: number): Promise<ApiResponse<ExpenseClaimDetail>> => {
  const { data } = await apiClient.get<ApiResponse<ExpenseClaimDetail>>(`/expense/${seq}`)
  return data
}

export const createExpenseClaim = async (r: ExpenseClaimRequest): Promise<ApiResponse<ExpenseClaim>> => {
  const { data } = await apiClient.post<ApiResponse<ExpenseClaim>>('/expense', r)
  return data
}

export const updateExpenseClaim = async (seq: number, r: ExpenseClaimRequest): Promise<ApiResponse<ExpenseClaim>> => {
  const { data } = await apiClient.put<ApiResponse<ExpenseClaim>>(`/expense/${seq}`, r)
  return data
}

export const deleteExpenseClaim = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/expense/${seq}`)
  return data
}

export const downloadExpenseClaim = async (seq: number, applicant?: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/expense/${seq}/download`, { responseType: 'blob' })
  const ct = String((response.headers as Record<string, string>)['content-type'] || '').toLowerCase()
  const isZip = ct.includes('zip')
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return parseBlobDownload(response, `개인비용신청서_${applicant || '신청자'}_${today}${isZip ? '.zip' : '.xlsx'}`)
}

export const uploadExpenseItemFile = async (seq: number, expenseSubSeq: number, file: File): Promise<ApiResponse<unknown>> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post(`/expense/${seq}/item/${expenseSubSeq}/file`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data
}

export const downloadExpenseItemFile = async (seq: number, expenseSubSeq: number): Promise<{ blob: Blob; filename: string }> => {
  const response = await apiClient.get(`/expense/${seq}/item/${expenseSubSeq}/file`, { responseType: 'blob' })
  return parseBlobDownload(response, `첨부파일_${expenseSubSeq}`)
}

export const deleteExpenseItemFile = async (seq: number, expenseSubSeq: number): Promise<ApiResponse<unknown>> => {
  const { data } = await apiClient.delete(`/expense/${seq}/item/${expenseSubSeq}/file`)
  return data
}
