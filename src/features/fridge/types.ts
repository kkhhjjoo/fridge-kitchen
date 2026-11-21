/**
 * 냉장고(식재료) 도메인 타입
 * DB 설계(docs/PLANNING.md 5장)의 ingredients 테이블과 1:1로 맞춰 두면
 * 나중에 Supabase로 교체할 때 변경 범위가 작아집니다.
 */

// `as const`로 선언하면 배열 값 자체가 타입이 됩니다 → 아래 IngredientCategory 유니온 생성
export const INGREDIENT_CATEGORIES = [
  'vegetable',
  'fruit',
  'meat',
  'seafood',
  'dairy',
  'grain',
  'sauce',
  'etc',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const STORAGE_TYPES = ['fridge', 'freezer', 'room'] as const

export type StorageType = (typeof STORAGE_TYPES)[number]

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  storage: StorageType
  /** 'YYYY-MM-DD'. 유통기한이 없는 재료(소금 등)는 null */
  expiresAt: string | null
  createdAt: string
}

/**
 * 등록·수정할 때 보내는 데이터
 * id와 createdAt은 서버(지금은 목 API)가 만들어 주므로 Omit으로 뺍니다.
 */
export type IngredientInput = Omit<Ingredient, 'id' | 'createdAt'>

/** 유통기한 상태: 지남 / 임박 / 여유 / 기한 없음 */
export type ExpiryStatus = 'expired' | 'soon' | 'fresh' | 'none'
