import { z } from 'zod'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES } from '@/features/fridge/types'

/** 공통 규칙: 수량 (input type="number" + valueAsNumber → 빈 칸이면 NaN) */
const quantitySchema = z
  .number({ error: '수량을 숫자로 입력해 주세요.' })
  .positive('0보다 커야 해요.')
  .max(99999, '수량이 너무 커요.')

/** 장보기 항목 직접 추가 폼 */
export const addShoppingItemSchema = z.object({
  name: z.string().trim().min(1, '살 재료를 입력해 주세요.').max(30, '30자 이내로 입력해 주세요.'),
  quantity: quantitySchema,
  unit: z.string().trim().min(1, '단위를 입력해 주세요.').max(10, '10자 이내'),
})

export type AddShoppingItemValues = z.infer<typeof addShoppingItemSchema>

/** 유통기한 선택지: '' = 기한 없음, 나머지는 "오늘부터 n일" */
export const SHELF_LIFE_OPTIONS = [
  { value: '', label: '기한 없음' },
  { value: '3', label: '3일' },
  { value: '7', label: '1주' },
  { value: '10', label: '10일' },
  { value: '14', label: '2주' },
  { value: '30', label: '1달' },
] as const

/**
 * "냉장고에 넣기" 폼 — 장 본 항목마다 카테고리·보관 위치·유통기한을 확인
 * items 배열의 각 줄은 React Hook Form의 useFieldArray로 관리합니다.
 */
export const stockFormSchema = z.object({
  items: z
    .array(
      z.object({
        shoppingItemId: z.string(),
        name: z.string().trim().min(1, '이름을 입력해 주세요.'),
        quantity: quantitySchema,
        unit: z.string().trim().min(1, '단위를 입력해 주세요.'),
        category: z.enum(INGREDIENT_CATEGORIES),
        storage: z.enum(STORAGE_TYPES),
        shelfLife: z.enum(['', '3', '7', '10', '14', '30']),
      }),
    )
    .min(1),
})

export type StockFormValues = z.infer<typeof stockFormSchema>
export type ShelfLife = StockFormValues['items'][number]['shelfLife']
