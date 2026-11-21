import { z } from 'zod'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES, type Ingredient } from './types'

/** 재료 이름 하나의 최대 길이 (DB check 제약과 같게) */
export const INGREDIENT_NAME_MAX = 30

/**
 * 쉼표로 적은 재료 이름을 나누기
 *   '대파, 계란 ,, 대파' → ['대파', '계란']
 * - 쉼표(,)와 전각 쉼표(，)를 모두 구분자로 봅니다. (한글 입력기에서 섞여 들어오는 경우 대비)
 * - 앞뒤 공백을 지우고, 빈 칸은 버리고, 같은 이름은 한 번만 남깁니다.
 */
export function splitIngredientNames(raw: string): string[] {
  const names = raw
    .split(/[,，]/)
    .map((name) => name.trim())
    .filter((name) => name !== '')
  return [...new Set(names)] // Set: 겹치는 값을 자동으로 하나만 남기는 자료구조
}

/**
 * 재료 이름 칸 검증
 * allowMultiple: true면 쉼표로 여러 개 허용(등록), false면 하나만(수정)
 */
function nameSchema(allowMultiple: boolean) {
  return z
    .string()
    .trim()
    .min(1, '재료 이름을 입력해 주세요.')
    .superRefine((value, ctx) => {
      const names = splitIngredientNames(value)
      if (names.length === 0) {
        ctx.addIssue({ code: 'custom', message: '재료 이름을 입력해 주세요.' })
        return
      }
      if (!allowMultiple && names.length > 1) {
        ctx.addIssue({ code: 'custom', message: '수정할 때는 재료 하나만 적어 주세요.' })
        return
      }
      const tooLong = names.find((name) => name.length > INGREDIENT_NAME_MAX)
      if (tooLong) {
        const label = names.length > 1 ? `"${tooLong.slice(0, 8)}…"은(는) ` : ''
        ctx.addIssue({ code: 'custom', message: `${label}${INGREDIENT_NAME_MAX}자 이내로 입력해 주세요.` })
      }
    })
}

/**
 * 식재료 등록/수정 폼 검증 규칙 (Zod)
 *
 * Zod 스키마 하나로 두 가지를 얻습니다.
 *  1) 런타임 검증: 사용자가 잘못 입력하면 에러 메시지
 *  2) 타입 자동 생성: z.input / z.output 으로 폼 값 타입을 따로 선언할 필요가 없음
 *
 * 등록과 수정은 이름 칸 규칙만 달라서, 아래 createIngredientFormSchema()로 두 가지를 찍어 냅니다.
 */
const ingredientFormBase = z.object({
  name: nameSchema(false),
  category: z.enum(INGREDIENT_CATEGORIES, { error: '카테고리를 선택해 주세요.' }),
  // <input type="number">를 valueAsNumber로 등록하면 빈 칸은 NaN이 됩니다 → 타입 에러 메시지로 안내
  quantity: z
    .number({ error: '수량을 숫자로 입력해 주세요.' })
    .positive('0보다 큰 수량을 입력해 주세요.')
    .max(99999, '수량이 너무 커요.'),
  unit: z.string().trim().min(1, '단위를 입력해 주세요.').max(10, '10자 이내로 입력해 주세요.'),
  storage: z.enum(STORAGE_TYPES),
  // <input type="date">는 비어 있으면 '' → 저장할 때는 null로 변환(transform)
  expiresAt: z
    .union([z.literal(''), z.iso.date('올바른 날짜를 입력해 주세요.')])
    .transform((value) => (value === '' ? null : value)),
})

/**
 * allowMultiple: true면 이름 칸에 쉼표로 여러 재료를 허용(등록), false면 하나만(수정)
 * extend: 기본 스키마에서 name 칸 규칙만 바꿔 끼운 새 스키마를 만듭니다.
 */
export const createIngredientFormSchema = (allowMultiple: boolean) =>
  ingredientFormBase.extend({ name: nameSchema(allowMultiple) })

/** 폼 입력 중의 값 타입 (expiresAt: string) */
export type IngredientFormValues = z.input<typeof ingredientFormBase>
/**
 * 검증·변환이 끝난 값 타입 (expiresAt: string | null)
 * IngredientInput과 구조가 같아서 그대로 API에 보낼 수 있습니다.
 * (스키마를 바꿔 구조가 달라지면 API 호출부에서 타입 에러가 나서 바로 알 수 있어요)
 * 단, name에는 쉼표로 여러 재료가 들어 있을 수 있어요 → splitIngredientNames()로 나눠 쓰기
 */
export type IngredientFormOutput = z.output<typeof ingredientFormBase>

/** 새 재료 등록 시 기본값 */
export const EMPTY_INGREDIENT_FORM: IngredientFormValues = {
  name: '',
  category: 'vegetable',
  quantity: 1,
  unit: '개',
  storage: 'fridge',
  expiresAt: '',
}

/** 수정할 때: 기존 재료 → 폼 값으로 변환 (null → '') */
export function toFormValues(ingredient: Ingredient): IngredientFormValues {
  return {
    name: ingredient.name,
    category: ingredient.category,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    storage: ingredient.storage,
    expiresAt: ingredient.expiresAt ?? '',
  }
}
