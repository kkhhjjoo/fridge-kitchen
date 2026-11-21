import type { Difficulty, RecipeIngredient } from './types'

/** 고를 수 있는 요리 종류 ('any' = 상관없음 → 여러 나라 요리를 섞어서) */
export const AI_CUISINES = ['any', 'korean', 'western', 'chinese', 'japanese', 'snack'] as const
export type AiCuisine = (typeof AI_CUISINES)[number]

export const AI_CUISINE_LABEL: Record<AiCuisine, string> = {
  any: '상관없음',
  korean: '한식',
  western: '양식',
  chinese: '중식',
  japanese: '일식',
  snack: '분식',
}

/** AI 셰프에게 보내는 요청 */
export interface AiChefRequest {
  /** "15분 안에 끝나는 저녁"처럼 사용자가 적은 취향·상황 (비워도 됨) */
  wish: string
  servings: number
  cuisine: AiCuisine
  /** 이번에 이미 추천받은 요리 이름 → 다시 누르면 겹치지 않게 */
  avoidTitles: string[]
}

/** 기억해 둘 "이미 추천한 요리" 최대 개수 (요청문이 너무 길어지지 않도록) */
export const AI_CHEF_AVOID_MAX = 30

/** AI 셰프가 만든 레시피 (DB에 저장되지 않는 일회성 레시피라 id·사진이 없음) */
export interface AiRecipe {
  title: string
  description: string
  cookingTimeMinutes: number
  difficulty: Difficulty
  servings: number
  ingredients: RecipeIngredient[]
  steps: string[]
  /** 요리 팁 한 줄 (유통기한 지난 재료 주의 등) */
  tip: string
}

/** 요청 글자 수 제한 (서버 함수와 같게) */
export const AI_CHEF_WISH_MAX = 300
