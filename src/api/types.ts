/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T> {
  transactionId: string
  resultCode: string
  resultMsg: T
  messageTemplateId?: string
}
