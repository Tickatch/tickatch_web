# Tickatch Web

티케팅 서비스 웹 프론트엔드 애플리케이션

## 📋 프로젝트 개요

Tickatch는 티켓 예매 플랫폼으로, 고객(Customer), 판매자(Seller), 관리자(Admin) 세 가지 사용자 유형을 지원합니다. 각 사용자 유형별로 독립된 로그인 및 대시보드를 제공합니다.

## 🛠 기술 스택

| 분류             | 기술                                     |
| ---------------- | ---------------------------------------- |
| Framework        | Next.js 15 (App Router)                  |
| Language         | TypeScript                               |
| Styling          | Tailwind CSS v4                          |
| State Management | React Context API, useSyncExternalStore  |
| Authentication   | HttpOnly Cookie 기반 토큰 관리           |

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── page.tsx                      # 메인 페이지 (/)
│   ├── globals.css                   # 글로벌 CSS (Tailwind v4)
│   │
│   ├── login/page.tsx                # 고객 로그인
│   ├── signup/page.tsx               # 고객 회원가입
│   ├── forgot-password/page.tsx      # 비밀번호 찾기
│   ├── oauth/callback/page.tsx       # OAuth 콜백
│   │
│   ├── products/
│   │   ├── page.tsx                  # 상품 목록 (/products, /products?type=XXX)
│   │   └── [id]/page.tsx             # 상품 상세
│   │
│   ├── category/[type]/page.tsx      # 카테고리 리다이렉트 → /products?type=XXX
│   ├── queue/page.tsx                # 대기열 페이지
│   │
│   ├── seller/                       # 판매자 영역
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 판매자 대시보드
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── admin/                        # 관리자 영역
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 관리자 대시보드
│   │   └── login/page.tsx
│   │
│   └── api/                          # API Routes (Next.js Route Handlers)
│       ├── auth/                     # 인증 API (14개)
│       ├── products/                 # 상품 API (14개)
│       ├── arthalls/                 # 공연장/스테이지/좌석 API (11개)
│       ├── reservations/             # 예매 API (5개)
│       ├── reservation-seats/        # 예매 좌석 API (5개)
│       └── queue/                    # 대기열 API (2개)
│
├── components/
│   ├── auth/
│   │   └── LoginCard.tsx             # 로그인 카드 컴포넌트
│   ├── common/
│   │   ├── Header.tsx                # 공통 헤더
│   │   ├── SearchBar.tsx             # 검색바
│   │   ├── ThemeToggle.tsx           # 다크모드 토글
│   │   ├── NotificationBell.tsx      # 알림 버튼
│   │   ├── NotificationDropdown.tsx  # 알림 드롭다운
│   │   ├── UserDropdown.tsx          # 사용자 드롭다운
│   │   ├── MobileSidebar.tsx         # 모바일 사이드바
│   │   └── AuthButton.tsx            # 인증 버튼
│   └── home/
│       └── HeroBanner.tsx            # 히어로 배너
│
├── hooks/
│   ├── useNotification.ts            # 알림 훅
│   ├── useOAuthPopup.ts              # OAuth 팝업 훅
│   └── useQueue.ts                   # 대기열 훅
│
├── lib/
│   ├── api-client.ts                 # API 클라이언트 (엔드포인트 정의)
│   ├── api-config.ts                 # API 설정
│   └── utils.ts                      # 유틸리티 함수
│
├── providers/
│   ├── AuthProvider.tsx              # 인증 Provider
│   └── ThemeProvider.tsx             # 다크모드 Provider
│
└── types/
    ├── auth.ts                       # 인증 타입
    ├── product.ts                    # 상품 타입
    ├── venue.ts                      # 공연장/스테이지/좌석 타입
    ├── reservation.ts                # 예매 타입
    ├── reservation-seat.ts           # 예매 좌석 타입
    └── queue.ts                      # 대기열 타입
