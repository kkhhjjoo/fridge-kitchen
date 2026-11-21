import type { Difficulty, RecipeRecommendation } from '../types'

export interface RecipeFilter {
  prioritizeExpiring: boolean
  quickOnly: boolean
  difficulty: Difficulty | 'all'
  favoritesOnly: boolean
}

export const DEFAULT_RECIPE_FILTER: RecipeFilter = {
  prioritizeExpiring: true,
  quickOnly: false,
  difficulty: 'all',
  favoritesOnly: false,
}

/** "빠른 요리" 기준 (분) */
export const QUICK_COOKING_MINUTES = 30

/** 재료가 이 개수 이하로 부족하면 "조금 부족" 그룹 */
export const ALMOST_MISSING_LIMIT = 2

export function filterRecommendations(
  items: RecipeRecommendation[],
  filter: RecipeFilter,
  favoriteIds: ReadonlySet<string>,
): RecipeRecommendation[] {
  return items.filter(({ recipe }) => {
    if (filter.quickOnly && recipe.cookingTimeMinutes > QUICK_COOKING_MINUTES) return false
    if (filter.difficulty !== 'all' && recipe.difficulty !== filter.difficulty) return false
    if (filter.favoritesOnly && !favoriteIds.has(recipe.id)) return false
    return true
  })
}

export interface RecommendationGroups {
  /** 부족한 재료 0개 */
  ready: RecipeRecommendation[]
  /** 부족한 재료 1~2개 — 조금만 사면 만들 수 있음 */
  almost: RecipeRecommendation[]
  /** 부족한 재료 3개 이상 */
  more: RecipeRecommendation[]
}

/** 부족한 재료 개수에 따라 3개 그룹으로 나누기 (정렬 순서는 그대로 유지) */
export function groupRecommendations(items: RecipeRecommendation[]): RecommendationGroups {
  const groups: RecommendationGroups = { ready: [], almost: [], more: [] }
  for (const item of items) {
    const missing = item.missingIngredients.length
    if (missing === 0) groups.ready.push(item)
    else if (missing <= ALMOST_MISSING_LIMIT) groups.almost.push(item)
    else groups.more.push(item)
  }
  return groups
}
