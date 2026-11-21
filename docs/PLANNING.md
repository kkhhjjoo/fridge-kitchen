# 냉털키친 (Fridge Kitchen) — 기획 문서

> 1~5단계(기획 · 기능 명세 · 화면/흐름 · 컴포넌트 · DB) 결과물입니다.
> 구현이 진행되면서 이 문서도 함께 갱신합니다.

---

## 1. 프로젝트 전체 기획

### 1-1. 한 줄 정의
"냉장고에 있는 재료를 등록하면, 버리기 전에 먹을 수 있는 요리를 AI가 추천해 주는 서비스"

### 1-2. 문제와 해결
| 사용자 문제 | 냉털키친의 해결 방식 |
| --- | --- |
| 냉장고에 뭐가 있는지 기억이 안 난다 | 카테고리·보관 위치별 식재료 목록 |
| 유통기한을 놓쳐 버리게 된다 | D-day 배지, 임박 재료 우선 노출 |
| 있는 재료로 뭘 만들지 모르겠다 | 보유 재료 일치율 기반 레시피 추천 + AI 맞춤 추천 |
| 장 볼 때 빠뜨린다 | 부족한 재료를 장보기 목록에 자동 추가 |
| 요리 후 재고 관리가 귀찮다 | "요리 완료" 시 사용한 재료 수량 자동 차감 |

### 1-3. 타깃 사용자
- **1~2인 가구 직장인**: 장을 몰아서 보고, 재료를 자주 버리는 사람
- **요리 초보**: 재료는 있는데 조합 아이디어가 없는 사람
- **가계 절약형 사용자**: 장보기 비용과 음식물 쓰레기를 줄이고 싶은 사람

### 1-4. 핵심 지표(서비스가 잘 되고 있는지 판단하는 기준)
- 주간 등록 식재료 수 / 사용자
- 추천 레시피 → "요리 완료" 전환율
- 유통기한 경과로 삭제된 재료 비율(낮을수록 좋음)

### 1-5. 개발 로드맵
| 단계 | 내용 | 상태 |
| --- | --- | --- |
| M1 | 프로젝트 설정, 공통 레이아웃, 홈 화면 (목 데이터) | ✅ 완료 |
| M2 | 내 냉장고: 식재료 CRUD UI (Zustand + RHF + Zod, 목 API) | ✅ 완료 |
| M3 | 레시피 추천 목록 / 상세 / 즐겨찾기 UI | ✅ 완료 |
| M4 | 장보기 목록, 요리 완료 시 재료 차감 | ✅ 완료 |
| M5 | Supabase 연동 (Auth, DB, RLS) | 🟡 코드 완료 · DB 적용 대기 |
| M6 | AI API 연동 (Supabase Edge Function 경유) | |
| M7 | 접근성 점검, 성능 최적화, 배포 | |

---

## 2. 페이지별 기능 명세

### 홈 `/`
- 인사말 + 핵심 CTA 2개: "재료 등록하기", "AI 추천 받기"
- 냉장고 요약 통계: 전체 재료 수, 유통기한 임박(3일 이내) 수, 장보기 항목 수
- 유통기한 임박 재료 카드 목록 (D-day 오름차순, 최대 6개)
- "지금 만들 수 있는 레시피": 보유 재료 일치율 높은 순 4개
- 음식물 낭비 줄이기 팁 배너

### 내 냉장고 `/fridge`
- 식재료 목록: 카테고리 탭 필터, 검색, 정렬(유통기한순/이름순/최근 등록순)
- 보관 위치 구분: 냉장 / 냉동 / 실온
- 식재료 등록·수정: 모달(모바일은 바텀시트) 폼
  - 이름(필수), 카테고리(필수), 수량(> 0), 단위, 보관 위치, 유통기한(선택)
- 삭제: 확인 창 없이 즉시 삭제 + "실행 취소" 토스트 (Gmail 방식 — 실수는 되돌릴 수 있으니 매번 묻는 번거로움을 없앰)
- 유통기한 상태 표시: 지남(빨강) / 3일 이내(주황) / 여유(초록)

