<template>
  <div class="team-management-view">
    <div class="team-management-container">
      <div class="header">
        <h1>팀 관리</h1>
        <div class="header-actions">
          <button @click="openAddDivisionModal" class="btn btn-primary">본부 추가</button>
          <button @click="openAddTeamModal" class="btn btn-primary">팀 추가</button>
        </div>
      </div>
      
      <!-- 계층 구조 표시 -->
      <div class="organization-tree">
        <div 
          v-for="division in groupedTeams" 
          :key="division.division" 
          class="division-group"
        >
          <!-- 본부 카드 -->
          <div 
            class="division-card"
            :class="{ 
              'drag-over': dragOverDivision === division.division,
              'division-card-expanded': selectedDivision === division.division
            }"
            :data-division="division.division"
            @dragover.prevent="handleDragOver($event, null, division.division)"
            @dragleave="handleDragLeave($event)"
            @drop.prevent="handleDropToDivision($event, division.division)"
          >
            <div class="division-header">
              <div class="division-info">
                <h2 class="division-name">{{ division.division }}</h2>
                <span class="user-count">사용자: {{ division.totalUsers }}명</span>
              </div>
              <div class="division-actions" @click.stop>
                <button 
                  @click="openEditDivisionModal(division.divisionItem)" 
                  class="btn-icon btn-edit"
                  title="본부 수정"
                >
                  ✏️
                </button>
                <button 
                  @click="handleDelete(division.divisionItem)" 
                  class="btn-icon btn-delete"
                  :disabled="division.totalUsers > 0"
                  :title="division.totalUsers > 0 ? '사용자가 속해있는 본부는 삭제할 수 없습니다.' : '본부 삭제'"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <!-- 본부장 목록 (기본 표시) -->
            <div 
              v-if="divisionUsers[division.division] && divisionUsers[division.division].length > 0"
              class="division-users-list"
              @dragover.prevent="handleDragOver($event, null, division.division)"
              @dragleave="handleDragLeave($event)"
              @drop.prevent="handleDropToDivision($event, division.division)"
            >
              <div 
                v-for="user in divisionUsers[division.division]" 
                :key="user.userId"
                class="user-item"
                :draggable="true"
                @dragstart="handleDragStartDivision($event, user, division.division)"
                @dragend="handleDragEnd"
              >
                <div class="user-info">
                  <span class="user-number">{{ getDivisionUserNumber(division.division, user.userId) }}.</span>
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-position">{{ user.position }}</span>
                  <span class="user-role">{{ user.authVal === 'ma' ? '마스터' : '본부장' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 팀 목록 -->
            <div class="teams-container">
              <div 
                v-for="team in division.teams" 
                :key="team.seq"
                class="team-wrapper"
              >
                <div 
                  class="team-card"
                  :class="{ 
                    'team-card-expanded': selectedTeamSeq === team.seq,
                    'drag-over': dragOverTeamSeq === team.seq
                  }"
                  :data-team-seq="team.seq"
                  @click="toggleTeamUsers(team)"
                  @dragover.prevent="handleDragOver($event, team.seq)"
                  @dragleave="handleDragLeave($event)"
                  @drop.prevent="handleDrop($event, team)"
                >
                  <div class="team-info">
                    <div class="team-indicator">└─</div>
                    <div class="team-details">
                      <span class="team-name">{{ team.team }}</span>
                      <span class="team-user-count">({{ team.userCount }}명)</span>
                    </div>
                  </div>
                  <div class="team-actions" @click.stop>
                    <button 
                      @click="openEditModal(team)" 
                      class="btn-icon btn-edit"
                      title="팀 수정"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="handleDelete(team)" 
                      class="btn-icon btn-delete"
                      :disabled="team.userCount > 0"
                      :title="team.userCount > 0 ? '사용자가 속해있는 팀은 삭제할 수 없습니다.' : '팀 삭제'"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <!-- 사용자 목록 (확장 시 표시, 팀 아래) -->
                <div 
                  v-if="selectedTeamSeq === team.seq && teamUsers[team.seq]" 
                  class="team-users-list"
                  :class="{ 'drag-over': dragOverTeamSeq === team.seq }"
                  @dragover.prevent="handleDragOver($event, team.seq)"
                  @dragleave="handleDragLeave($event)"
                  @drop.prevent="handleDrop($event, team)"
                >
                  <div 
                    v-for="user in teamUsers[team.seq]" 
                    :key="user.userId"
                    class="user-item"
                    :draggable="true"
                    @dragstart="handleDragStart($event, user, team)"
                    @dragend="handleDragEnd"
                  >
                    <div class="user-info">
                      <span class="user-number">{{ getTeamUserNumber(team.seq, user.userId) }}.</span>
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-position">{{ user.position }}</span>
                      <span class="user-role">{{ user.authVal === 'tj' ? '팀장' : '팀원' }}</span>
                    </div>
                  </div>
                  <div v-if="teamUsers[team.seq].length === 0" class="no-users">
                    사용자가 없습니다
                  </div>
                </div>
              </div>
              <div v-if="division.teams.length === 0" class="no-teams">
                팀이 없습니다
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="groupedTeams.length === 0" class="no-data">
          <p>팀 목록이 없습니다.</p>
          <button @click="openAddDivisionModal" class="btn btn-primary">첫 본부 추가하기</button>
        </div>
      </div>
    </div>

    <!-- 추가/수정 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ 
            editingTeam 
              ? (editingTeam.team ? '팀 수정' : '본부 수정')
              : (isAddingTeam ? '팀 추가' : '본부 추가')
          }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>본부 <span class="required">*</span></label>
            <input 
              v-if="!isAddingTeam"
              v-model="form.division" 
              type="text" 
              class="form-control"
              placeholder="본부명을 입력하세요"
              required
            />
            <select 
              v-else
              v-model="form.division" 
              class="form-control"
              required
            >
              <option value="">본부를 선택하세요</option>
              <option v-for="div in availableDivisions" :key="div" :value="div">{{ div }}</option>
            </select>
          </div>
          <div v-if="isAddingTeam || editingTeam" class="form-group">
            <label>팀 <span class="required">*</span></label>
            <input 
              v-model="form.team" 
              type="text" 
              class="form-control"
              placeholder="팀명을 입력하세요"
              :required="isAddingTeam || editingTeam"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">취소</button>
          <button @click="handleSubmit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '처리 중...' : (editingTeam ? '수정' : '추가') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  getAllTeamManagement, 
  createTeamManagement, 
  updateTeamManagement, 
  deleteTeamManagement,
  getUsersByTeamSeq,
  getUsersByDivision,
  changeUserTeam,
  type TeamManagement,
  type TeamManagementRequest,
  type TeamUser
} from '@/api/user'