```

## 🔌 API Routes

### Auth API (`/api/auth/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/auth/me` | 내 정보 조회 |
| GET | `/api/auth/session` | 세션 확인 |
| POST | `/api/auth/check-email` | 이메일 중복 확인 |
| POST | `/api/auth/find-password` | 비밀번호 찾기 |
| PUT | `/api/auth/password` | 비밀번호 변경 |
| DELETE | `/api/auth/withdraw` | 회원 탈퇴 |
| GET | `/api/auth/oauth/[provider]` | OAuth 로그인 URL |
| GET | `/api/auth/oauth/[provider]/callback` | OAuth 콜백 |
| POST | `/api/auth/oauth/[provider]/link` | OAuth 연동 |
| DELETE | `/api/auth/oauth/[provider]/unlink` | OAuth 해제 |

### Products API (`/api/products/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/products` | 상품 목록 |
| POST | `/api/products` | 상품 등록 |
| GET | `/api/products/[id]` | 상품 상세 |
| PUT | `/api/products/[id]` | 상품 수정 |
| DELETE | `/api/products/[id]` | 상품 취소 |
| POST | `/api/products/[id]/submit` | 심사 제출 |
| POST | `/api/products/[id]/approve` | 승인 (관리자) |
| POST | `/api/products/[id]/reject` | 반려 (관리자) |
| POST | `/api/products/[id]/resubmit` | 재제출 |
| POST | `/api/products/[id]/schedule` | 예매 예정 |
| POST | `/api/products/[id]/start-sale` | 판매 시작 |
| POST | `/api/products/[id]/close-sale` | 판매 종료 |
| POST | `/api/products/[id]/complete` | 완료 |
| GET | `/api/products/[id]/reservation-seats` | 상품의 예매 좌석 목록 |

### ArtHall API (`/api/arthalls/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/arthalls` | 공연장 목록 |
| POST | `/api/arthalls` | 공연장 등록 |
| GET | `/api/arthalls/[id]` | 공연장 상세 |
| PUT | `/api/arthalls/[id]` | 공연장 수정 |
| DELETE | `/api/arthalls/[id]` | 공연장 삭제 |
| POST | `/api/arthalls/[id]/status` | 공연장 상태 변경 |
| GET | `/api/arthalls/[id]/stages` | 스테이지 목록 |
| POST | `/api/arthalls/[id]/stages` | 스테이지 등록 |

### Stage API (`/api/arthalls/stages/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/arthalls/stages/[stageId]` | 스테이지 상세 |
| PUT | `/api/arthalls/stages/[stageId]` | 스테이지 수정 |
| DELETE | `/api/arthalls/stages/[stageId]` | 스테이지 삭제 |
| POST | `/api/arthalls/stages/[stageId]/status` | 스테이지 상태 변경 |
| GET | `/api/arthalls/stages/[stageId]/stage-seats` | 스테이지 좌석 목록 |
| POST | `/api/arthalls/stages/[stageId]/stage-seats` | 스테이지 좌석 등록 |

### StageSeat API (`/api/arthalls/stages/stage-seats/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| PUT | `/api/arthalls/stages/stage-seats/[seatId]` | 좌석 위치 수정 |
| POST | `/api/arthalls/stages/stage-seats/status` | 좌석 상태 변경 (벌크) |
| DELETE | `/api/arthalls/stages/stage-seats` | 좌석 삭제 (벌크) |
| GET | `/api/arthalls/stage-seats/[stageSeatId]` | 좌석 상세 |

### Reservation API (`/api/reservations/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/reservations` | 예매 생성 |
| GET | `/api/reservations/[id]` | 예매 상세 |
| GET | `/api/reservations/[id]/list` | 예매 목록 (id=reserverId) |
| POST | `/api/reservations/[id]/cancel` | 예매 취소 |
| GET | `/api/reservations/[id]/confirmed` | 예매 확정 상태 |

### ReservationSeat API (`/api/reservation-seats/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/reservation-seats` | 예매 좌석 생성 (벌크) |
| PUT | `/api/reservation-seats` | 예매 좌석 수정 (벌크) |
| POST | `/api/reservation-seats/[id]/preempt` | 좌석 선점 |
| POST | `/api/reservation-seats/[id]/reserve` | 좌석 예약 확정 |
| POST | `/api/reservation-seats/[id]/cancel` | 좌석 예약 취소 |

### Queue API (`/api/queue/*`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/queue/lineup` | 대기열 등록 |
| GET | `/api/queue/status` | 대기열 상태 |

## 📦 타입 정의

### auth.ts
```typescript
UserType = "CUSTOMER" | "SELLER" | "ADMIN"
LoginRequest, LoginResponse, RegisterRequest, User, ...
```

### product.ts
```typescript
ProductType = "CONCERT" | "MUSICAL" | "PLAY" | "SPORTS"
ProductStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SCHEDULED" | "ON_SALE" | "CLOSED" | "COMPLETED" | "CANCELLED"
AgeRating = "ALL" | "TWELVE" | "FIFTEEN" | "NINETEEN"
ProductCreateRequest, ProductUpdateRequest, ProductResponse, ...
```

### venue.ts
```typescript
ArtHallStatus = "ACTIVE" | "INACTIVE"
StageStatus = "ACTIVE" | "INACTIVE"
StageSeatStatus = "ACTIVE" | "INACTIVE"
ArtHallDetailResponse, StageDetailResponse, StageSeatListItem, ...
```

