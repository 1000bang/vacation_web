<template>
  <div id="app">
    <header class="global-header">
      <div class="header-content">
        <div class="header-left">
          <a 
            @click="handleLogoClick" 
            class="logo-link"
            style="cursor: pointer;"
          >
            <img :src="logoImage" alt="Knowledge Point Logo" class="header-logo" />
          </a>
        </div>
        <div class="header-right">
          <div v-if="user" class="user-info">
            <span class="user-name">{{ user.division }}/{{ user.team }} {{ user.name }} {{ user.position }}</span>
            <!-- 알람 아이콘 -->
            <div class="alarm-container">
              <button 
                class="btn btn-alarm" 
                :class="{ 'has-unread': unreadAlarmCount > 0 }"
                @click.stop="toggleAlarmModal"
              >
                <img :src="alertImage" alt="알람" class="alarm-icon" />
                <span v-if="unreadAlarmCount > 0" class="alarm-badge">N</span>
              </button>
              
              <!-- 알람 모달 (알람 아이콘 바로 아래) -->
              <div v-if="showAlarmModal" class="alarm-modal-content" @click.stop>
                <div class="alarm-modal-header">
                  <h3>알람</h3>
                  <div class="alarm-modal-actions">
                    <button v-if="unreadAlarmCount > 0" @click="markAllAsRead" class="btn-mark-all-read">
                      모두 읽음 처리
                    </button>
                    <button @click="closeAlarmModal" class="btn-close-modal">✕</button>
                  </div>
                </div>
                <div class="alarm-list">
                  <div v-if="alarms.length === 0" class="alarm-empty">
                    알람이 없습니다.
                  </div>
                  <div 
                    v-for="alarm in alarms" 
                    :key="alarm.seq"
                    class="alarm-item"
                    :class="{ 'unread': !alarm.isRead }"
                    @click="handleAlarmClick(alarm)"
                  >
                    <div class="alarm-content">
                      <p class="alarm-message">{{ alarm.message }}</p>
                      <span class="alarm-date">{{ formatAlarmDate(alarm.createdAt) }}</span>
                    </div>
                    <div v-if="!alarm.isRead" class="alarm-unread-indicator"></div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="handleMyInfo" class="btn btn-my-info">
              <span class="btn-text">내 정보</span>
              <div class="btn-icon-wrapper">
                <img :src="myPageImage" alt="내 정보" class="btn-icon" />
                <span class="btn-icon-label">My</span>
              </div>
            </button>
            <button @click="handleLogout" class="btn-logout">
              <span class="btn-text">로그아웃</span>
              <div class="btn-icon-wrapper">
                <img :src="logoutImage" alt="로그아웃" class="btn-icon" />
                <span class="btn-icon-label">Logout</span>
              </div>
            </button>
          </div>
          <div v-else class="auth-buttons">
            <RouterLink v-if="!isLoginPage" to="/login" class="btn btn-secondary">로그인</RouterLink>
            <RouterLink v-if="!isJoinPage" to="/join" class="btn btn-outline">회원가입</RouterLink>
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
    
    <!-- 알람 모달 오버레이 (배경 클릭 시 닫기) -->
    <div v-if="showAlarmModal" class="alarm-modal-overlay" @click="closeAlarmModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import logoImage from '@/assets/image/logo/KP_CI_simbol.png'
import myPageImage from '@/assets/image/logo/user.png'
import logoutImage from '@/assets/image/logo/logout.png'
import alertImage from '@/assets/image/logo/alert.png'
import { getUnreadAlarms, getAllAlarms, markAlarmAsRead, markAllAlarmsAsRead, type UserAlarm } from '@/api/alarm'

const router = useRouter()
const route = useRoute()

interface User {
  userId: number
  email: string
  name: string
  division: string
  team: string
  position: string
  status: string
}

const user = ref<User | null>(null)
const alarms = ref<UserAlarm[]>([])
const showAlarmModal = ref(false)
let alarmInterval: number | null = null

const isLoginPage = computed(() => route.path === '/login')
const isJoinPage = computed(() => route.path === '/join')
const unreadAlarmCount = computed(() => alarms.value.filter(a => !a.isRead).length)

const updateUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
      // 사용자가 로그인되어 있으면 알람 로드
      if (user.value && !alarmInterval) {
        loadAlarms()
        // 30초마다 알람 새로고침
        alarmInterval = window.setInterval(loadAlarms, 30000)
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
      user.value = null
      // 로그아웃 시 알람 인터벌 정리
      if (alarmInterval !== null) {
        clearInterval(alarmInterval)
        alarmInterval = null
      }
      alarms.value = []
    }
  } else {
    user.value = null
    // 로그아웃 시 알람 인터벌 정리
    if (alarmInterval !== null) {
      clearInterval(alarmInterval)
      alarmInterval = null
    }
    alarms.value = []
  }
}

// 알람 로드
const loadAlarms = async () => {
  if (!user.value) return
  try {
    const response = await getUnreadAlarms()
    alarms.value = response.resultMsg || []
  } catch (error) {
    console.error('알람 로드 실패:', error)
  }
}

// 알람 모달 토글
const toggleAlarmModal = async () => {
  showAlarmModal.value = !showAlarmModal.value
  if (showAlarmModal.value) {
    // 모달 열 때 모든 알람 로드
    try {
      const response = await getAllAlarms()
      alarms.value = response.resultMsg || []
    } catch (error) {
      console.error('알람 로드 실패:', error)
    }
  }
}

// 알람 모달 닫기
const closeAlarmModal = () => {
  showAlarmModal.value = false
}

// 알람 클릭 처리
const handleAlarmClick = async (alarm: UserAlarm) => {
  // 읽지 않은 알람이면 읽음 처리
  if (!alarm.isRead) {
    try {
      await markAlarmAsRead(alarm.seq)
      alarm.isRead = true
    } catch (error) {
      console.error('알람 읽음 처리 실패:', error)
    }
  }
  
  // 모달 닫기
  closeAlarmModal()
  
  // 알람 타입에 따라 이동
  if (alarm.redirectUrl) {
    router.push(alarm.redirectUrl)
  }
}

// 모두 읽음 처리
const markAllAsRead = async () => {
  try {
    await markAllAlarmsAsRead()
    alarms.value.forEach(alarm => {
      alarm.isRead = true
    })
    await loadAlarms() // 읽지 않은 알람 목록 새로고침
  } catch (error) {
    console.error('모두 읽음 처리 실패:', error)
  }
}

// 알람 날짜 포맷팅
const formatAlarmDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

onMounted(() => {
  updateUser()
  
  // localStorage 변경 감지 (다른 탭에서의 변경)
  window.addEventListener('storage', updateUser)
  
  // 같은 탭에서의 변경 감지를 위한 커스텀 이벤트
  window.addEventListener('user-updated', updateUser)
  
  // 사용자가 로그인되어 있으면 알람 로드 및 주기적 갱신
  if (user.value) {
    loadAlarms()
    // 30초마다 알람 새로고침
    alarmInterval = window.setInterval(loadAlarms, 30000)
  }
})

onUnmounted(() => {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval)
  }
  window.removeEventListener('storage', updateUser)
  window.removeEventListener('user-updated', updateUser)
})

const handleMyInfo = () => {
  router.push('/my-info')
}

const handleLogoClick = () => {
  if (user.value) {
    // 로그인한 상태면 dashboard로 이동
    router.push('/dashboard')
  } else {
    // 로그인하지 않은 상태면 home으로 이동
    router.push('/')
  }
}

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  user.value = null
  // 사용자 정보 업데이트 이벤트 발생
  window.dispatchEvent(new Event('user-updated'))
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.global-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: inline-block;
  text-decoration: none;
}

.header-logo {
  height: 40px;
  width: auto;
  transition: transform 0.3s ease;
}

.logo-link:hover .header-logo {
  transform: scale(1.05);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #0d1f7a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  gap: 0.25rem;
}

.btn-logout:hover {
  background-color: #0a1755;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.25rem;
}

.btn-secondary {
  background-color: #1226aa;
  color: white;
}

.btn-secondary:hover {
  background-color: #0f1f88;
}

.btn-outline {
  background-color: transparent;
  color: #1226aa;
  border: 2px solid #1226aa;
}

.btn-outline:hover {
  background-color: #1226aa;
  color: white;
}

.btn-my-info {
  background-color: #17ccff;
  color: white;
}

.btn-my-info:hover {
  background-color: #14b3e6;
}

