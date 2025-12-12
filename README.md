# Tickatch Web

티케팅 서비스 웹 프론트엔드 애플리케이션

## 📋 프로젝트 개요

Tickatch는 티켓 예매 플랫폼으로, 고객(Customer), 판매자(Seller), 관리자(Admin) 세 가지 사용자 유형을 지원합니다. 각 사용자 유형별로 독립된 로그인 및 대시보드를 제공합니다.

## 🛠 기술 스택

| 분류             | 기술                                    |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 15 (App Router)                 |
| Language         | TypeScript                              |
| Styling          | Tailwind CSS v4                         |
| State Management | React Context API, useSyncExternalStore |
| Authentication   | HttpOnly Cookie 기반 토큰 관리          |

## 📁 프로젝트 구조

```
tickatch_web/
├── .env.local                          # 환경 변수
├── public/
│   └── images/
│       └── logo-customer.png           # 고객용 로고
└── src/
    ├── app/
    │   ├── layout.tsx                  # 루트 레이아웃
    │   ├── page.tsx                    # 메인 페이지 (/)
    │   ├── globals.css                 # 글로벌 CSS (Tailwind v4)
    │   └── login/
    │       └── page.tsx                # 고객 로그인 (/login)
    ├── components/
    │   ├── common/
    │   │   ├── Header.tsx              # 공통 헤더 (스크롤 감지)
    │   │   ├── SearchBar.tsx           # 검색바
    │   │   ├── ThemeToggle.tsx         # 다크모드 토글
    │   │   ├── NotificationBell.tsx    # 알림 버튼
    │   │   ├── NotificationDropdown.tsx# 알림 드롭다운
    │   │   ├── UserDropdown.tsx        # 사용자 드롭다운
    │   │   └── MobileSidebar.tsx       # 모바일 사이드바
    │   └── home/
    │       └── HeroBanner.tsx          # 히어로 배너
    ├── providers/
    │   ├── ThemeProvider.tsx           # 다크모드 Provider
    │   └── AuthProvider.tsx            # 인증 Provider
    ├── hooks/
    │   ├── useNotification.ts          # 알림 커스텀 훅
    │   └── useQueue.ts                 # 대기열 커스텀 훅
    ├── lib/
    │   ├── api-client.ts               # API 설정
    │   └── utils.ts                    # 유틸리티 함수 (cn)
    └── types/
        ├── auth.ts                     # 인증 타입 정의
        └── product.ts                  # 상품/카테고리 타입 정의
```

## ✅ 구현 완료 사항

### 1. 테마 시스템 (Tailwind CSS v4)

- **globals.css**: CSS 변수 기반 테마 정의
- **다크모드 variant**: `@custom-variant dark` 설정
- 라이트/다크 모드 CSS 변수:
    - `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--accent`
- 스크롤바 숨김 처리
- 커스텀 애니메이션 (fade-in, slide-in, pulse-glow)
- line-clamp 유틸리티 (1, 2, 3줄)

### 2. 헤더 시스템

#### Header.tsx
- **스크롤 감지**: 배너 높이의 80% 지점에서 상태 변경
- **배경색 전환**:
    - 배너 위: 투명 (`bg-transparent`)
    - 스크롤 후 라이트: 흰색 (`bg-white`)
    - 스크롤 후 다크: 검정 (`dark:bg-black`)
- **로고 이미지**: CSS filter로 색상 제어
    - 배너 위: `brightness-0 invert` (흰색)
    - 스크롤 후 다크모드: `dark:brightness-0 dark:invert` (흰색)
- **border 전환**: `border-transparent` ↔ `border-gray-200/gray-800` (깜빡임 방지)

#### SearchBar.tsx
- 검색어 입력 + 자동완성
- 최근 검색어 / 인기 검색어 표시
- `useMemo`로 suggestions 계산 (lint 에러 해결)

#### ThemeToggle.tsx
- 태양/달 아이콘 애니메이션
- `isScrolled` 상태에 따른 스타일 변경

#### NotificationBell.tsx
- 읽지 않은 알림 표시 (빨간 점)
- 드롭다운 알림 목록

#### UserDropdown.tsx
- 비로그인: 밑줄 있는 "로그인" 링크
- 로그인: 사용자 아바타 + 드롭다운 메뉴
    - 마이페이지, 예매 내역, 찜 목록, 설정, 로그아웃