const teamList = ref<TeamManagement[]>([])
const showModal = ref(false)
const editingTeam = ref<TeamManagement | null>(null)
const isSubmitting = ref(false)
const isAddingTeam = ref(false)
const selectedTeamSeq = ref<number | null>(null)
const selectedDivision = ref<string | null>(null)
const teamUsers = ref<Record<number, TeamUser[]>>({})
const divisionUsers = ref<Record<string, TeamUser[]>>({})
const draggedUser = ref<{ user: TeamUser; sourceTeam: TeamManagement } | null>(null)
const draggedDivisionUser = ref<{ user: TeamUser; sourceDivision: string } | null>(null)
const dragOverTeamSeq = ref<number | null>(null)
const dragOverDivision = ref<string | null>(null)

const form = ref<TeamManagementRequest>({
  division: '',
  team: null
})

// 본부별로 그룹화
const groupedTeams = computed(() => {
  const groups: Record<string, {
    division: string
    divisionItem: TeamManagement
    teams: TeamManagement[]
    totalUsers: number
  }> = {}

  teamList.value.forEach(team => {
    if (!team.team) {
      // 본부만 있는 경우
      if (!groups[team.division]) {
        groups[team.division] = {
          division: team.division,
          divisionItem: team,
          teams: [],
          totalUsers: team.userCount
        }
      } else {
        // 이미 본부가 있으면 사용자 수 합산
        groups[team.division].divisionItem = team
        groups[team.division].totalUsers += team.userCount
      }
    } else {
      // 팀이 있는 경우
      if (!groups[team.division]) {
        // 본부가 없으면 본부도 생성 (사용자 수 0)
        groups[team.division] = {
          division: team.division,
          divisionItem: {
            seq: 0,
            division: team.division,
            team: null,
            createdAt: '',
            userCount: 0
          },
          teams: [],
          totalUsers: 0
        }
      }
      groups[team.division].teams.push(team)
      groups[team.division].totalUsers += team.userCount
    }
  })

  return Object.values(groups).sort((a, b) => a.division.localeCompare(b.division))
})

