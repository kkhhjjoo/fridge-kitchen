import type { Ingredient } from '@/features/fridge/types'
import type { ShoppingItem } from '@/features/shopping/types'
import { mockIngredients } from '@/mocks/ingredients'
import { mockShoppingItems } from '@/mocks/shopping'
import { createMockTable } from './mockTable'

/**
 * 데모 모드의 "가짜 DB" — 테이블들을 한곳에 모아 둡니다.
 * (냉장고에 넣기처럼 여러 테이블을 함께 바꾸는 작업에서 서로 접근해야 하기 때문)
 */
export const ingredientsTable = createMockTable<Ingredient>(
  'fridge-kitchen:ingredients:v1',
  mockIngredients,
)

export const shoppingTable = createMockTable<ShoppingItem>(
  'fridge-kitchen:shopping:v1',
  mockShoppingItems,
)

/** 즐겨찾기: id = 레시피 id */
export const favoritesTable = createMockTable<{ id: string }>('fridge-kitchen:favorites:v2', [])

export interface MockCookingLog {
  id: string
  recipeId: string
  cookedAt: string
  /** 마이페이지 통계용. 이 칸이 생기기 전에 저장된 기록에는 없을 수 있음 */
  usedIngredientCount?: number
}

export const cookingLogsTable = createMockTable<MockCookingLog>('fridge-kitchen:cooking-logs:v1', [])

/** 데모 사용자의 프로필 (행이 딱 하나: id = 'demo') */
export const profileTable = createMockTable<{ id: string; nickname: string; expiryAlertDays: number }>(
  'fridge-kitchen:profile:v1',
  [{ id: 'demo', nickname: '데모 사용자', expiryAlertDays: 3 }],
)

/** 소수점 계산 오차 정리: 0.1 + 0.2 = 0.30000000000000004 → 0.3 */
export const roundQuantity = (value: number) => Math.round(value * 100) / 100
