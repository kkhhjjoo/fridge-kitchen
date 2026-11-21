import type { Ingredient } from '@/features/fridge/types'

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  imageUrl: string
  cookingTimeMinutes: number
  difficulty: Difficulty
  servings: number
  ingredients: RecipeIngredient[]
  steps: string[]
  tags: string[]
}

/** 내 냉장고에 있는 레시피 재료 = 레시피 재료 정보 + 짝이 되는 냉장고 재료 */
export interface OwnedRecipeIngredient extends RecipeIngredient {
  owned: Ingredient
}

/**
 * 추천 결과 = 레시피 + "내 냉장고 기준" 분석 정보
 * 레시피 자체(Recipe)와 사용자별 계산 결과를 분리해 두면
 * 같은 레시피를 사용자마다 다르게 보여주기 쉽습니다.
 */
export interface RecipeRecommendation {
  recipe: Recipe
  availableIngredients: OwnedRecipeIngredient[]
  missingIngredients: RecipeIngredient[]
  /** 보유 재료 중 유통기한이 임박했거나 지난 재료 수 (= 이 요리로 구출할 수 있는 재료) */
  expiringCount: number
  /** 0~100. 보유 재료 비율 */
  matchRate: number
}