### reservation.ts
```typescript
ReservationStatus = "INIT" | "PENDING_PAYMENT" | "CONFIRMED" | "PAYMENT_FAILED" | "CANCELED" | "EXPIRED"
CreateReservationRequest, ReservationDetailResponse, ...
```

### reservation-seat.ts
```typescript
ReservationSeatStatus = "AVAILABLE" | "PREEMPTED" | "RESERVED" | "CANCELED"
ReservationSeatResponse, ReservationSeatsCreateRequest, ...
```

### queue.ts
```typescript
QueueStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED"
QueueEntry, QueueStatusResponse, ...
```

## 🔀 라우팅 구조

| 경로 | 설명 | 헤더 | 인증 |
|------|------|:----:|:----:|
| `/` | 메인 페이지 | ✅ | ❌ |
| `/login` | 고객 로그인 | ❌ | ❌ |
| `/signup` | 고객 회원가입 | ❌ | ❌ |
| `/forgot-password` | 비밀번호 찾기 | ❌ | ❌ |
| `/oauth/callback` | OAuth 콜백 | ❌ | ❌ |
| `/products` | 상품 목록 | ✅ | ❌ |
| `/products?type=XXX` | 카테고리별 상품 | ✅ | ❌ |
| `/products/[id]` | 상품 상세 | ✅ | ❌ |
| `/queue` | 대기열 | ✅ | ✅ |
| `/seller` | 판매자 대시보드 | ✅ | ✅ |
| `/seller/login` | 판매자 로그인 | ❌ | ❌ |
| `/seller/signup` | 판매자 회원가입 | ❌ | ❌ |
| `/admin` | 관리자 대시보드 | ✅ | ✅ |
| `/admin/login` | 관리자 로그인 | ❌ | ❌ |

## 🎨 다크모드 색상 체계

| 영역 | 라이트모드 | 다크모드 |
|------|-----------|---------|
| 헤더 (배너 위) | 투명 | 투명 |
| 헤더 (스크롤 후) | `bg-white` | `bg-black` |
| 메인 배경 | `bg-gray-50` | `bg-gray-950` |
| 카드 | `bg-white` | `bg-gray-900` |
| 사이드바 | `#1a1a1a` | `#1a1a1a` |
| 푸터 | `bg-gray-900` | `bg-gray-900` |

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

## ✅ 구현 완료

### 인증 시스템
- [x] 로그인/회원가입/비밀번호 찾기 페이지
- [x] OAuth 팝업 방식 로그인 (카카오, 네이버, 구글)
- [x] HttpOnly Cookie 기반 토큰 관리
- [x] 사용자 타입별 분리 (Customer/Seller/Admin)

### API Routes
- [x] Auth API (14개 엔드포인트)
- [x] Products API (14개 엔드포인트)
- [x] ArtHall/Stage/StageSeat API (11개 엔드포인트)
- [x] Reservation API (5개 엔드포인트)
- [x] ReservationSeat API (5개 엔드포인트)
- [x] Queue API (2개 엔드포인트)

### 타입 정의
- [x] 백엔드 Java DTO와 동기화된 TypeScript 타입
- [x] Enum, Request DTO, Response DTO
- [x] 유틸리티 함수 (상태별 색상, 라벨 등)

### UI/UX
- [x] 반응형 헤더 (스크롤 감지)
- [x] 다크모드 완벽 지원
- [x] 히어로 배너 슬라이더
- [x] 모바일 사이드바

## 📝 TODO

### 페이지
- [ ] 마이페이지
- [ ] 예매 내역 페이지
- [ ] 좌석 선택 페이지
- [ ] 결제 페이지
- [ ] 판매자 상품 관리 페이지
- [ ] 관리자 심사 페이지

### 기능
- [ ] 실시간 알림 (WebSocket)
- [ ] 실시간 대기열 (SSE/WebSocket)
- [ ] 이미지 업로드
- [ ] 페이지네이션 컴포넌트
- [ ] 검색 기능 구현

### 최적화
- [ ] SEO 메타태그
- [ ] 이미지 최적화 (next/image)
- [ ] 캐싱 전략
- [ ] 에러 바운더리

## 🔧 개발 노트

### Tailwind CSS v4 다크모드 설정

```css
@import "tailwindcss";

/* Tailwind v4 다크모드 설정 */
@custom-variant dark (&:where(.dark, .dark *));
```

### Next.js 15 Route Handler params

```typescript
// Next.js 15에서 params는 Promise로 변경됨
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

### 쿠키 기반 인증

```typescript
// 서버 컴포넌트/Route Handler에서 쿠키 접근
import { cookies } from "next/headers";

const cookieStore = await cookies();
const accessToken = cookieStore.get("access_token")?.value;
```