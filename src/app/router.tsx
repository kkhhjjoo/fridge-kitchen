import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageLoader } from '@/components/layout/PageLoader'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

/**
 * 라우트 정의
 * - 부모 라우트(AppLayout) 아래 children으로 두면, 모든 페이지가 같은 헤더/탭바를 공유합니다.
 * - index: true → 부모 경로('/') 그대로일 때 보여줄 페이지
 * - path: '*' → 위에서 매칭되지 않은 모든 주소 (404)
 *
 * ── 코드 분할(Lazy Loading) ──
 * lazy: () => import(...) 로 적은 페이지는 빌드 시 별도 JS 파일로 쪼개지고,
 * 사용자가 그 페이지에 처음 들어갈 때 다운로드됩니다.
 * → 첫 화면에서 받는 JS 크기가 줄어 앱이 더 빨리 뜹니다.
 *
 * 홈은 가장 많이 들어오는 첫 화면이라 lazy 없이 바로 포함(eager)했어요.
 * 폼 라이브러리(React Hook Form, Zod)는 냉장고 페이지에서만 쓰여서 그 페이지 파일로 함께 분리됩니다.
 */
export const router = createBrowserRouter([
  // ── 로그인 없이 보는 화면 (헤더·탭바 없는 별도 레이아웃) ──
  {
    path: '/login',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: () => import('@/pages/auth/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: '/signup',
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: () => import('@/pages/auth/SignupPage').then((m) => ({ Component: m.SignupPage })),
  },
  // ── 로그인해야 보는 화면: RequireAuth가 AppLayout 전체를 감싸서 한 번에 보호 ──
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    // 주소로 바로 들어왔을 때(첫 로딩) lazy 페이지를 받는 동안 보여줄 화면
    HydrateFallback: PageLoader,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'fridge',
        // import()는 Promise를 반환 → 모듈을 받은 뒤 { Component }로 라우트에 연결
        lazy: () => import('@/pages/fridge/FridgePage').then((m) => ({ Component: m.FridgePage })),
      },
      {
        path: 'recipes',
        lazy: () =>
          import('@/pages/recipes/RecipesPage').then((m) => ({ Component: m.RecipesPage })),
      },
      {
        path: 'recipes/:recipeId',
        lazy: () =>
          import('@/pages/recipes/RecipeDetailPage').then((m) => ({
            Component: m.RecipeDetailPage,
          })),
      },
      {
        path: 'shopping',
        lazy: () =>
          import('@/pages/shopping/ShoppingListPage').then((m) => ({ Component: m.ShoppingListPage })),
      },
      {
        path: 'mypage',
        lazy: () => import('@/pages/mypage/MyPage').then((m) => ({ Component: m.MyPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
