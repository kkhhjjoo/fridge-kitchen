import type { Ingredient } from '@/features/fridge/types'
import { daysFromToday } from '@/lib/date'

/**
 * 목(mock) 식재료 데이터
 * 유통기한을 '오늘 기준 n일 후'로 만들어서, 언제 실행해도 임박 재료가 보이도록 했습니다.
 * Supabase 연결(M5) 후에는 이 파일 대신 DB 데이터를 사용합니다.
 */
const created = daysFromToday(-3)

export const mockIngredients: Ingredient[] = [
  { id: 'ing-1', name: '닭가슴살', category: 'meat', quantity: 2, unit: '팩', storage: 'fridge', expiresAt: daysFromToday(0), createdAt: created },
  { id: 'ing-2', name: '방울토마토', category: 'vegetable', quantity: 1, unit: '팩', storage: 'fridge', expiresAt: daysFromToday(1), createdAt: created },
  { id: 'ing-3', name: '우유', category: 'dairy', quantity: 1, unit: 'L', storage: 'fridge', expiresAt: daysFromToday(2), createdAt: created },
  { id: 'ing-4', name: '바나나', category: 'fruit', quantity: 3, unit: '개', storage: 'room', expiresAt: daysFromToday(2), createdAt: created },
  { id: 'ing-5', name: '양상추', category: 'vegetable', quantity: 1, unit: '통', storage: 'fridge', expiresAt: daysFromToday(-1), createdAt: created },
  { id: 'ing-6', name: '오이', category: 'vegetable', quantity: 2, unit: '개', storage: 'fridge', expiresAt: daysFromToday(3), createdAt: created },
  { id: 'ing-7', name: '밥', category: 'grain', quantity: 2, unit: '공기', storage: 'fridge', expiresAt: daysFromToday(1), createdAt: created },
  { id: 'ing-8', name: '식빵', category: 'grain', quantity: 6, unit: '장', storage: 'room', expiresAt: daysFromToday(4), createdAt: created },
  { id: 'ing-9', name: '두부', category: 'etc', quantity: 1, unit: '모', storage: 'fridge', expiresAt: daysFromToday(5), createdAt: created },
  { id: 'ing-10', name: '계란', category: 'dairy', quantity: 10, unit: '개', storage: 'fridge', expiresAt: daysFromToday(12), createdAt: created },
  { id: 'ing-11', name: '새우', category: 'seafood', quantity: 300, unit: 'g', storage: 'freezer', expiresAt: daysFromToday(40), createdAt: created },
  { id: 'ing-12', name: '마늘', category: 'vegetable', quantity: 10, unit: '쪽', storage: 'fridge', expiresAt: daysFromToday(14), createdAt: created },
  { id: 'ing-13', name: '양파', category: 'vegetable', quantity: 3, unit: '개', storage: 'room', expiresAt: daysFromToday(20), createdAt: created },
  { id: 'ing-14', name: '간장', category: 'sauce', quantity: 1, unit: '병', storage: 'room', expiresAt: null, createdAt: created },
  { id: 'ing-15', name: '올리브유', category: 'sauce', quantity: 1, unit: '병', storage: 'room', expiresAt: null, createdAt: created },
]
