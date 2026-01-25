/**
 * 승인 상태 관련 유틸리티 함수
 *
 * @author vacation-web
 * @version 1.0
 * @since 2026-01-16
 */

import {
  APPROVAL_INITIAL,
  APPROVAL_MODIFIED,
  APPROVAL_TEAM_LEADER_APPROVED,
  APPROVAL_TEAM_LEADER_REJECTED,
  APPROVAL_DIVISION_HEAD_APPROVED,
  APPROVAL_DIVISION_HEAD_REJECTED,
  APPROVAL_STATUS_LABELS,
} from '@/constants/approval'

/**
 * 승인 상태 코드를 한글 이름으로 변환
 *
 * @param status 승인 상태 코드
 * @returns 한글 상태명
 */
export const getApprovalStatusName = (status: string | undefined | null): string => {
  const actualStatus = status || APPROVAL_INITIAL
  return APPROVAL_STATUS_LABELS[actualStatus] || actualStatus
}

/**
 * 승인 상태에 따른 CSS 클래스 반환
 *
 * @param status 승인 상태 코드
 * @returns CSS 클래스명
 */
export const getApprovalStatusClass = (status: string | undefined | null): string => {
  const actualStatus = status || APPROVAL_INITIAL
  if (actualStatus === APPROVAL_TEAM_LEADER_REJECTED || actualStatus === APPROVAL_DIVISION_HEAD_REJECTED) {
    return 'status-rejected'
  }
  if (actualStatus === APPROVAL_DIVISION_HEAD_APPROVED) {
    return 'status-final-approved'
  }
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
  const actualStatus = status || APPROVAL_INITIAL
  return actualStatus === APPROVAL_INITIAL || actualStatus === APPROVAL_TEAM_LEADER_REJECTED || actualStatus === APPROVAL_DIVISION_HEAD_REJECTED
}

/**
 * 수정 가능 여부 확인
 * A(초기 생성), AM(수정됨), B(팀장 승인) 상태만 수정 가능
 *
 * @param status 승인 상태 코드
 * @returns 수정 가능 여부
 */
export const canEdit = (status: string | undefined | null): boolean => {
  const actualStatus = status || APPROVAL_INITIAL
  return actualStatus === APPROVAL_INITIAL || actualStatus === APPROVAL_MODIFIED || actualStatus === APPROVAL_TEAM_LEADER_APPROVED
}

/**
 * 승인 가능 여부 확인 (팀장용)
 * A, AM 상태만 승인 가능
 *
 * @param status 승인 상태 코드
 * @returns 승인 가능 여부
 */
export const canApproveByTeamLeader = (status: string | undefined | null): boolean => {
  const actualStatus = status || APPROVAL_INITIAL
  return actualStatus === APPROVAL_INITIAL || actualStatus === APPROVAL_MODIFIED
}

/**
 * 승인 가능 여부 확인 (본부장용)
 * B 상태만 승인 가능
 *
 * @param status 승인 상태 코드
 * @returns 승인 가능 여부
 */
export const canApproveByDivisionHead = (status: string | undefined | null): boolean => {
  const actualStatus = status || APPROVAL_INITIAL
  return actualStatus === APPROVAL_TEAM_LEADER_APPROVED
}

/**
 * 반려 가능 여부 확인
 * A, AM, B 상태만 반려 가능
 *
 * @param status 승인 상태 코드
 * @returns 반려 가능 여부
 */
export const canReject = (status: string | undefined | null): boolean => {
  const actualStatus = status || APPROVAL_INITIAL
  return actualStatus === APPROVAL_INITIAL || actualStatus === APPROVAL_MODIFIED || actualStatus === APPROVAL_TEAM_LEADER_APPROVED
}
