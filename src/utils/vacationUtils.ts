/**
 * 휴가 관련 유틸리티 함수
 * 
 * @author vacation-web
 * @version 1.0
 * @since 2026-01-16
 */

/**
 * 휴가 타입 코드를 한글 이름으로 변환
 * 
 * @param type 휴가 타입 코드
 * @returns 한글 타입명
 */
export const getVacationTypeName = (type: string | undefined | null): string => {
  if (!type) return '-'
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
