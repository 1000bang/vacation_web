/**
 * 승인 상태 관련 유틸리티 함수
 * 
 * @author vacation-web
 * @version 1.0
 * @since 2026-01-16
 */

/**
 * 승인 상태 코드를 한글 이름으로 변환
 * 
 * @param status 승인 상태 코드
 * @returns 한글 상태명
 */
export const getApprovalStatusName = (status: string | undefined | null): string => {
  const actualStatus = status || 'A'
  const statusMap: Record<string, string> = {
    'A': '요청',
    'AM': '수정후 재요청',
    'B': '팀장 승인',
    'RB': '팀장 반려',
    'C': '본부장 승인',
    'RC': '본부장 반려'
  }
  return statusMap[actualStatus] || actualStatus
}

/**
 * 승인 상태에 따른 CSS 클래스 반환
 * 
 * @param status 승인 상태 코드
 * @returns CSS 클래스명
 */
export const getApprovalStatusClass = (status: string | undefined | null): string => {
  const actualStatus = status || 'A'
  // 반려 상태만 빨간색
  if (actualStatus === 'RB' || actualStatus === 'RC') {
    return 'status-rejected'
  }
  // 최종 승인 상태만 초록색
  if (actualStatus === 'C') {
    return 'status-final-approved'
  }
  // 나머지는 기본 색상
  return 'status-default'
}

/**
 * 삭제 가능 여부 확인
 * A(초기 생성), RB(팀장 반려), RC(본부장 반려) 상태만 삭제 가능
 * 
 * @param status 승인 상태 코드
 * @returns 삭제 가능 여부
 */
export const canDelete = (status: string | undefined | null): boolean => {
  const actualStatus = status || 'A'
  return actualStatus === 'A' || actualStatus === 'RB' || actualStatus === 'RC'
}

/**
 * 수정 가능 여부 확인
 * A(초기 생성), AM(수정됨), B(팀장 승인) 상태만 수정 가능
 * 
 * @param status 승인 상태 코드
 * @returns 수정 가능 여부
 */
export const canEdit = (status: string | undefined | null): boolean => {
  const actualStatus = status || 'A'
  return actualStatus === 'A' || actualStatus === 'AM' || actualStatus === 'B'
}

/**
 * 승인 가능 여부 확인 (팀장용)
 * A, AM 상태만 승인 가능
 * 
 * @param status 승인 상태 코드
 * @returns 승인 가능 여부
 */
export const canApproveByTeamLeader = (status: string | undefined | null): boolean => {
  const actualStatus = status || 'A'
  return actualStatus === 'A' || actualStatus === 'AM'
}

/**
 * 승인 가능 여부 확인 (본부장용)
 * B 상태만 승인 가능
 * 
 * @param status 승인 상태 코드
 * @returns 승인 가능 여부
 */
export const canApproveByDivisionHead = (status: string | undefined | null): boolean => {
  const actualStatus = status || 'A'
  return actualStatus === 'B'
}

/**
 * 반려 가능 여부 확인
 * A, AM, B 상태만 반려 가능
 * 
 * @param status 승인 상태 코드
 * @returns 반려 가능 여부
 */
export const canReject = (status: string | undefined | null): boolean => {
  const actualStatus = status || 'A'
  return actualStatus === 'A' || actualStatus === 'AM' || actualStatus === 'B'
}
