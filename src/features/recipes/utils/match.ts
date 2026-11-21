import type { Ingredient } from '@/features/fridge/types'
import { getExpiryStatus } from '@/features/fridge/utils/expiry'
import type {
  OwnedRecipeIngredient,
  Recipe,
  RecipeIngredient,
  RecipeRecommendation,
} from '../types'

/** 이름 비교용 정규화: 공백 제거 + 소문자 */
const normalize = (name: string): string => name.replace(/\s+/g, '').toLowerCase()

const isExpiringSoon = (ingredient: Ingredient, soonDays?: number): boolean => {
  const status = getExpiryStatus(ingredient.expiresAt, soonDays)
  return status === 'soon' || status === 'expired'
}

/**
 * 레시피 1개를 내 냉장고와 비교해 보유/부족 재료와 일치율을 계산합니다.
 * (규칙 기반 추천. M6에서 AI 추천이 이 자리를 보완합니다.)
 * soonDays: 임박 기준일 (마이페이지 설정값). 안 넘기면 기본값 3일
 */
export function matchRecipe(recipe: Recipe, fridge: Ingredient[], soonDays?: number): RecipeRecommendation {
  // 이름 → 냉장고 재료 Map: 레시피 재료마다 get()으로 O(1) 조회
  const fridgeByName = new Map<string, Ingredient>()
  for (const item of fridge) {
    if (item.quantity > 0) fridgeByName.set(normalize(item.name), item)
  }

  const availableIngredients: OwnedRecipeIngredient[] = []
  const missingIngredients: RecipeIngredient[] = []

  for (const ingredient of recipe.ingredients) {
    const owned = fridgeByName.get(normalize(ingredient.name))
    if (owned) availableIngredients.push({ ...ingredient, owned })
    else missingIngredients.push(ingredient)
  }

  const total = recipe.ingredients.length

  return {
    recipe,
    availableIngredients,
    missingIngredients,
    expiringCount: availableIngredients.filter((item) => isExpiringSoon(item.owned, soonDays)).length,
    matchRate: total === 0 ? 0 : Math.round((availableIngredients.length / total) * 100),
  }
}

export interface RankOptions {
  /** true면 임박 재료를 많이 쓰는 레시피를 우선 */
  prioritizeExpiring?: boolean
  /** 임박 기준일 (마이페이지 설정값) */
  soonDays?: number
}

/**
 * 여러 레시피를 정렬해 추천 목록으로 만듭니다.
 * 기본: 일치율 높은 순 → 조리 시간 짧은 순
 * prioritizeExpiring: 임박 재료 활용 개수를 맨 앞 기준으로 추가
 */
export function rankRecipes(
  recipes: Recipe[],
  fridge: Ingredient[],
  { prioritizeExpiring = false, soonDays }: RankOptions = {},
): RecipeRecommendation[] {
  return recipes
    .map((recipe) => matchRecipe(recipe, fridge, soonDays))
    .sort(
      (a, b) =>
        // || 연결: 앞의 비교가 0(동점)일 때만 다음 기준으로 비교
        (prioritizeExpiring ? b.expiringCount - a.expiringCount : 0) ||
        b.matchRate - a.matchRate ||
        a.recipe.cookingTimeMinutes - b.recipe.cookingTimeMinutes,
    )
}
