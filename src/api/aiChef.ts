import { z } from 'zod'
import type { AiRecipe } from '@/features/recipes/aiChefTypes'
import { DIFFICULTIES } from '@/features/recipes/types'
import type { AiChefApi } from './contracts'
import { fetchIngredients } from './ingredients'

/**
 * AI 셰프 — 내 컴퓨터의 claude(Claude 구독)로 레시피를 받아 옵니다.
 *
 * 개발 서버(npm run dev)의 /api/ai-chef 주소로 요청하면, 개발 서버가 claude 명령을 실행해 줍니다.
 * (dev-server/aiChefPlugin.ts) API 키가 필요 없고, 데모 모드·Supabase 모드 모두 같은 방식이에요.
 * 냉장고 재료는 지금 모드에 맞는 곳(localStorage 또는 Supabase)에서 읽어서 함께 보냅니다.
 */

const aiRecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cookingTimeMinutes: z.number(),
  difficulty: z.enum(DIFFICULTIES),
  servings: z.number(),
  ingredients: z.array(z.object({ name: z.string(), quantity: z.number(), unit: z.string() })),
  steps: z.array(z.string()),
  tip: z.string(),
}) satisfies z.ZodType<AiRecipe>

const successSchema = z.object({ recipes: z.array(aiRecipeSchema) })
const failureSchema = z.object({ error: z.string() })

const api: AiChefApi = {
  async suggestRecipes({ wish, servings, cuisine, avoidTitles }) {
    const fridge = await fetchIngredients()

    let response: Response
    try {
      response = await fetch('/api/ai-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish,
          servings,
          cuisine,
          avoidTitles,
          fridge: fridge.map(({ name, quantity, unit, expiresAt }) => ({ name, quantity, unit, expiresAt })),
        }),
      })
    } catch {
      throw new Error('개발 서버에 연결하지 못했어요. npm run dev가 켜져 있는지 확인해 주세요.')
    }

    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const failure = failureSchema.safeParse(body)
      if (failure.success) throw new Error(failure.data.error)
      // 404: 배포된 사이트(빌드 결과)에는 /api/ai-chef가 없음
      throw new Error(
        response.status === 404
          ? 'AI 셰프는 내 컴퓨터에서 npm run dev로 켰을 때만 쓸 수 있어요.'
          : 'AI 셰프를 부르지 못했어요. 다시 시도해 주세요.',
      )
    }

    const parsed = successSchema.safeParse(body)
    if (!parsed.success) throw new Error('AI 셰프의 답을 읽지 못했어요. 다시 시도해 주세요.')
    return parsed.data.recipes
  },
}

export const { suggestRecipes } = api
