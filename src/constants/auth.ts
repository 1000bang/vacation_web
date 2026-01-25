/**
 * 권한 코드 상수 (API AuthVal과 동기화)
 */
export const AUTH_MASTER = 'ma'
export const AUTH_DIVISION_HEAD = 'bb'
export const AUTH_TEAM_LEADER = 'tj'
export const AUTH_TEAM_MEMBER = 'tw'

export const AUTH_LABELS: Record<string, string> = {
  [AUTH_MASTER]: '마스터',
  [AUTH_DIVISION_HEAD]: '본부장',
  [AUTH_TEAM_LEADER]: '팀장',
  [AUTH_TEAM_MEMBER]: '팀원',
}