### AI 레시피 추천 `/recipes`
- 추천 기준 선택: "임박 재료 우선", "조리 시간 30분 이내", "난이도"
- 추천 결과 카드: 사진, 제목, 조리 시간, 난이도, 일치율, 부족 재료 수
- AI 추천 버튼(M6에서 실제 연동, 그 전엔 규칙 기반 추천)
- 로딩 스켈레톤 / 결과 없음 안내

### 레시피 상세 `/recipes/:recipeId`
- 대표 이미지, 설명, 조리 시간·난이도·인분
- 재료 목록: "보유 중" / "부족" 구분 표시
- "부족한 재료 장보기에 추가" 버튼
- 조리 순서 단계별 표시
- 즐겨찾기 토글
- "요리 완료" → 사용 재료 수량 차감 확인 화면

### 장보기 목록 `/shopping`
- 항목 추가(직접 입력) / 레시피에서 자동 추가된 항목(출처 레시피 표시)
- 체크(구매 완료) → 체크된 항목을 "냉장고에 넣기"로 일괄 등록
- 완료 항목 일괄 삭제

### 마이페이지 `/mypage`
- 프로필(닉네임, 이메일)
- 즐겨찾기 레시피 목록
- 요리 기록(완료한 요리 히스토리), 절약 통계
- 설정: 임박 알림 기준일(기본 3일), 로그아웃

### 인증 `/login`, `/signup` (M5)
- 이메일/비밀번호 로그인, 회원가입 (Zod 검증)
- 비로그인 사용자가 보호된 페이지 접근 시 `/login`으로 이동

---

## 3. 화면 구성 및 사용자 흐름

### 3-1. 공통 레이아웃
```
[데스크톱 ≥ 768px]                     [모바일 < 768px]
┌───────────────────────────────┐     ┌──────────────────┐
│ 로고   홈 냉장고 추천 장보기  마이 │     │ 로고        (마이) │
├───────────────────────────────┤     ├──────────────────┤
│                               │     │                  │
│        페이지 콘텐츠 (Outlet)    │     │   페이지 콘텐츠     │
│        max-width 1200px       │     │                  │
├───────────────────────────────┤     ├──────────────────┤
│ 푸터                           │     │ 🏠 🧊 ✨ 🛒 👤    │ ← 하단 탭바
└───────────────────────────────┘     └──────────────────┘
```
- 모바일은 엄지로 누르기 쉬운 **하단 탭바**, 데스크톱은 **상단 내비게이션**
- 키보드 사용자를 위한 "본문 바로가기" 링크

### 3-2. 핵심 사용자 흐름
```
① 첫 방문
  홈 → 회원가입 → 내 냉장고(빈 상태) → "첫 재료 등록하기" → 재료 등록

② 매일 사용 (핵심 루프)
  홈 → 임박 재료 확인 → AI 추천 → 레시피 상세
     → (부족 재료 있음) 장보기에 추가
     → (요리함) 요리 완료 → 재료 자동 차감 → 홈 통계 갱신

③ 장보기
  장보기 목록 → 구매 체크 → "냉장고에 넣기" → 내 냉장고에 자동 등록
```

---

## 4. 컴포넌트 · 폴더 구조

**기능(feature) 단위**로 나누고, 여러 기능에서 쓰는 것만 공통 폴더에 둡니다.

```
src/
├─ app/                  # 앱 조립: 라우터, 전역 Provider
│  ├─ App.tsx
│  ├─ providers.tsx      # QueryClientProvider 등
│  └─ router.tsx         # 라우트 정의
├─ api/                  # 서버 통신 로직 (지금은 목 API, 추후 Supabase)
│  ├─ client.ts          # 공통 지연/에러 처리 헬퍼
│  ├─ ingredients.ts
│  ├─ recipes.ts
│  ├─ shopping.ts
│  └─ queryKeys.ts       # TanStack Query 키 모음
├─ components/
│  ├─ layout/            # AppLayout, Header, MobileTabBar, Footer
│  └─ ui/                # Button, Badge, Card, SectionHeader, Skeleton, EmptyState
├─ features/             # 기능별 타입·훅·컴포넌트·유틸
│  ├─ fridge/            # Ingredient 타입, 유통기한 유틸, 재료 카드
│  ├─ recipes/           # Recipe 타입, 일치율 계산, 레시피 카드
│  └─ shopping/
├─ mocks/                # 목 데이터 (Supabase 연결 전까지 사용)
├─ pages/                # 라우트와 1:1 대응하는 페이지 컴포넌트
├─ lib/                  # cn(), 날짜 유틸 등 범용 함수
└─ stores/               # Zustand 스토어 (클라이언트 상태)
```

