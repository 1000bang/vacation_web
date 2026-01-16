/**
 * 포맷팅 유틸리티 함수
 * 
 * @author vacation-web
 * @version 1.0
 * @since 2026-01-16
 */

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅
 * 
 * @param dateString 날짜 문자열 (ISO 형식 또는 YYYY-MM-DD)
 * @returns 포맷팅된 날짜 문자열 (예: "2026.01.16")
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  } catch {
    return ''
  }
}

/**
 * 숫자를 천 단위 구분자로 포맷팅
 * 
 * @param num 포맷팅할 숫자
 * @returns 포맷팅된 숫자 문자열 (예: "1,000,000")
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('ko-KR')
}

/**
 * 청구 년월을 YYYY.MM 형식으로 포맷팅
 * 
 * @param billingYyMonth 청구 년월 (YYYYMM 형식, 예: 202601)
 * @returns 포맷팅된 문자열 (예: "2026.01")
 */
export const formatBillingYyMonth = (billingYyMonth: number | undefined | null): string => {
  if (!billingYyMonth) return ''
  const year = Math.floor(billingYyMonth / 100)
  const month = billingYyMonth % 100
  return `${year}.${month.toString().padStart(2, '0')}`
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅 (input type="date"용)
 * 
 * @param dateString 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: "2026-01-16")
 */
export const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * 
 * @returns 오늘 날짜 문자열
 */
export const getTodayDate = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
