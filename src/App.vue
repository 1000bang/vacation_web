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
            <button @click="handleMyInfo" class="btn btn-my-info">
              <span class="btn-text">내 정보</span>
              <span class="btn-emoji">👤</span>
            </button>
            <button @click="handleLogout" class="btn-logout">
              <span class="btn-text">로그아웃</span>
              <span class="btn-emoji">🚪</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import logoImage from '@/assets/image/logo/KP_CI_simbol.png'

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

const isLoginPage = computed(() => route.path === '/login')
const isJoinPage = computed(() => route.path === '/join')

const updateUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
      user.value = null
    }
  } else {
    user.value = null
  }
}

onMounted(() => {
  updateUser()
  
  // localStorage 변경 감지 (다른 탭에서의 변경)
  window.addEventListener('storage', updateUser)
  
  // 같은 탭에서의 변경 감지를 위한 커스텀 이벤트
  window.addEventListener('user-updated', updateUser)
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
  padding: 0.5rem 1rem;
  background-color: #0d1f7a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background-color: #0a1755;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
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

  .btn-text {
    display: inline;
  }

  .btn-emoji {
    display: none;
  }

  .btn-logout {
    padding: 0.5rem;
    min-width: 40px;
  }
}

/* 작은 모바일 화면 (480px 이하) */
@media (max-width: 480px) {
  .header-content {
    padding: 0.5rem;
  }

  .header-logo {
    height: 28px;
  }

  .user-info {
    gap: 0.25rem;
  }

  .btn {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }

  /* 작은 화면에서는 텍스트 숨기고 이모지만 표시 */
  .btn-text {
    display: none;
  }

  .btn-emoji {
    display: inline;
    font-size: 1.2rem;
  }

  .btn-logout .btn-text {
    display: none;
  }

  .btn-logout .btn-emoji {
    display: inline;
    font-size: 1.2rem;
  }
}
</style>

