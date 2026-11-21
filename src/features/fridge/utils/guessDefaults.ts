import { daysFromToday } from '@/lib/date'
import type { IngredientCategory, IngredientInput, StorageType } from '../types'

/**
 * 재료 이름으로 카테고리 추측하기 (장보기 → 냉장고에 넣을 때 기본값용)
 *
 * 완벽할 필요는 없어요. 사용자가 화면에서 바꿀 수 있으니 "대부분 맞는 기본값"이면 충분합니다.
 * M6에서는 이 역할을 AI가 더 정확하게 대신할 수 있어요.
 * 위에서부터 순서대로 검사하므로 순서가 중요합니다.
 *  - '굴소스'는 해산물(굴)보다 양념이 먼저 검사되어야 하고
 *  - '배추'는 과일(배)보다 채소가 먼저 검사되어야 해요.
 */
const KEYWORDS: [IngredientCategory, string[]][] = [
  ['sauce', ['간장', '고추장', '된장', '식초', '소금', '설탕', '오일', '올리브유', '참기름', '들기름', '케첩', '마요네즈', '소스', '드레싱', '후추', '맛술']],
  ['seafood', ['새우', '오징어', '연어', '고등어', '참치', '조개', '홍합', '굴', '문어', '멸치', '게살', '꽃게', '생선', '어묵']],
  ['meat', ['소고기', '돼지고기', '닭', '삼겹살', '목살', '차돌', '베이컨', '햄', '소시지', '고기', '스팸']],
  ['dairy', ['우유', '계란', '달걀', '치즈', '버터', '요거트', '요구르트', '생크림']],
  ['grain', ['파스타', '스파게티', '면', '쌀', '밥', '식빵', '빵', '떡', '국수', '라면', '밀가루', '오트밀', '시리얼']],
  ['vegetable', ['대파', '쪽파', '양파', '부추', '마늘', '감자', '고구마', '당근', '호박', '오이', '토마토', '상추', '양상추', '배추', '양배추', '버섯', '시금치', '브로콜리', '고추', '피망', '파프리카', '깻잎', '바질', '콩나물', '숙주', '무', '가지', '샐러드']],
  ['fruit', ['사과', '바나나', '딸기', '블루베리', '포도', '귤', '오렌지', '레몬', '키위', '복숭아', '수박', '배', '망고', '아보카도']],
]

export function guessCategory(name: string): IngredientCategory {
  const normalized = name.replace(/\s+/g, '')
  for (const [category, words] of KEYWORDS) {
    if (words.some((word) => normalized.includes(word))) return category
  }
  return 'etc'
}

/** 카테고리별 기본 보관 위치 */
export const DEFAULT_STORAGE: Record<IngredientCategory, StorageType> = {
  vegetable: 'fridge',
  fruit: 'fridge',
  meat: 'fridge',
  seafood: 'freezer',
  dairy: 'fridge',
  grain: 'room',
  sauce: 'room',
  etc: 'fridge',
}

/**
 * 카테고리별 대략적인 보관 가능 일수 (null = 기한 없음)
 * 일반적인 냉장 보관 기준의 보수적인 값이에요. 사용자가 화면에서 바꿀 수 있습니다.
 */
export const DEFAULT_SHELF_LIFE_DAYS: Record<IngredientCategory, number | null> = {
  vegetable: 7,
  fruit: 7,
  meat: 3,
  seafood: 30, // 냉동 기준
  dairy: 10,
  grain: 30,
  sauce: null,
  etc: 7,
}

/** 이름만으로 만든 재료 기본값 (화면 미리보기에도 쓰려고 보관 일수를 함께 돌려줌) */
export interface GuessedIngredient {
  category: IngredientCategory
  storage: StorageType
  /** null = 기한 없음 */
  shelfLifeDays: number | null
}

export function guessIngredientDefaults(name: string): GuessedIngredient {
  const category = guessCategory(name)
  return {
    category,
    storage: DEFAULT_STORAGE[category],
    shelfLifeDays: DEFAULT_SHELF_LIFE_DAYS[category],
  }
}

/**
 * 재료 이름 + 공통 수량·단위 → 등록할 재료 1개
 * 쉼표로 여러 재료를 한 번에 등록할 때, 카테고리·보관 위치·유통기한을 재료마다 자동으로 채웁니다.
 */
export function buildGuessedIngredientInput(
  name: string,
  common: { quantity: number; unit: string },
  today?: Date,
): IngredientInput {
  const { category, storage, shelfLifeDays } = guessIngredientDefaults(name)
  return {
    name,
    category,
    quantity: common.quantity,
    unit: common.unit,
    storage,
    expiresAt: shelfLifeDays === null ? null : daysFromToday(shelfLifeDays, today),
  }
}
