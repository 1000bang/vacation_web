# Vacation Web

Vue3 + TypeScript로 작성된 프론트엔드 프로젝트입니다.

## 프로젝트 구조 설명

```
web/
├── src/
│   ├── api/              # API 통신 관련 파일
│   │   └── axios.ts      # axios 인스턴스 설정
│   ├── assets/           # 정적 파일 (CSS, 이미지 등)
│   │   └── main.css      # 전역 스타일
│   ├── router/           # Vue Router 설정
│   │   └── index.ts      # 라우터 정의
│   ├── stores/           # Pinia 상태 관리
│   │   └── counter.ts    # 예제 스토어
│   ├── views/            # 페이지 컴포넌트
│   │   ├── HomeView.vue  # 홈 페이지
│   │   └── AboutView.vue # About 페이지
│   ├── App.vue           # 루트 컴포넌트
│   └── main.ts           # 애플리케이션 진입점
├── index.html            # HTML 템플릿
├── package.json          # 프로젝트 의존성 및 스크립트
├── tsconfig.json         # TypeScript 설정
├── vite.config.ts        # Vite 빌드 도구 설정
└── .env.example          # 환경 변수 예시
```

## 주요 기술 스택

- **Vue 3**: 최신 Vue 프레임워크 (Composition API 사용)
- **TypeScript**: 타입 안정성을 위한 JavaScript의 상위 집합
- **Vite**: 빠른 개발 서버와 빌드 도구
- **Vue Router**: SPA 라우팅
- **Pinia**: Vue의 공식 상태 관리 라이브러리
- **Axios**: HTTP 클라이언트
- **ESLint + Prettier**: 코드 품질 및 포맷팅

## 설치 및 실행

### 1. 의존성 설치

```bash
cd web
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 4. 코드 포맷팅 및 린팅

```bash
npm run lint
```

## TypeScript 사용법

### 컴포넌트 작성 예시

```vue
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="handleClick">클릭</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 타입을 명시적으로 지정
const message = ref<string>('Hello Vue3 + TypeScript')

// 함수의 매개변수와 반환값에 타입 지정
const handleClick = (): void => {
  console.log('Button clicked')
}
</script>
```

### API 호출 예시

```typescript
import apiClient from '@/api/axios'

interface User {
  id: number
  name: string
  email: string
}

// API 호출 함수
async function fetchUser(id: number): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`)
  return response.data
}
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 주요 개념 설명

### 1. Composition API (setup 문법)

Vue 3의 새로운 방식으로, 로직을 더 재사용 가능하고 구성 가능하게 만듭니다.

```vue
<script setup lang="ts">
// 변수 선언
const count = ref(0)

// 함수 정의
const increment = () => {
  count.value++
}
</script>
```

### 2. TypeScript 타입 지정

```typescript
// 기본 타입
const name: string = 'John'
const age: number = 30

// 배열
const items: string[] = ['a', 'b', 'c']

// 객체
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}
```

### 3. Vue Router

```typescript
// router/index.ts에서 라우트 정의
{
  path: '/users',
  name: 'users',
  component: () => import('../views/UsersView.vue')
}
```

### 4. Pinia (상태 관리)

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: ''
  }),
  actions: {
    setUser(name: string, email: string) {
      this.name = name
      this.email = email
    }
  }
})
```

## 개발 팁

1. **타입 안정성**: TypeScript를 활용하여 타입 오류를 컴파일 타임에 잡아내세요.
2. **컴포넌트 분리**: 재사용 가능한 컴포넌트는 별도 파일로 분리하세요.
3. **API 통신**: 모든 API 호출은 `src/api/` 폴더에 모아 관리하세요.
4. **상태 관리**: 전역 상태가 필요한 경우 Pinia 스토어를 사용하세요.

