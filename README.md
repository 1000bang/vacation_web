# Vacation Web

Vue3 + TypeScript로 작성된 프론트엔드 프로젝트입니다.

## 프로젝트 구조 설명

```
web/
├── public/               # 정적 파일
│   └── favicon.png      # 파비콘
├── src/
│   ├── api/              # API 통신 관련 파일
│   │   └── axios.ts      # axios 인스턴스 설정
│   ├── assets/           # 정적 파일 (CSS, 이미지, 폰트 등)
│   │   ├── fonts/        # 폰트 파일
│   │   ├── image/        # 이미지 파일
│   │   │   ├── help/     # 도움말 이미지
│   │   │   └── logo/     # 로고 이미지
│   │   └── main.css      # 전역 스타일
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   └── HelpModal.vue # 도움말 모달 컴포넌트
│   ├── router/           # Vue Router 설정
│   │   └── index.ts      # 라우터 정의
│   ├── stores/           # Pinia 상태 관리
│   │   └── counter.ts    # 예제 스토어
│   ├── views/            # 페이지 컴포넌트
│   │   ├── HomeView.vue  # 홈 페이지
│   │   ├── AboutView.vue # About 페이지
│   │   └── SampleView.vue # 문서 생성 페이지
│   ├── App.vue           # 루트 컴포넌트
│   └── main.ts           # 애플리케이션 진입점
├── .eslintrc.cjs         # ESLint 설정
├── .gitignore            # Git 무시 파일
├── .prettierrc.json      # Prettier 설정
├── env.d.ts              # 환경 변수 타입 정의
├── index.html            # HTML 템플릿
├── package.json          # 프로젝트 의존성 및 스크립트
├── package-lock.json     # 패키지 잠금 파일
├── tsconfig.json         # TypeScript 설정
├── tsconfig.node.json    # Node.js용 TypeScript 설정
└── vite.config.ts        # Vite 빌드 도구 설정
```

## 주요 기술 스택

- `Vue 3`, `TypeScript`, `Vite`, `Vue Router`,`Pinia`, `Axios`, `ESLint + Prettier`

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

