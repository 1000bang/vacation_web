<template>
  <div class="home">
    <div class="home-container">
      <div class="logo-section">
        <div class="logo-button">
          <img :src="logoImage" alt="Knowledge Point Logo" class="logo-image" />
        </div>
      </div>

      <div class="content-section">
        <h1>개인비용 문서 생성 시스템</h1>
        <p class="description">
          이 프로젝트는 개인비용 문서를 편하게 작성하기 위해 만들어졌습니다.
        </p>

        <div class="button-section">
          <a @click="handleDocumentCreate" class="btn btn-primary">
            개인비용 문서 생성하기
          </a>
        </div>

        <div class="footer-section">
          <p class="bug-report">
            버그 신고는
            <a href="mailto:1000bang@knowledgepoint.co.kr" class="email-link">
              1000bang@knowledgepoint.co.kr
            </a>
            을 통해 부탁드립니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import logoImage from '@/assets/image/logo/KP_CI_simbol.png'

const router = useRouter()

const handleDocumentCreate = () => {
  // localStorage에서 user 정보 확인
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user && user.userId) {
        // 로그인한 상태면 /document로 이동
        router.push('/document')
        return
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  // 로그인하지 않은 상태면 /sample로 이동
  router.push('/sample')
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.home-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}

.logo-section {
  margin-bottom: 2rem;
}

.logo-button {
  display: inline-block;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  padding: 1rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.logo-button:active {
  transform: translateY(-2px);
}

.logo-image {
  width: 120px;
  height: auto;
  display: block;
}

.content-section {
  margin-top: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 600;
}

.description {
  color: #555;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.button-section {
  margin: 2.5rem 0;
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #1226aa;
  color: white;
}

.btn-primary:hover {
  background-color: #0f1f88;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(18, 38, 170, 0.3);
}

.footer-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.bug-report {
  color: #777;
  font-size: 0.95rem;
  line-height: 1.6;
}

.email-link {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.email-link:hover {
  color: #35a372;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .home-container {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .description {
    font-size: 1rem;
  }

  .logo-image {
    width: 100px;
  }
}
</style>

