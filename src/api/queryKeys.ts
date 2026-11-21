/**
 * TanStack Query 키를 한곳에서 관리합니다.
 * 키는 캐시의 '주소'라서, 오타가 나면 캐시가 따로 생기거나 갱신(invalidate)이 안 됩니다.
 * 함수로 만들어 두면 자동완성 + 타입 검사를 받을 수 있어요.
 */
export const queryKeys = {
  ingredients: {
    all: ['ingredients'] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    detail: (recipeId: string) => ['recipes', recipeId] as const,
  },
  shopping: {
    all: ['shopping'] as const,
  },
  favorites: {
    all: ['favorites'] as const,
  },
  profile: {
    all: ['profile'] as const,
  },
  cookingLogs: {
    all: ['cookingLogs'] as const,
  },
}