/* 버튼 내부 텍스트/이미지 기본 스타일 */
.btn-text {
  display: inline;
}

.btn-icon-wrapper {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.btn-icon {
  display: none;
  width: 24px;
  height: 24px;
  object-fit: contain;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 2px;
}

.btn-icon-label {
  display: none;
  font-size: 0.65rem;
  color: #2c3e50;
  font-weight: 700;
}

.btn-logout .btn-text {
  display: inline;
}

.btn-logout .btn-icon-wrapper {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.btn-logout .btn-icon {
  display: none;
  width: 24px;
  height: 24px;
  object-fit: contain;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 2px;
}

.btn-logout .btn-icon-label {
  display: none;
  font-size: 0.65rem;
  color: #2c3e50;
  font-weight: 700;
}

.main-content {
  flex: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 모바일 반응형 스타일 */
@media (max-width: 768px) {
  .header-content {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-left {
    flex-shrink: 0;
    padding-left: 0.5rem;
  }

  .header-logo {
    height: 32px;
  }

  .header-right {
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
  }

  .user-info {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  /* 모바일에서 사용자 정보 텍스트 숨김 또는 줄바꿈 */
  .user-name {
    display: none; /* 작은 화면에서는 숨김 */
  }

  .btn {
    padding: 0.5rem;
    font-size: 0.85rem;
    min-width: 40px;
    position: relative;
  }

  .btn-logout {
    padding: 0.5rem;
    min-width: 40px;
  }
  
  /* 768px 이하에서는 텍스트와 이미지 모두 표시 (텍스트 우선) */
  .user-info .btn .btn-text,
  .user-info .btn-text {
    display: inline !important;
  }

  .user-info .btn .btn-icon,
  .user-info .btn-icon {
    display: none !important;
  }

  .user-info .btn-logout .btn-text {
    display: inline !important;
  }

  .user-info .btn-logout .btn-icon {
    display: none !important;
  }
}

/* 작은 모바일 화면 (600px 이하) */
@media (max-width: 600px) {
  .header-content {
    padding: 0.5rem;
  }

  .header-left {
    padding-left: 0.75rem;
  }

  .header-logo {
    height: 28px;
  }

  .header-right {
    flex-shrink: 0;
  }

  .user-info {
    gap: 0.25rem;
    flex-wrap: nowrap;
  }

  .btn {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    min-width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    gap: 2px;
    flex-shrink: 0;
  }

  .btn-logout {
    padding: 0.4rem 0.5rem;
    min-width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    gap: 2px;
    flex-shrink: 0;
  }

  /* 작은 화면에서는 텍스트 숨기고 이미지와 라벨 표시 */
  .user-info .btn .btn-text,
  .user-info .btn-text {
    display: none !important;
    visibility: hidden !important;
  }

  .user-info .btn .btn-icon-wrapper,
  .user-info .btn-icon-wrapper {
    display: flex !important;
    visibility: visible !important;
  }

  .user-info .btn .btn-icon,
  .user-info .btn-icon {
    display: inline-block !important;
    visibility: visible !important;
    width: 32px;
    height: 32px;
    object-fit: contain;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 4px;
  }

  .user-info .btn .btn-icon-label,
  .user-info .btn-icon-label {
    display: block !important;
    visibility: visible !important;
    font-size: 0.6rem;
    color: #2c3e50;
    font-weight: 700;
  }

  .user-info .btn-logout .btn-text {
    display: none !important;
    visibility: hidden !important;
  }

  .user-info .btn-logout .btn-icon-wrapper {
    display: flex !important;
    visibility: visible !important;
  }

  .user-info .btn-logout .btn-icon {
    display: inline-block !important;
    visibility: visible !important;
    width: 32px;
    height: 32px;
    object-fit: contain;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 4px;
  }

  .user-info .btn-logout .btn-icon-label {
    display: block !important;
    visibility: visible !important;
    font-size: 0.6rem;
    color: #2c3e50;
    font-weight: 700;
  }
}

/* 매우 작은 모바일 화면 (576px 이하) */
@media (max-width: 576px) {
  .header-content {
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
  }

  .header-left {
    padding-left: 0.5rem;
    flex-shrink: 0;
  }

  .header-logo {
    height: 26px;
  }

  .header-right {
    flex-shrink: 0;
    min-width: 0;
  }

  .user-info {
    gap: 0.2rem;
    flex-wrap: nowrap;
  }

  .btn {
    padding: 0.35rem 0.4rem;
    font-size: 0.7rem;
    min-width: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    gap: 1px;
    flex-shrink: 0;
  }

  .btn-logout {
    padding: 0.35rem 0.4rem;
    min-width: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    gap: 1px;
    flex-shrink: 0;
  }

  .user-info .btn .btn-icon,
  .user-info .btn-icon {
    width: 28px;
    height: 28px;
    padding: 3px;
  }

  .user-info .btn-logout .btn-icon {
    width: 28px;
    height: 28px;
    padding: 3px;
  }

  .user-info .btn .btn-icon-label,
  .user-info .btn-icon-label {
    font-size: 0.55rem;
  }

  .user-info .btn-logout .btn-icon-label {
    font-size: 0.55rem;
  }

  /* 작은 화면에서는 텍스트 숨기고 이미지와 라벨 표시 */
  .user-info .btn .btn-text,
  .user-info .btn-text {
    display: none !important;
    visibility: hidden !important;
  }

  .user-info .btn .btn-icon-wrapper,
  .user-info .btn-icon-wrapper {
    display: flex !important;
    visibility: visible !important;
  }

  .user-info .btn .btn-icon,
  .user-info .btn-icon {
    display: inline-block !important;
    visibility: visible !important;
    width: 28px;
    height: 28px;
    object-fit: contain;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 3px;
  }

  .user-info .btn .btn-icon-label,
  .user-info .btn-icon-label {
    display: block !important;
    visibility: visible !important;
    font-size: 0.55rem;
    color: #2c3e50;
    font-weight: 700;
  }

  .user-info .btn-logout .btn-text {
    display: none !important;
    visibility: hidden !important;
  }

  .user-info .btn-logout .btn-icon-wrapper {
    display: flex !important;
    visibility: visible !important;
  }

  .user-info .btn-logout .btn-icon {
    display: inline-block !important;
    visibility: visible !important;
    width: 28px;
    height: 28px;
    object-fit: contain;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 3px;
  }

  .user-info .btn-logout .btn-icon-label {
    display: block !important;
    visibility: visible !important;
    font-size: 0.55rem;
    color: #2c3e50;
    font-weight: 700;
  }
}

/* 알람 스타일 */
.alarm-container {
  position: relative;
  margin-right: 0.5rem;
}

.btn-alarm {
  position: relative;
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: auto;
}

.btn-alarm:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.alarm-icon {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.alarm-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
}

/* 알람 모달 */
.alarm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.alarm-modal-content {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.alarm-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.alarm-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.alarm-modal-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-mark-all-read {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-mark-all-read:hover {
  background: #0056b3;
}

.btn-close-modal {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  color: #000;
}

.alarm-list {
  overflow-y: auto;
  flex: 1;
}

.alarm-empty {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.alarm-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.alarm-item:hover {
  background-color: #f8f9fa;
}

.alarm-item.unread {
  background-color: #e3f2fd;
}

.alarm-item.unread:hover {
  background-color: #bbdefb;
}

.alarm-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.alarm-message {
  margin: 0;
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
}

.alarm-date {
  font-size: 0.75rem;
  color: #999;
}

.alarm-unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  margin-left: 0.5rem;
}

@media (max-width: 600px) {
  .alarm-modal-content {
    position: fixed;
    width: calc(100vw - 1rem);
    max-width: calc(100vw - 1rem);
    right: 0.5rem;
    top: 70px; /* 헤더 높이를 고려한 위치 */
    max-height: calc(100vh - 80px); /* 화면 높이에서 헤더와 여백 제외 */
    transform: none;
  }
  
  .alarm-icon {
    width: 1.2rem;
    height: 1.2rem;
  }

  .alarm-modal-header {
    padding: 0.75rem;
  }

  .alarm-modal-header h3 {
    font-size: 1rem;
  }

  .alarm-list {
    max-height: calc(70vh - 80px);
  }

  .alarm-item {
    padding: 0.75rem;
  }

  .alarm-message {
    font-size: 0.9rem;
  }

  .alarm-date {
    font-size: 0.8rem;
  }
  
  .alarm-badge {
    width: 16px;
    height: 16px;
    font-size: 0.65rem;
  }
}
</style>