// 사용 가능한 본부 목록 (팀 추가 시)
const availableDivisions = computed(() => {
  return Array.from(new Set(teamList.value.map(t => t.division))).sort()
})

const loadTeamList = async () => {
  try {
    const response = await getAllTeamManagement()
    teamList.value = response.resultMsg || []
    
    // 본부장 목록도 자동 로드
    const divisions = Array.from(new Set(teamList.value.map(t => t.division)))
    for (const division of divisions) {
      await loadDivisionUsers(division)
    }
  } catch (error) {
    console.error('팀 목록 조회 실패:', error)
    alert('팀 목록을 불러오는데 실패했습니다.')
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR')
}

const openAddDivisionModal = () => {
  editingTeam.value = null
  isAddingTeam.value = false
  form.value = {
    division: '',
    team: null
  }
  showModal.value = true
}

const openAddTeamModal = () => {
  editingTeam.value = null
  isAddingTeam.value = true
  form.value = {
    division: '',
    team: ''
  }
  showModal.value = true
}

const openEditDivisionModal = (division: TeamManagement) => {
  editingTeam.value = division
  isAddingTeam.value = false
  form.value = {
    division: division.division,
    team: null
  }
  showModal.value = true
}

const openEditModal = (team: TeamManagement) => {
  editingTeam.value = team
  form.value = {
    division: team.division,
    team: team.team || null
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTeam.value = null
  isAddingTeam.value = false
  form.value = {
    division: '',
    team: null
  }
}

const handleSubmit = async () => {
  if (!form.value.division || form.value.division.trim() === '') {
    alert('본부명을 입력해주세요.')
    return
  }

  if (isAddingTeam.value && (!form.value.team || form.value.team.trim() === '')) {
    alert('팀명을 입력해주세요.')
    return
  }

  isSubmitting.value = true
  try {
    if (editingTeam.value) {
      // 수정
      await updateTeamManagement(editingTeam.value.seq, {
        division: form.value.division.trim(),
        team: form.value.team && form.value.team.trim() !== '' ? form.value.team.trim() : null
      })
      alert(editingTeam.value.team ? '팀 정보가 수정되었습니다.' : '본부 정보가 수정되었습니다.')
    } else {
      // 추가
      await createTeamManagement({
        division: form.value.division.trim(),
        team: isAddingTeam.value && form.value.team ? form.value.team.trim() : null
      })
      alert(isAddingTeam.value ? '팀이 추가되었습니다.' : '본부가 추가되었습니다.')
    }
    closeModal()
    await loadTeamList()
  } catch (error: any) {
    console.error('팀 관리 처리 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || '처리 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (team: TeamManagement) => {
  if (team.userCount > 0) {
    alert('사용자가 속해있는 팀은 삭제할 수 없습니다.')
    return
  }

  if (!confirm(`정말로 "${team.division}${team.team ? ' - ' + team.team : ''}"를 삭제하시겠습니까?`)) {
    return
  }

  try {
    await deleteTeamManagement(team.seq)
    alert('팀이 삭제되었습니다.')
    await loadTeamList()
  } catch (error: any) {
    console.error('팀 삭제 실패:', error)
    const errorMessage = error.response?.data?.resultMsg?.errorMessage || '삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 본부장 목록 자동 로드 (기본 표시)
const loadDivisionUsers = async (division: string) => {
  if (!divisionUsers.value[division]) {
    try {
      const response = await getUsersByDivision(division)
      divisionUsers.value[division] = response.resultMsg || []
    } catch (error) {
      console.error('본부별 사용자 목록 조회 실패:', error)
      divisionUsers.value[division] = []
    }
  }
}

const toggleTeamUsers = async (team: TeamManagement) => {
  if (selectedTeamSeq.value === team.seq) {
    // 이미 선택된 팀이면 닫기
    selectedTeamSeq.value = null
  } else {
    // 새로운 팀 선택
    selectedTeamSeq.value = team.seq
    if (!teamUsers.value[team.seq]) {
      // 사용자 목록이 없으면 로드
      try {
        const response = await getUsersByTeamSeq(team.seq)
        teamUsers.value[team.seq] = response.resultMsg || []
      } catch (error) {
        console.error('팀별 사용자 목록 조회 실패:', error)
        alert('사용자 목록을 불러오는데 실패했습니다.')
        teamUsers.value[team.seq] = []
      }
    }
  }
}

const getTeamUserNumber = (teamSeq: number, userId: number): number => {
  const users = teamUsers.value[teamSeq] || []
  return users.findIndex(u => u.userId === userId) + 1
}

const getDivisionUserNumber = (division: string, userId: number): number => {
  const users = divisionUsers.value[division] || []
  return users.findIndex(u => u.userId === userId) + 1
}

const handleDragStart = (event: DragEvent, user: TeamUser, team: TeamManagement) => {
  if (!event.dataTransfer) return
  draggedUser.value = { user, sourceTeam: team }
  draggedDivisionUser.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', user.userId.toString())
  
  // 드래그 중인 요소 스타일 변경
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const handleDragStartDivision = (event: DragEvent, user: TeamUser, division: string) => {
  if (!event.dataTransfer) return
  draggedDivisionUser.value = { user, sourceDivision: division }
  draggedUser.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', user.userId.toString())
  
  // 드래그 중인 요소 스타일 변경
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  // 드래그 종료 시 스타일 복원
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
  
  // 모든 드래그 오버 상태 초기화
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  dragOverTeamSeq.value = null
  dragOverDivision.value = null
}

const handleDragOver = (event: DragEvent, teamSeq: number | null = null, division: string | null = null) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  
  // 드래그 오버 상태 저장
  if (teamSeq !== null) {
    dragOverTeamSeq.value = teamSeq
    dragOverDivision.value = null
  } else if (division !== null) {
    dragOverDivision.value = division
    dragOverTeamSeq.value = null
  }
  
  // 드래그 오버 시 시각적 피드백
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.classList.add('drag-over')
    
    // 관련된 모든 드롭 영역에서 drag-over 제거 (하나만 하이라이트)
    document.querySelectorAll('.drag-over').forEach(el => {
      if (el !== target) {
        el.classList.remove('drag-over')
      }
    })
  }
}

const handleDragLeave = (event: DragEvent) => {
  // relatedTarget이 자식 요소인 경우는 무시 (실제로 떠난 게 아님)
  const relatedTarget = event.relatedTarget as HTMLElement
  const currentTarget = event.currentTarget as HTMLElement
  
  if (relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }
  
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.classList.remove('drag-over')
  }
  
  // 드래그 오버 상태 초기화
  dragOverTeamSeq.value = null
  dragOverDivision.value = null
}

const handleDropToDivision = async (event: DragEvent, targetDivision: string) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 본부장에서 드래그한 경우
  if (draggedDivisionUser.value) {
    const { user, sourceDivision } = draggedDivisionUser.value
    
    // 같은 본부면 무시
    if (sourceDivision === targetDivision) {
      draggedDivisionUser.value = null
      return
    }
    
    // 본부장은 본부 간 이동만 가능 (팀으로 이동 불가)
    if (confirm(`${user.name}님을 ${targetDivision} 본부로 이동하시겠습니까?`)) {
      try {
        await changeUserTeam(user.userId, targetDivision, null)
        
        // 즉시 로컬 상태 업데이트
        if (divisionUsers.value[sourceDivision]) {
          divisionUsers.value[sourceDivision] = divisionUsers.value[sourceDivision].filter(u => u.userId !== user.userId)
        }
        
        // 팀 목록 새로고침
        await loadTeamList()
        
        // 본부 사용자 목록 새로고침
        if (divisionUsers.value[sourceDivision]) {
          try {
            const response = await getUsersByDivision(sourceDivision)
            divisionUsers.value[sourceDivision] = response.resultMsg || []
          } catch (error) {
            console.error(`본부 ${sourceDivision} 사용자 목록 새로고침 실패:`, error)
          }
        }
        if (divisionUsers.value[targetDivision]) {
          try {
            const response = await getUsersByDivision(targetDivision)
            divisionUsers.value[targetDivision] = response.resultMsg || []
          } catch (error) {
            console.error(`본부 ${targetDivision} 사용자 목록 새로고침 실패:`, error)
          }
        }
        
        // 타겟 본부가 선택되어 있지 않으면 자동으로 선택
        if (selectedDivision.value !== targetDivision) {
          selectedDivision.value = targetDivision
          if (!divisionUsers.value[targetDivision]) {
            try {
              const response = await getUsersByDivision(targetDivision)
              divisionUsers.value[targetDivision] = response.resultMsg || []
            } catch (error) {
              console.error('타겟 본부 사용자 목록 조회 실패:', error)
            }
          }
        }
        
        alert('본부가 변경되었습니다.')
      } catch (error: any) {
        console.error('본부 변경 실패:', error)
        const errorMessage = error.response?.data?.resultMsg?.errorMessage || '본부 변경 중 오류가 발생했습니다.'
        alert(errorMessage)
      }
    }
    
    draggedDivisionUser.value = null
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
    dragOverTeamSeq.value = null
    dragOverDivision.value = null
    return
  }
  
  // 팀에서 드래그한 경우
  if (!draggedUser.value) return

  // 드래그 오버 클래스 및 상태 제거
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  dragOverTeamSeq.value = null
  dragOverDivision.value = null

  const { user, sourceTeam } = draggedUser.value
  
  // 본부에 드롭 (팀 없음)
  if (confirm(`${user.name}님을 ${targetDivision} 본부로 이동하시겠습니까?`)) {
    try {
      await changeUserTeam(user.userId, targetDivision, null)
      
      // 즉시 로컬 상태 업데이트 (사용자가 사라지는 것 방지)
      if (teamUsers.value[sourceTeam.seq]) {
        teamUsers.value[sourceTeam.seq] = teamUsers.value[sourceTeam.seq].filter(u => u.userId !== user.userId)
      }
      
      // 팀 목록 새로고침
      await loadTeamList()
      
      // 모든 열려있는 팀의 사용자 목록 새로고침
      const teamSeqsToRefresh = new Set<number>()
      if (selectedTeamSeq.value) {
        teamSeqsToRefresh.add(selectedTeamSeq.value)
      }
      if (sourceTeam.seq) {
        teamSeqsToRefresh.add(sourceTeam.seq)
      }
      
      // 본부에 속한 팀들도 새로고침 (본부로 이동했으므로)
      const divisionTeams = teamList.value.filter(t => t.division === targetDivision && t.team !== null)
      divisionTeams.forEach(t => {
        if (teamUsers.value[t.seq]) {
          teamSeqsToRefresh.add(t.seq)
        }
      })
      
      // 사용자 목록 새로고침
      for (const teamSeq of teamSeqsToRefresh) {
        try {
          const response = await getUsersByTeamSeq(teamSeq)
          teamUsers.value[teamSeq] = response.resultMsg || []
        } catch (error) {
          console.error(`팀 ${teamSeq} 사용자 목록 새로고침 실패:`, error)
        }
      }
      
      alert('팀이 변경되었습니다.')
    } catch (error: any) {
      console.error('팀 변경 실패:', error)
      const errorMessage = error.response?.data?.resultMsg?.errorMessage || '팀 변경 중 오류가 발생했습니다.'
      alert(errorMessage)
    }
  }
  
  draggedUser.value = null
}

const handleDrop = async (event: DragEvent, targetTeam: TeamManagement) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 본부장에서 드래그한 경우는 팀으로 이동 불가
  if (draggedDivisionUser.value) {
    draggedDivisionUser.value = null
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
    dragOverTeamSeq.value = null
    dragOverDivision.value = null
    return
  }
  
  if (!draggedUser.value) return

  // 드래그 오버 클래스 및 상태 제거
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  dragOverTeamSeq.value = null
  dragOverDivision.value = null

  const { user, sourceTeam } = draggedUser.value
  
  // 같은 팀이면 무시
  if (targetTeam.seq === sourceTeam.seq) {
    draggedUser.value = null
    return
  }

  if (confirm(`${user.name}님을 ${targetTeam.division} / ${targetTeam.team}로 이동하시겠습니까?`)) {
    try {
      await changeUserTeam(user.userId, targetTeam.division, targetTeam.team || null)
      
      // 즉시 로컬 상태 업데이트 (사용자가 사라지는 것 방지)
      if (teamUsers.value[sourceTeam.seq]) {
        teamUsers.value[sourceTeam.seq] = teamUsers.value[sourceTeam.seq].filter(u => u.userId !== user.userId)
      }
      
      // 팀 목록 새로고침
      await loadTeamList()
      
      // 소스 팀과 타겟 팀의 사용자 목록 새로고침
      const teamSeqsToRefresh = new Set<number>()
      
      // 소스 팀 (사용자가 떠난 팀)
      if (sourceTeam.seq) {
        teamSeqsToRefresh.add(sourceTeam.seq)
      }
      
      // 타겟 팀 (사용자가 이동한 팀)
      if (targetTeam.seq) {
        teamSeqsToRefresh.add(targetTeam.seq)
      }
      
      // 선택된 팀도 새로고침 (열려있는 경우)
      if (selectedTeamSeq.value) {
        teamSeqsToRefresh.add(selectedTeamSeq.value)
      }
      
      // 사용자 목록 새로고침
      for (const teamSeq of teamSeqsToRefresh) {
        try {
          const response = await getUsersByTeamSeq(teamSeq)
          teamUsers.value[teamSeq] = response.resultMsg || []
        } catch (error) {
          console.error(`팀 ${teamSeq} 사용자 목록 새로고침 실패:`, error)
        }
      }
      
      // 타겟 팀이 선택되어 있지 않으면 자동으로 선택하여 사용자 목록 표시
      if (selectedTeamSeq.value !== targetTeam.seq && targetTeam.seq) {
        selectedTeamSeq.value = targetTeam.seq
        if (!teamUsers.value[targetTeam.seq]) {
          try {
            const response = await getUsersByTeamSeq(targetTeam.seq)
            teamUsers.value[targetTeam.seq] = response.resultMsg || []
          } catch (error) {
            console.error('타겟 팀 사용자 목록 조회 실패:', error)
          }
        }
      }
      
      alert('팀이 변경되었습니다.')
    } catch (error: any) {
      console.error('팀 변경 실패:', error)
      const errorMessage = error.response?.data?.resultMsg?.errorMessage || '팀 변경 중 오류가 발생했습니다.'
      alert(errorMessage)
    }
  }
  
  draggedUser.value = null
}

onMounted(() => {
  loadTeamList()
})
</script>

<style scoped>
.team-management-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.team-management-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 조직도 트리 구조 */
.organization-tree {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.division-group {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.division-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.division-card {
  position: relative;
  cursor: pointer;
}

.division-card-expanded {
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
}

.division-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.division-card.drag-over {
  background: linear-gradient(135deg, #7c8ef0 0%, #8a5fb8 100%) !important;
  border: 3px dashed white !important;
  transform: scale(1.01);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5) !important;
}

.division-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.division-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.division-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.division-actions {
  display: flex;
  gap: 8px;
}

.teams-container {
  margin-left: 20px;
  padding-left: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.team-card {
  cursor: pointer;
  position: relative;
}

.team-card.drag-over {
  background: #e3f2fd !important;
  border: 2px dashed #667eea !important;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
}

.team-card:hover {
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateX(4px);
}

.team-card-expanded {
  background: #f8f9fa !important;
  border: 2px solid #667eea;
}

.division-users-list {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
  transition: all 0.2s;
}

.division-users-list.drag-over {
  background: #e3f2fd !important;
  border-color: white !important;
  border-style: dashed !important;
  transform: scale(1.02);
}

.team-users-list {
  margin-left: 40px;
  margin-top: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
  transition: all 0.2s;
}

.team-users-list.drag-over {
  background: #e3f2fd !important;
  border-color: #667eea !important;
  border-style: dashed !important;
  transform: scale(1.02);
}

.user-item {
  background: white;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  cursor: grab;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.user-item:hover {
  background: #f0f7ff;
  border-color: #667eea;
  transform: translateX(4px);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
}

.user-item:active {
  cursor: grabbing;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-number {
  font-weight: 600;
  color: #667eea;
  min-width: 24px;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.user-position {
  color: #6c757d;
  font-size: 14px;
}

.user-role {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

.no-users {
  padding: 16px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  font-size: 14px;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-indicator {
  color: #667eea;
  font-size: 18px;
  font-weight: bold;
}

.team-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.team-user-count {
  font-size: 14px;
  color: #6c757d;
}

.team-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.btn-icon:hover:not(:disabled) {
  background: #f0f0f0;
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-edit:hover:not(:disabled) {
  background: #e3f2fd;
}

.btn-delete:hover:not(:disabled) {
  background: #ffebee;
}

.no-teams {
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  font-size: 14px;
}

.no-data {
  text-align: center;
  color: #6c757d;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-data p {
  font-size: 18px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #1226aa;
  color: white;
}

.btn-primary:hover {
  background-color: #0e1d88;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  margin-right: 8px;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.modal-footer .btn {
  min-width: 80px;
}
</style>
