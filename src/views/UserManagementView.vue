<template>
  <div class="user-management-view">
    <div class="user-management-container">
      <h1>사용자 관리</h1>
      
      <div class="user-list">
        <table class="user-table">
          <thead>
            <tr>
              <th>이메일</th>
              <th>이름</th>
              <th>본부</th>
              <th>팀</th>
              <th>직급</th>
              <th>상태</th>
              <th>입사일</th>
              <th>권한</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in userList" 
              :key="user.userId"
              @click="goToUserDetail(user.userId)"
              class="user-row"
            >
              <td>{{ user.email }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.division }}</td>
              <td>{{ user.team }}</td>
              <td>{{ user.position }}</td>
              <td>{{ getStatusLabel(user.status) }}</td>
              <td>{{ formatDate(user.joinDate) }}</td>
              <td>{{ getAuthValLabel(user.authVal) }}</td>
            </tr>
            <tr v-if="userList.length === 0">
              <td colspan="8" class="no-data">사용자 목록이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfoList } from '@/api/user'

const router = useRouter()

interface User {
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

const userList = ref<User[]>([])

const loadUserList = async () => {
  try {
    const response = await getUserInfoList()
    userList.value = response.resultMsg || []
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    alert('사용자 목록을 불러오는데 실패했습니다.')
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR')
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': '승인전',
    'APPROVED': '승인',
    'REJECTED': '거부',
    'SUSPENDED': '정지',
    'WITHDRAWN': '탈퇴'
  }
  return statusMap[status] || status
}

const getAuthValLabel = (authVal: string) => {
  const authMap: Record<string, string> = {
    'ma': '마스터',
    'bb': '본부장',
    'tj': '팀장',
    'tw': '팀원'
  }
  return authMap[authVal] || authVal
}

const goToUserDetail = (userId: number) => {
  router.push(`/user-management/${userId}`)
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-management-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.user-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.user-management-container h1 {
  text-align: left;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  margin-top: 0;
  padding-left: 30px;
}

.user-list {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-table thead {
  background: #1226aa;
  color: white;
}

.user-table th {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #1226aa;
}

.user-table td {
  padding: 0.875rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.user-table tbody tr.user-row {
  cursor: pointer;
}

.user-table tbody tr.user-row:hover {
  background-color: #f5f7fa;
}

.user-table .no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 768px) {
  .user-management-view {
    padding: 1rem;
  }

  .user-management-container {
    padding: 1rem;
  }

  .user-table {
    font-size: 0.85rem;
  }

  .user-table th,
  .user-table td {
    padding: 0.5rem;
  }
}
</style>

