/**
 * 승인 상태 코드 상수 (API ApprovalStatus.name과 동기화)
 */
export const APPROVAL_INITIAL = 'A'
export const APPROVAL_MODIFIED = 'AM'
export const APPROVAL_TEAM_LEADER_APPROVED = 'B'
export const APPROVAL_TEAM_LEADER_REJECTED = 'RB'
export const APPROVAL_DIVISION_HEAD_APPROVED = 'C'
export const APPROVAL_DIVISION_HEAD_REJECTED = 'RC'
export const APPROVAL_DONE = 'D'

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  [APPROVAL_INITIAL]: '요청',
  [APPROVAL_MODIFIED]: '수정후 재요청',
  [APPROVAL_TEAM_LEADER_APPROVED]: '팀장 승인',
  [APPROVAL_TEAM_LEADER_REJECTED]: '팀장 반려',
  [APPROVAL_DIVISION_HEAD_APPROVED]: '본부장 승인',
  [APPROVAL_DIVISION_HEAD_REJECTED]: '본부장 반려',
  [APPROVAL_DONE]: '최종 승인',
}
