import apiClient from './axios'
import type { ApiResponse } from './types'

// --- auth & user ---
export interface JoinRequest {
  email: string
  name: string
  password: string
  division: string
  team: string
  position: string
  joinDate: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  firstLogin: boolean
  authVal: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface JoinResponse {
  userId: number
  email: string
  name: string
  status: string
}

export const join = async (r: JoinRequest): Promise<ApiResponse<JoinResponse>> => {
  const { data } = await apiClient.post<ApiResponse<JoinResponse>>('/user/join', r)
  return data
}

export const login = async (r: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/user/login', r)
  return data
}

export const refreshToken = async (r: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
  const { data } = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/user/refresh', r)
  return data
}

export interface UserInfoResponse {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  firstLogin: boolean
  joinDate: string
  authVal: string
}

export interface UpdateUserRequest {
  division: string
  team: string
  position: string
  joinDate?: string
  status?: string
  authVal?: string
  firstLogin?: boolean
}

export const getUserInfo = async (): Promise<ApiResponse<UserInfoResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserInfoResponse>>('/user/info')
  return data
}

export const updateUserInfo = async (r: UpdateUserRequest): Promise<ApiResponse<UserInfoResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserInfoResponse>>('/user/info', r)
  return data
}

export interface UserListItem {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
  joinDate: string
  authVal: string
}

export const getUserInfoList = async (): Promise<ApiResponse<UserListItem[]>> => {
  const { data } = await apiClient.get<ApiResponse<UserListItem[]>>('/user/info/list')
  return data
}

export const getUserInfoByUserId = async (userId: number): Promise<ApiResponse<UserInfoResponse>> => {
  const { data } = await apiClient.get<ApiResponse<UserInfoResponse>>(`/user/info/${userId}`)
  return data
}

export const updateUserInfoByUserId = async (userId: number, r: UpdateUserRequest): Promise<ApiResponse<UserInfoResponse>> => {
  const { data } = await apiClient.put<ApiResponse<UserInfoResponse>>(`/user/info/${userId}`, r)
  return data
}

// --- signature ---
export interface SignatureResponse {
  signatureUrl: string
  hasSignature: boolean
}

export interface FontInfo {
  name: string
  file: string
}

export interface FontsResponse {
  fonts: FontInfo[]
}

export const uploadSignature = async (signatureFile?: File, fontType?: string, userName?: string): Promise<ApiResponse<{ message: string }>> => {
  const formData = new FormData()
  if (signatureFile) {
    formData.append('signatureImage', signatureFile)
  } else if (fontType && userName) {
    formData.append('fontType', fontType)
    formData.append('userName', userName)
  } else {
    throw new Error('서명 이미지 파일 또는 폰트 타입과 사용자 이름을 제공해주세요.')
  }
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/user/signature', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data
}

export const getSignature = async (): Promise<ApiResponse<SignatureResponse>> => {
  const { data } = await apiClient.get<ApiResponse<SignatureResponse>>('/user/signature')
  return data
}

export const deleteSignature = async (): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>('/user/signature')
  return data
}

export const getAvailableFonts = async (): Promise<ApiResponse<FontsResponse>> => {
  const { data } = await apiClient.get<ApiResponse<FontsResponse>>('/user/signature/fonts')
  return data
}

// --- division/team ---
export interface DivisionTeamResponse {
  division: string
  teams: string[]
}

export const getDivisionTeamList = async (): Promise<ApiResponse<DivisionTeamResponse[]>> => {
  const { data } = await apiClient.get<ApiResponse<DivisionTeamResponse[]>>('/user/team/list')
  return data
}

// --- team management ---
export interface TeamManagement {
  seq: number
  division: string
  team: string | null
  createdAt: string
  userCount: number
}

export interface TeamManagementRequest {
  division: string
  team?: string | null
}

export interface TeamUser {
  userId: number
  name: string
  position: string
  authVal: string
  authValLabel?: string
}

export const getAllTeamManagement = async (): Promise<ApiResponse<TeamManagement[]>> => {
  const { data } = await apiClient.get<ApiResponse<TeamManagement[]>>('/team/list')
  return data
}

