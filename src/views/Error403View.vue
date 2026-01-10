<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-icon">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ff6b6b"/>
        </svg>
      </div>
      <h1 class="error-title">403</h1>
      <h2 class="error-subtitle">접근 권한이 없습니다</h2>
      <p class="error-message">
        요청하신 페이지에 접근할 수 있는 권한이 없습니다.<br>
        존재하지 않는 페이지이거나 접근이 제한된 페이지일 수 있습니다.
      </p>
      <div class="error-actions">
        <button @click="goHome" class="btn btn-primary">홈으로 이동</button>
        <button @click="goBack" class="btn btn-secondary">이전 페이지로</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.error-content {
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-title {
  font-size: 72px;
  font-weight: 700;
  color: #ff6b6b;
  margin: 0 0 20px 0;
  line-height: 1;
}

.error-subtitle {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.error-message {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 40px 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-primary {
  background-color: #1226aa;
  color: white;
}

.btn-primary:hover {
  background-color: #0f1f88;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

@media (max-width: 600px) {
  .error-content {
    padding: 40px 20px;
  }

  .error-title {
    font-size: 56px;
  }

  .error-subtitle {
    font-size: 24px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
