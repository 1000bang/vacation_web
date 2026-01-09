<template>
  <div class="user-detail-view">
    <div class="header-section">
      <div class="header-content">
        <h1>사용자 정보 관리</h1>
        <button @click="goToList" class="btn btn-back">목록으로</button>
      </div>
    </div>

    <!-- 사용자 정보 섹션 -->
    <div class="info-section">
      <h2>사용자 정보</h2>
      <div class="info-form">
        <div class="form-group">
          <label>이메일</label>
          <input type="email" :value="userInfo?.email" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>이름</label>
          <input type="text" :value="userInfo?.name" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>본부 <span class="required">*</span></label>
          <select
            v-model="editableUserInfo.division"
            :disabled="!isEditing"
            class="form-select"
            required
          >
            <option value="">선택</option>
            <option
              v-for="division in Object.keys(departmentStructure)"
              :key="division"
              :value="division"
            >
              {{ division }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>팀 <span class="required">*</span></label>
          <select
            v-model="editableUserInfo.team"
            :disabled="!isEditing"
            class="form-select"
            required
          >
            <option value="">선택</option>
            <option
              v-for="team in getTeamsForDivision(editableUserInfo.division)"
              :key="team"
              :value="team"
            >
              {{ team }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>직급 <span class="required">*</span></label>
          <select
            v-model="editableUserInfo.position"
            :disabled="!isEditing"
            class="form-select"
            required
          >
            <option value="">선택</option>
            <option value="주임">주임</option>
            <option value="대리">대리</option>
            <option value="과장">과장</option>
            <option value="차장">차장</option>
            <option value="부장">부장</option>
            <option value="이사">이사</option>
            <option value="상무">상무</option>
            <option value="전무">전무</option>
            <option value="사장">사장</option>
          </select>
        </div>

        <div class="form-group">
          <label>입사일</label>
          <input
            type="date"
            v-model="editableUserInfo.joinDate"
            :disabled="!isEditing"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>사용자 상태</label>
          <select
            v-model="editableUserInfo.status"
            :disabled="!isEditing"
            class="form-select"
          >
            <option value="PENDING">승인전</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">거부</option>
            <option value="SUSPENDED">정지</option>
            <option value="WITHDRAWN">탈퇴</option>
          </select>
        </div>

        <div class="form-group">
          <label>권한</label>
          <select
            v-model="editableUserInfo.authVal"
            :disabled="!isEditing"
            class="form-select"
          >
            <option value="">선택</option>
            <option value="ma">마스터</option>
            <option value="bb">본부장</option>
            <option value="tj">팀장</option>
            <option value="tw">팀원</option>
          </select>
        </div>

        <div class="form-group">
          <label>최초 로그인 상태</label>
          <select
            v-model="editableUserInfo.firstLogin"
            :disabled="!isEditing"
            class="form-select"
          >
            <option :value="true">예</option>
            <option :value="false">아니오</option>
          </select>
        </div>

        <div class="form-actions" v-if="!isEditing">
          <button @click="startEdit" class="btn btn-edit">수정</button>
        </div>

        <div class="form-actions" v-else>
          <button @click="cancelEdit" class="btn btn-cancel">취소</button>
          <button @click="saveUserInfo" class="btn btn-save" :disabled="isSaving">
            {{ isSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 공간 추가 -->
    <div class="section-spacer"></div>

    <!-- 연차 정보 섹션 -->
    <div class="info-section">
      <div class="section-header">
        <h2>연차 정보</h2>
      </div>
      <div v-if="vacationInfo" class="vacation-info">
        <div class="vacation-item">
          <span class="vacation-label">금년 발생 연차:</span>
          <input 
            v-if="isEditingVacation" 
            type="number" 
            v-model.number="editableVacationInfo.annualVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.annualVacationDays }}일</span>
        </div>
        <div class="vacation-item">
          <span class="vacation-label">사용 연차:</span>
          <input 
            v-if="isEditingVacation" 
            type="number" 
            v-model.number="editableVacationInfo.usedVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.usedVacationDays }}일</span>
        </div>
        <div class="vacation-item">
          <span class="vacation-label">예약중 연차:</span>
          <input 
            v-if="isEditingVacation" 
            type="number" 
            v-model.number="editableVacationInfo.reservedVacationDays" 
            step="0.5"
            min="0"
            class="vacation-input"
          />
          <span v-else class="vacation-value">{{ vacationInfo.reservedVacationDays }}일</span>
        </div>
        <div class="vacation-item highlight">
          <span class="vacation-label">남은 연차:</span>
          <span class="vacation-value">{{ calculatedRemainingDays }}일</span>
        </div>
      </div>
      <div v-else class="empty-message">연차 정보를 불러오는 중...</div>
      
      <div class="form-actions" v-if="!isEditingVacation">
        <button @click="startEditVacation" class="btn btn-edit">수정</button>
      </div>

      <div class="form-actions" v-else>
        <button @click="cancelEditVacation" class="btn btn-cancel">취소</button>
        <button @click="saveVacationInfo" class="btn btn-save" :disabled="isUpdatingVacation">
          {{ isUpdatingVacation ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getUserInfoByUserId,
  updateUserInfoByUserId,
  type UserInfoResponse,
  type UpdateUserRequest
} from '@/api/user'
import {
  getUserVacationInfoByUserId,
  updateUserVacationInfoByUserId,
  type UserVacationInfoResponse,
  type UpdateVacationInfoRequest
} from '@/api/vacation'

const route = useRoute()
const router = useRouter()

const userId = computed(() => {
  const id = route.params.userId
  return typeof id === 'string' ? parseInt(id, 10) : Number(id)
})

const userInfo = ref<UserInfoResponse | null>(null)
const isEditing = ref(false)
const isSaving = ref(false)

const vacationInfo = ref<UserVacationInfoResponse | null>(null)
const isEditingVacation = ref(false)
const isUpdatingVacation = ref(false)
const editableVacationInfo = ref({
  annualVacationDays: 0,
  usedVacationDays: 0,
  reservedVacationDays: 0
})

const editableUserInfo = ref({
  division: '',
  team: '',
  position: '',
  joinDate: '',
  status: 'PENDING',
  authVal: '',
  firstLogin: false
})

// 본부/센터 구조
const departmentStructure: Record<string, string[]> = {
  'ITO센터': ['ITO지원팀'],
  '신사업추진실': ['크레이이티브팀'],
  '솔루션사업본부': ['솔루션1팀', '솔루션2팀'],
  '플랫폼사업본부': ['플랫폼1팀', '플랫폼2팀'],
  '서비스사업본부': ['서비스1팀', '서비스2팀'],
  '시스템사업본부': ['시스템1팀', '시스템2팀']
}

// 본부/센터에 따른 팀 목록 반환
const getTeamsForDivision = (division: string): string[] => {
  return departmentStructure[division] || []
}

onMounted(async () => {
  await loadUserInfo()
  await loadVacationInfo()
})

const loadUserInfo = async () => {
  try {
    const response = await getUserInfoByUserId(userId.value)
    userInfo.value = response.resultMsg
    
    // 편집 가능한 필드 초기화
    editableUserInfo.value = {
      division: response.resultMsg.division || '',
      team: response.resultMsg.team || '',
      position: response.resultMsg.position || '',
      joinDate: response.resultMsg.joinDate || '',
      status: response.resultMsg.status || 'PENDING',
      authVal: response.resultMsg.authVal || '',
      firstLogin: response.resultMsg.firstLogin || false
    }
  } catch (error: any) {
    console.error('사용자 정보 조회 실패:', error)
    
    // 에러 코드 확인
    const errorCode = error?.response?.data?.resultCode || error?.response?.data?.resultMsg?.errorCode
    
    // 권한 없음 (914)인 경우 대시보드로 리다이렉트
    if (errorCode === '914') {
      alert('권한이 없습니다.')
      router.push('/dashboard')
      return
    }
    
    alert('사용자 정보를 불러오는데 실패했습니다.')
    router.back()
  }
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  if (userInfo.value) {
    editableUserInfo.value = {
      division: userInfo.value.division || '',
      team: userInfo.value.team || '',
      position: userInfo.value.position || '',
      joinDate: userInfo.value.joinDate || '',
      status: userInfo.value.status || 'PENDING',
      authVal: userInfo.value.authVal || '',
      firstLogin: userInfo.value.firstLogin || false
    }
  }
  isEditing.value = false
}

const saveUserInfo = async () => {
  if (!editableUserInfo.value.division || !editableUserInfo.value.team || !editableUserInfo.value.position) {
    alert('본부, 팀, 직급은 필수 항목입니다.')
    return
  }

  isSaving.value = true
  try {
    const updateRequest: UpdateUserRequest = {
      division: editableUserInfo.value.division,
      team: editableUserInfo.value.team,
      position: editableUserInfo.value.position,
      joinDate: editableUserInfo.value.joinDate || undefined,
      status: editableUserInfo.value.status && editableUserInfo.value.status.trim() !== '' ? editableUserInfo.value.status.trim() : undefined,
      authVal: editableUserInfo.value.authVal && editableUserInfo.value.authVal.trim() !== '' ? editableUserInfo.value.authVal : undefined,
      firstLogin: editableUserInfo.value.firstLogin
    }

    const response = await updateUserInfoByUserId(userId.value, updateRequest)
    userInfo.value = response.resultMsg
    isEditing.value = false
    alert('사용자 정보가 수정되었습니다.')
  } catch (error: any) {
    console.error('사용자 정보 수정 실패:', error)
    
    // 에러 코드 확인
    const errorCode = error?.response?.data?.resultCode || error?.response?.data?.resultMsg?.errorCode
    
    // 권한 없음 (914)인 경우 대시보드로 리다이렉트
    if (errorCode === '914') {
      alert('권한이 없습니다.')
      router.push('/dashboard')
      return
    }
    
    alert('사용자 정보 수정에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

const loadVacationInfo = async () => {
  try {
    const response = await getUserVacationInfoByUserId(userId.value)
    vacationInfo.value = response.resultMsg
    editableVacationInfo.value = {
      annualVacationDays: response.resultMsg.annualVacationDays,
      usedVacationDays: response.resultMsg.usedVacationDays,
      reservedVacationDays: response.resultMsg.reservedVacationDays
    }
  } catch (error) {
    console.error('연차 정보 조회 실패:', error)
    alert('연차 정보를 불러오는데 실패했습니다.')
  }
}

const calculatedRemainingDays = computed(() => {
  if (!vacationInfo.value) return 0
  if (isEditingVacation.value) {
    return editableVacationInfo.value.annualVacationDays 
      - editableVacationInfo.value.usedVacationDays 
      - editableVacationInfo.value.reservedVacationDays
  }
  return vacationInfo.value.annualVacationDays 
    - vacationInfo.value.usedVacationDays 
    - vacationInfo.value.reservedVacationDays
})

const startEditVacation = () => {
  if (vacationInfo.value) {
    editableVacationInfo.value = {
      annualVacationDays: vacationInfo.value.annualVacationDays,
      usedVacationDays: vacationInfo.value.usedVacationDays,
      reservedVacationDays: vacationInfo.value.reservedVacationDays
    }
  }
  isEditingVacation.value = true
}

const cancelEditVacation = () => {
  isEditingVacation.value = false
  if (vacationInfo.value) {
    editableVacationInfo.value = {
      annualVacationDays: vacationInfo.value.annualVacationDays,
      usedVacationDays: vacationInfo.value.usedVacationDays,
      reservedVacationDays: vacationInfo.value.reservedVacationDays
    }
  }
}

const saveVacationInfo = async () => {
  isUpdatingVacation.value = true
  try {
    const updateRequest: UpdateVacationInfoRequest = {
      annualVacationDays: editableVacationInfo.value.annualVacationDays,
      usedVacationDays: editableVacationInfo.value.usedVacationDays,
      reservedVacationDays: editableVacationInfo.value.reservedVacationDays
    }
    const response = await updateUserVacationInfoByUserId(userId.value, updateRequest)
    vacationInfo.value = response.resultMsg
    isEditingVacation.value = false
    alert('연차 정보가 수정되었습니다.')
  } catch (error) {
    console.error('연차 정보 수정 실패:', error)
    alert('연차 정보 수정에 실패했습니다.')
  } finally {
    isUpdatingVacation.value = false
  }
}

const goToList = () => {
  router.push('/user-management')
}
</script>

<style scoped>
.user-detail-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.header-section h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
  text-align: left;
}

.btn-back {
  background-color: #1226aa;
  color: white;
  padding: 0.75rem 1.5rem;
}

.btn-back:hover {
  background-color: #0f1f88;
}

.info-section {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-spacer {
  height: 2rem;
}

.section-spacer {
  height: 2rem;
}

.info-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #1226aa;
  padding-bottom: 0.5rem;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
}

.form-group label .required {
  color: #e74c3c;
}

.form-input,
.form-select,
.disabled-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #17ccff;
}

.form-input:disabled,
.form-select:disabled,
.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background-color: #1226aa;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background-color: #0f1f88;
}

.btn-save {
  background-color: #17ccff;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #14b8e6;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  border-bottom: 2px solid #1226aa;
  padding-bottom: 0.5rem;
}

.vacation-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vacation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.vacation-item.highlight {
  background-color: #e8f4f8;
  border: 2px solid #17ccff;
  font-weight: 600;
}

.vacation-label {
  font-weight: 500;
  color: #555;
}

.vacation-value {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

.vacation-item.highlight .vacation-value {
  color: #1226aa;
  font-size: 1.2rem;
}

.vacation-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.vacation-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100px;
  text-align: right;
}

.vacation-input:focus {
  outline: none;
  border-color: #17ccff;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 768px) {
  .user-detail-view {
    padding: 1rem;
  }

  .info-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* 모바일 화면 (600px 이하) */
@media (max-width: 600px) {
  .user-detail-view {
    padding: 0.75rem;
  }

  .info-section {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-section h1 {
    font-size: 1.5rem;
  }

  /* 모바일에서도 버튼 색상 유지 */
  .btn-back {
    background-color: #1226aa !important;
    color: white !important;
  }

  .btn-edit {
    background-color: #1226aa !important;
    color: white !important;
  }

  .btn-save {
    background-color: #17ccff !important;
    color: white !important;
  }

  .btn-cancel {
    background-color: #95a5a6 !important;
    color: white !important;
  }
}
</style>

