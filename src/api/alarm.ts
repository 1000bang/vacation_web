import apiClient from './axios'
import type { ApiResponse } from './types'

export interface UserAlarm {
  seq: number
  userId: number
  alarmType: string
  applicationType: string
  applicationSeq: number
  message: string
  isRead: boolean
  redirectUrl: string
  createdAt: string
}

/**
 * 읽지 않은 알람 목록 조회
 */
export const getUnreadAlarms = async (): Promise<ApiResponse<UserAlarm[]>> => {
  const response = await apiClient.get<ApiResponse<UserAlarm[]>>('/alarm/unread')
  return response.data
}

/**
 * 모든 알람 목록 조회
 */
export const getAllAlarms = async (): Promise<ApiResponse<UserAlarm[]>> => {
  const response = await apiClient.get<ApiResponse<UserAlarm[]>>('/alarm/all')
  return response.data
}

/**
 * 알람 읽음 처리
 */
export const markAlarmAsRead = async (seq: number): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.put<ApiResponse<{ message: string }>>(`/alarm/${seq}/read`)
  return response.data
}

/**
 * 모든 알람 읽음 처리
 */
export const markAllAlarmsAsRead = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.put<ApiResponse<{ message: string }>>('/alarm/read-all')
  return response.data
}
