import type { PostgrestError } from '@supabase/supabase-js'
import { z } from 'zod'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES, type Ingredient, type IngredientInput } from '@/features/fridge/types'
import { DIFFICULTIES, type Recipe } from '@/features/recipes/types'
import type { ShoppingItem } from '@/features/shopping/types'

/**
 * DB 행(row) ↔ 앱 타입 변환
 *
 * 1) 검증: DB 응답이 예상한 모양인지 Zod로 확인 (아니면 바로 에러 → 이상한 데이터가 화면까지 가지 않음)
 * 2) 변환: DB는 snake_case(expires_at), 앱은 camelCase(expiresAt)
 *
 * z.coerce.number(): Postgres numeric이 혹시 문자열("1.50")로 와도 숫자로 바꿔 줍니다.
 * .transform((row): Ingredient => ...): 반환 타입을 명시해서 앱 타입과 어긋나면 컴파일 에러
 */
export const ingredientRow = z
  .object({
    id: z.string(),
    name: z.string(),
    category: z.enum(INGREDIENT_CATEGORIES),
    quantity: z.coerce.number(),
    unit: z.string(),
    storage: z.enum(STORAGE_TYPES),
    expires_at: z.string().nullable(),
    created_at: z.string(),
  })
  .transform(
    (row): Ingredient => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      storage: row.storage,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }),
  )

/** 앱 → DB: 저장할 때 쓰는 변환 */
export function toIngredientRow(input: IngredientInput) {
  return {
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    storage: input.storage,
    expires_at: input.expiresAt,
  }
}

export const shoppingRow = z
  .object({
    id: z.string(),
    name: z.string(),
    quantity: z.coerce.number(),
    unit: z.string(),
    is_checked: z.boolean(),
    recipe_id: z.string().nullable(),
  })
  .transform(
    (row): ShoppingItem => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      unit: row.unit,
      isChecked: row.is_checked,
      recipeId: row.recipe_id,
    }),
  )

/** recipes + 재료 + 조리 순서를 한 번에 조회할 때 쓰는 select 문자열 (PostgREST의 관계 조회 문법) */
export const RECIPE_SELECT =
  '*, recipe_ingredients(sort_order, name, quantity, unit), recipe_steps(step_order, description)'

export const recipeRow = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    image_url: z.string(),
    cooking_time_minutes: z.number(),
    difficulty: z.enum(DIFFICULTIES),
    servings: z.number(),
    tags: z.array(z.string()),
    recipe_ingredients: z.array(
      z.object({
        sort_order: z.number(),
        name: z.string(),
        quantity: z.coerce.number(),
        unit: z.string(),
      }),
    ),
    recipe_steps: z.array(z.object({ step_order: z.number(), description: z.string() })),
  })
  .transform(
    (row): Recipe => ({
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      cookingTimeMinutes: row.cooking_time_minutes,
      difficulty: row.difficulty,
      servings: row.servings,
      tags: row.tags,
      // 관계 조회 결과는 순서가 보장되지 않으므로 직접 정렬
      ingredients: [...row.recipe_ingredients]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(({ name, quantity, unit }) => ({ name, quantity, unit })),
      steps: [...row.recipe_steps]
        .sort((a, b) => a.step_order - b.step_order)
        .map((step) => step.description),
    }),
  )

/**
 * Supabase 에러 → 사용자에게 보여줄 에러로 변환
 * 원본 에러는 개발자 도구 콘솔에 남겨 디버깅할 수 있게 합니다.
 */
export function toAppError(error: PostgrestError, message: string): Error {
  console.error('[supabase]', error)
  return new Error(message)
}
