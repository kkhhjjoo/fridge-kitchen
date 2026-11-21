import { z } from 'zod'

/**
 * "요리 완료" 폼 — 재료마다 사용량을 확인
 *
 * .refine(): 필드 하나가 아니라 "여러 필드를 함께 보는" 검증 규칙
 *   사용량(amount)이 보유량(ownedQuantity)보다 크면 안 됨 → 에러를 amount 칸에 표시(path)
 */
export const cookingFormSchema = z.object({
  items: z.array(
    z
      .object({
        ingredientId: z.string(),
        name: z.string(),
        unit: z.string(),
        ownedQuantity: z.number(),
        /** 레시피에 적힌 양 (단위가 냉장고와 다를 수 있어 안내용으로만 사용) */
        recipeAmountLabel: z.string(),
        /** 레시피 단위와 냉장고 단위가 같은지 (다르면 사용량을 직접 입력하도록 안내) */
        unitMatches: z.boolean(),
        amount: z.number({ error: '숫자로 입력해 주세요.' }).min(0, '0 이상이어야 해요.'),
        removeWhenEmpty: z.boolean(),
      })
      .refine((item) => item.amount <= item.ownedQuantity, {
        message: '보유량보다 많이 쓸 수 없어요.',
        path: ['amount'],
      }),
  ),
})

export type CookingFormValues = z.infer<typeof cookingFormSchema>
