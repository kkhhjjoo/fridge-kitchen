# 냉털키친 (Fridge Kitchen)

냉장고 속 재료를 등록하면, 버리기 전에 만들 수 있는 요리를 추천해 주는 서비스입니다.

- 기획·기능 명세·DB 설계: [docs/PLANNING.md](docs/PLANNING.md)
- 기술 스택: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Zustand, React Hook Form, Zod, Supabase

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 타입 검사 + 프로덕션 빌드
npm run lint
```

## 두 가지 실행 모드

| 모드 | 조건 | 데이터 저장 위치 |
| --- | --- | --- |
| **데모 모드** | `.env.local`이 없음 | 브라우저 localStorage (로그인 없음, 상단에 "데모 모드" 띠 표시) |
| **Supabase 모드** | `.env.local`에 URL·키 설정 | Supabase DB (회원가입·로그인 필요) |

전환 로직은 [src/lib/supabase.ts](src/lib/supabase.ts)와 `src/api/*.ts`에 있습니다.
화면 코드는 [src/api/contracts.ts](src/api/contracts.ts)의 인터페이스만 사용하므로 어느 모드든 그대로 동작해요.

## Supabase 연결하기

### 1. 환경 변수
`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co     # 뒤에 /rest/v1 붙이지 않기
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...          # 또는 anon public key
```

> ⚠️ `service_role` / secret 키는 절대 넣지 마세요. `.env.example`에는 실제 값을 적지 않습니다(공유용 템플릿).

### 2. DB 테이블 만들기
Supabase 대시보드 → **SQL Editor** → New query 에 아래 파일 내용을 **순서대로** 붙여 넣고 Run.

1. [supabase/migrations/20261120090000_init.sql](supabase/migrations/20261120090000_init.sql) — 테이블, RLS 보안 정책, DB 함수
2. [supabase/migrations/20261120090100_seed_recipes.sql](supabase/migrations/20261120090100_seed_recipes.sql) — 기본 레시피 6개
3. [supabase/migrations/20261120100000_grants.sql](supabase/migrations/20261120100000_grants.sql) — API 역할 권한(GRANT). 빠뜨리면 모든 요청이 `403 permission denied`

### 3. 인증 설정
대시보드 → **Authentication → URL Configuration**
- Site URL: `http://localhost:5173` (배포 후에는 실제 도메인)

개발 중 메일 인증이 번거로우면 **Authentication → Sign In / Providers → Email → Confirm email** 을 끌 수 있어요. (배포 전에는 다시 켜기)

### 4. 개발 서버 재시작
환경 변수는 서버 시작 시에만 읽으므로 `npm run dev`를 다시 실행합니다.

## 폴더 구조

```
src/
├─ app/          라우터, 전역 Provider
├─ api/          contracts.ts(계약) + mock/(데모) + supabase/(실서버) + 모드 선택 파일
├─ components/   layout/(헤더·탭바 등), ui/(버튼·다이얼로그 등 공용)
├─ features/     auth, fridge, recipes, shopping — 기능별 타입·훅·컴포넌트·유틸
├─ pages/        라우트별 페이지
├─ lib/          범용 유틸 (cn, 날짜, 한국어 조사, supabase 클라이언트)
└─ mocks/        데모 모드 기본 데이터
supabase/migrations/   DB 스키마 SQL
```