#### MobileSidebar.tsx
- 다크 테마 고정 (`bg-[#1a1a1a]`)
- 카테고리 메뉴 + 정보 메뉴 + MY티켓

### 3. 히어로 배너 (HeroBanner.tsx)

- 10개 더미 배너 데이터
- 자동 슬라이드 (5초 간격)
- 프로그레스 바 + 페이지 번호
- 좌우 네비게이션 버튼
- 포스터 이미지 표시

### 4. 로그인 페이지 (/login)

- 헤더 미포함 (독립 레이아웃)
- 소셜 로그인: 카카오, 네이버, 구글
- 이메일 로그인 폼
- 다크모드 완벽 대응
- 로고 클릭 시 홈으로 이동

### 5. 인증 시스템

#### AuthProvider.tsx
- `LoginResponse` 타입 사용
- 토큰 메모리 저장 (ref)
- 사용자 정보 상태 관리

#### 타입 정의 (auth.ts)
```typescript
interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

interface LoginResponse {
  authId: string;
  email: string;
  userType: UserType;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
```

### 6. 메인 페이지 (/)

- Header + HeroBanner 구성
- What's Hot 섹션 (플레이스홀더)
- 카테고리별 추천 섹션 (콘서트, 뮤지컬)
- 푸터 (고객센터, 이용안내, 파트너)

## 🎨 다크모드 색상 체계

| 영역 | 라이트모드 | 다크모드 |
|------|-----------|---------|
| 헤더 (배너 위) | 투명 | 투명 |
| 헤더 (스크롤 후) | `bg-white` | `bg-black` |
| 헤더 텍스트 (스크롤 후) | `text-gray-700` | `text-white` |
| 메인 배경 | `bg-gray-50` | `bg-gray-950` |
| 카드 | `bg-white` | `bg-gray-900` |
| 사이드바 | `#1a1a1a` | `#1a1a1a` |
| 푸터 | `bg-gray-900` | `bg-gray-900` |

## 🔀 라우팅 구조

| 경로            | 설명             | 헤더 | 인증 필요 | OAuth |
| --------------- | ---------------- | :--: | :-------: | :---: |
| `/`             | 고객 메인 페이지 |  ✅  |    ❌     |   -   |
| `/login`        | 고객 로그인      |  ❌  |    ❌     |  ✅   |
| `/seller`       | 판매자 대시보드  |  ✅  |    ✅     |   -   |
| `/seller/login` | 판매자 로그인    |  ❌  |    ❌     |  ❌   |
| `/admin`        | 관리자 대시보드  |  ✅  |    ✅     |   -   |
| `/admin/login`  | 관리자 로그인    |  ❌  |    ❌     |  ❌   |

## ⚙️ 환경 변수

```env
# API 서버 주소
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📝 TODO

- [ ] 회원가입 페이지 (`/signup`)
- [ ] 비밀번호 찾기 페이지 (`/forgot-password`)
- [ ] OAuth 콜백 처리
- [ ] 상품 상세 페이지
- [ ] 상품 목록/카테고리 페이지
- [ ] 대기열 페이지 (`/queue`)
- [ ] 좌석 선택 페이지
- [ ] 결제 페이지
- [ ] 마이페이지
- [ ] 판매자 대시보드
- [ ] 관리자 대시보드

## 🔧 개발 노트

### Tailwind CSS v4 다크모드 설정

`tailwind.config.ts`의 `darkMode: "class"` 설정이 v4에서는 무시됨.
`globals.css`에 다음 추가 필요:

```css
@import "tailwindcss";

/* Tailwind v4 다크모드 설정 */
@custom-variant dark (&:where(.dark, .dark *));
```

### 헤더 border 깜빡임 해결

```tsx
// Before: border가 추가될 때 흰색 줄 깜빡임
isScrolled ? "border-b border-gray-200" : ""

// After: border 항상 유지, 색상만 전환
"border-b",
isScrolled ? "border-gray-200" : "border-transparent"
```

### 로고 이미지 색상 제어

검은색 로고를 다크모드에서 흰색으로 변환:
```tsx
className={cn(
  !isScrolled && "brightness-0 invert",        // 배너 위: 흰색
  isScrolled && "dark:brightness-0 dark:invert" // 다크모드: 흰색
)}
```

### React 19 호환성

- `useEffect` 내 동기적 `setState` 호출 금지 → `useMemo` 사용
- `useSyncExternalStore` 패턴으로 외부 상태 관리