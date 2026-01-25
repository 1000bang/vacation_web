import apiClient from './axios'
import type { ApiResponse } from './types'

export interface PendingApproval {
  seq: number
  userId: number
  applicant: string
  applicationType?: string
  startDate?: string
  endDate?: string
  period?: number
  usedVacationDays?: number
  type?: string
  reason?: string
  approvalStatus: string | null
  createdAt: string
  requestDate?: string
  billingYyMonth?: number
  childCnt?: number
  totalAmount?: number
  contractMonthlyRent?: number
  billingAmount?: number
  paymentDate?: string
  requestDateRental?: string
  billingYyMonthRental?: number
  rentalAddress?: string
  contractStartDate?: string
  contractEndDate?: string
  billingStartDate?: string
}

type PendingResult = {
  vacation?: { list: PendingApproval[]; totalCount: number }
  expense?: { list: PendingApproval[]; totalCount: number }
  rental?: { list: PendingApproval[]; totalCount: number }
  rentalProposal?: { list: PendingApproval[]; totalCount: number }
}

export const getPendingApprovals = async (type?: string, listType?: string, page = 0, size = 5): Promise<ApiResponse<PendingResult>> => {
  const { data } = await apiClient.get<ApiResponse<PendingResult>>('/approval/pending', {
    params: { ...(type ? { type } : {}), ...(listType ? { listType } : {}), page, size }
  })
  return data
}

export const approveVacationByTeamLeader = async (seq: number) => apiClient.post(`/approval/vacation/${seq}/approve/team-leader`).then(r => r.data)
export const rejectVacationByTeamLeader = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/vacation/${seq}/reject/team-leader`, { rejectionReason }).then(r => r.data)
export const approveVacationByDivisionHead = async (seq: number) => apiClient.post(`/approval/vacation/${seq}/approve/division-head`).then(r => r.data)
export const rejectVacationByDivisionHead = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/vacation/${seq}/reject/division-head`, { rejectionReason }).then(r => r.data)
export const approveExpenseClaimByTeamLeader = async (seq: number) => apiClient.post(`/approval/expense/${seq}/approve/team-leader`).then(r => r.data)
export const rejectExpenseClaimByTeamLeader = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/expense/${seq}/reject/team-leader`, { rejectionReason }).then(r => r.data)
export const approveExpenseClaimByDivisionHead = async (seq: number) => apiClient.post(`/approval/expense/${seq}/approve/division-head`).then(r => r.data)
export const rejectExpenseClaimByDivisionHead = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/expense/${seq}/reject/division-head`, { rejectionReason }).then(r => r.data)
export const approveRentalSupportByTeamLeader = async (seq: number) => apiClient.post(`/approval/rental/${seq}/approve/team-leader`).then(r => r.data)
export const rejectRentalSupportByTeamLeader = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/rental/${seq}/reject/team-leader`, { rejectionReason }).then(r => r.data)
export const approveRentalSupportByDivisionHead = async (seq: number) => apiClient.post(`/approval/rental/${seq}/approve/division-head`).then(r => r.data)
export const rejectRentalSupportByDivisionHead = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/rental/${seq}/reject/division-head`, { rejectionReason }).then(r => r.data)
export const approveRentalProposalByTeamLeader = async (seq: number) => apiClient.post(`/approval/rental-proposal/${seq}/approve/team-leader`).then(r => r.data)
export const rejectRentalProposalByTeamLeader = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/rental-proposal/${seq}/reject/team-leader`, { rejectionReason }).then(r => r.data)
export const approveRentalProposalByDivisionHead = async (seq: number) => apiClient.post(`/approval/rental-proposal/${seq}/approve/division-head`).then(r => r.data)
export const rejectRentalProposalByDivisionHead = async (seq: number, rejectionReason: string) => apiClient.post(`/approval/rental-proposal/${seq}/reject/division-head`, { rejectionReason }).then(r => r.data)
export const approveVacationByMaster = async (seq: number) => apiClient.post(`/approval/vacation/${seq}/approve/master`).then(r => r.data)
export const approveExpenseClaimByMaster = async (seq: number) => apiClient.post(`/approval/expense/${seq}/approve/master`).then(r => r.data)
export const approveRentalSupportByMaster = async (seq: number) => apiClient.post(`/approval/rental/${seq}/approve/master`).then(r => r.data)
export const approveRentalProposalByMaster = async (seq: number) => apiClient.post(`/approval/rental-proposal/${seq}/approve/master`).then(r => r.data)
