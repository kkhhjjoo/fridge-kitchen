import type { FridgeFilter, IngredientSort } from '../stores/useFridgeFilterStore'
import type { Ingredient } from '../types'

const compareByName = (a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name, 'ko')

/** 정렬 방식별 비교 함수 — Record로 두면 정렬 종류를 추가할 때 빠뜨릴 수 없어요 */
const comparators: Record<IngredientSort, (a: Ingredient, b: Ingredient) => number> = {
  // 유통기한 가까운 순, 기한 없는 재료는 맨 뒤
  expiry: (a, b) => {
    if (a.expiresAt === b.expiresAt) return compareByName(a, b)
    if (a.expiresAt === null) return 1
    if (b.expiresAt === null) return -1
    return a.expiresAt.localeCompare(b.expiresAt)
  },
  name: compareByName,
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
}

/**
 * 필터 + 정렬을 적용한 새 배열을 반환합니다. (원본 배열은 건드리지 않음)
 * 순수 함수라서 화면 없이도 테스트하기 쉽습니다.
 */
export function filterIngredients(ingredients: Ingredient[], filter: FridgeFilter): Ingredient[] {
  const keyword = filter.search.trim().toLowerCase()

  return ingredients
    .filter((item) => filter.category === 'all' || item.category === filter.category)
    .filter((item) => filter.storage === 'all' || item.storage === filter.storage)
    .filter((item) => keyword === '' || item.name.toLowerCase().includes(keyword))
    .sort(comparators[filter.sort])
}
