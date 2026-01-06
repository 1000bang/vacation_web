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

## 이미지 

### 1. home
<img width="2880" height="1800" alt="CleanShot 2026-01-06 at 09 17 09@2x" src="https://github.com/user-attachments/assets/4cea2b8d-0480-4053-84a1-9bdcee52b365" />

### 2. 원하는 문서 양식 선택
<img width="2432" height="812" alt="CleanShot 2026-01-06 at 09 18 15@2x" src="https://github.com/user-attachments/assets/c45d1c5b-ee48-4cd7-a70d-ef480e27d021" />

### 3. 양식에 맞게 작성 후 출력 
<img width="1748" height="1508" alt="CleanShot 2026-01-06 at 09 19 31@2x" src="https://github.com/user-attachments/assets/2aa58405-28f2-4359-9747-75754d913aa0" />

