/**
 * API 에러 메시지 추출
 * BaseController (resultMsg.errorMessage) / GlobalExceptionHandler (errorMessage) 형식 모두 처리
 */
export function getApiErrorMessage(error: unknown, fallback: string = '오류가 발생했습니다.'): string {
  const e = error as { response?: { data?: { resultMsg?: { errorMessage?: string }; errorMessage?: string }; message?: string }; message?: string }
  return e?.response?.data?.resultMsg?.errorMessage ??
    e?.response?.data?.errorMessage ??
    e?.response?.data?.message ??
    e?.message ??
    fallback
}