export const getTeamManagementByDivision = async (division: string): Promise<ApiResponse<TeamManagement[]>> => {
  const { data } = await apiClient.get<ApiResponse<TeamManagement[]>>(`/team/list/${division}`)
  return data
}

export const createTeamManagement = async (r: TeamManagementRequest): Promise<ApiResponse<TeamManagement>> => {
  const { data } = await apiClient.post<ApiResponse<TeamManagement>>('/team', r)
  return data
}

export const updateTeamManagement = async (seq: number, r: TeamManagementRequest): Promise<ApiResponse<TeamManagement>> => {
  const { data } = await apiClient.put<ApiResponse<TeamManagement>>(`/team/${seq}`, r)
  return data
}

export const deleteTeamManagement = async (seq: number): Promise<ApiResponse<string>> => {
  const { data } = await apiClient.delete<ApiResponse<string>>(`/team/${seq}`)
  return data
}

export const getUsersByTeamSeq = async (teamSeq: number): Promise<ApiResponse<TeamUser[]>> => {
  const { data } = await apiClient.get<ApiResponse<TeamUser[]>>(`/team/${teamSeq}/users`)
  return data
}

export const changeUserTeam = async (userId: number, division: string, team: string | null): Promise<ApiResponse<UserInfoResponse>> => {
  const userRes = await getUserInfoByUserId(userId)
  const cur = userRes.resultMsg
  const { data } = await apiClient.put<ApiResponse<UserInfoResponse>>(`/user/info/${userId}`, {
    division,
    team: team || undefined,
    position: cur?.position || '',
    status: undefined,
    authVal: undefined,
    firstLogin: undefined
  })
  return data
}

export const getUsersByDivision = async (division: string): Promise<ApiResponse<TeamUser[]>> => {
  const { data } = await apiClient.get<ApiResponse<TeamUser[]>>(`/team/division/${division}/users`)
  return data
}

// --- re-exports (backward compat) ---
export {
  getRentalSupportList,
  getRentalSupport,
  getRentalSupportApplication,
  createRentalSupport,
  getRentalSupportApplicationList,
  createRentalSupportApplication,
  updateRentalSupportApplication,
  updateRentalSupport,
  deleteRentalSupport,
  deleteRentalSupportApplication,
  downloadRentalSupportApplication,
  downloadRentalProposal,
  type RentalSupport,
  type RentalSupportRequest
} from './rental'

export {
  getExpenseClaimList,
  getExpenseClaim,
  createExpenseClaim,
  updateExpenseClaim,
  deleteExpenseClaim,
  downloadExpenseClaim,
  uploadExpenseItemFile,
  downloadExpenseItemFile,
  deleteExpenseItemFile,
  type ExpenseClaim,
  type ExpenseSub,
  type ExpenseItem,
  type ExpenseClaimDetail,
  type ExpenseClaimRequest
} from './expense'

export {
  getPendingApprovals,
  approveVacationByTeamLeader,
  rejectVacationByTeamLeader,
  approveVacationByDivisionHead,
  rejectVacationByDivisionHead,
  approveExpenseClaimByTeamLeader,
  rejectExpenseClaimByTeamLeader,
  approveExpenseClaimByDivisionHead,
  rejectExpenseClaimByDivisionHead,
  approveRentalSupportByTeamLeader,
  rejectRentalSupportByTeamLeader,
  approveRentalSupportByDivisionHead,
  rejectRentalSupportByDivisionHead,
  approveRentalProposalByTeamLeader,
  rejectRentalProposalByTeamLeader,
  approveRentalProposalByDivisionHead,
  rejectRentalProposalByDivisionHead,
  approveVacationByMaster,
  approveExpenseClaimByMaster,
  approveRentalSupportByMaster,
  approveRentalProposalByMaster,
  type PendingApproval
} from './approval'

export {
  getUserVacationInfo,
  updateVacationInfo,
  type UserVacationInfoResponse,
  type UpdateVacationInfoRequest
} from './vacation'