### 상태 관리 원칙
| 종류 | 도구 | 예시 |
| --- | --- | --- |
| 서버 상태 (DB에 있는 데이터) | TanStack Query | 식재료 목록, 레시피, 장보기 |
| 전역 클라이언트 상태 | Zustand | 로그인 세션, 필터 설정, 모달 열림 |
| 폼 상태 | React Hook Form + Zod | 재료 등록 폼, 로그인 폼 |
| 지역 상태 | useState | 드롭다운 열림 등 |

### 페이지 ↔ 컴포넌트 매핑
| 페이지 | 주요 컴포넌트 |
| --- | --- |
| 홈 | HeroSection, FridgeSummary(StatCard), ExpiringIngredientCard, RecipeCard, TipBanner |
| 내 냉장고 | CategoryTabs, IngredientList, IngredientCard, IngredientFormDialog |
| AI 추천 | RecommendFilter, RecipeCard, RecipeCardSkeleton |
| 레시피 상세 | RecipeHero, IngredientChecklist, StepList, FavoriteButton |
| 장보기 | ShoppingItemRow, AddShoppingItemForm |
| 마이페이지 | ProfileCard, FavoriteRecipeList, CookingHistory |

---

## 5. 데이터베이스 구조 제안 (Supabase / PostgreSQL)

```
auth.users (Supabase 기본)
   │ 1
   │
   ├──1 profiles
   ├──N ingredients
   ├──N shopping_items ──N:1 recipes (선택)
   ├──N favorites ───────N:1 recipes
   └──N cooking_logs ────N:1 recipes

recipes 1──N recipe_ingredients
recipes 1──N recipe_steps
```

| 테이블 | 주요 컬럼 | 설명 |
| --- | --- | --- |
| `profiles` | id(uuid, = auth.users.id), nickname, expiry_alert_days(int, 기본 3), created_at | 사용자 프로필/설정 |
| `ingredients` | id, user_id, name, category(enum), quantity(numeric), unit, storage(enum: fridge/freezer/room), expires_at(date, null 가능), created_at, updated_at | 냉장고 식재료 |
| `recipes` | id, title, description, image_url, cooking_time_minutes, difficulty(enum), servings, source(enum: curated/ai), created_by(null 가능), created_at | 레시피 (AI 생성 결과도 저장) |
| `recipe_ingredients` | id, recipe_id, name, quantity, unit, is_optional | 레시피 재료 |
| `recipe_steps` | id, recipe_id, step_order, description, timer_minutes(null 가능) | 조리 순서 |
| `favorites` | user_id, recipe_id, created_at (PK: user_id+recipe_id) | 즐겨찾기 |
| `shopping_items` | id, user_id, name, quantity, unit, is_checked, recipe_id(null 가능), created_at | 장보기 |
| `cooking_logs` | id, user_id, recipe_id, cooked_at, used_ingredients(jsonb) | 요리 완료 기록 |

**enum 정의**
- `ingredient_category`: vegetable, fruit, meat, seafood, dairy, grain, sauce, etc
- `storage_type`: fridge, freezer, room
- `difficulty`: easy, medium, hard

**보안(RLS)**: `ingredients`, `shopping_items`, `favorites`, `cooking_logs`는
`user_id = auth.uid()`인 행만 읽기/쓰기 허용. `recipes`는 모두 읽기 가능.

**재료 매칭 참고**: 이름 문자열 비교는 "대파/파" 같은 표기 차이에 약합니다.
M6 단계에서 `ingredient_aliases`(동의어 테이블) 또는 AI 정규화를 도입할 예정입니다.
