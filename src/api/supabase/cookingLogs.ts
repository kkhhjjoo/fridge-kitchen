import { z } from 'zod'
import type { CookingLog } from '@/features/profile/types'
import { requireSupabase } from '@/lib/supabase'
import type { CookingLogsApi } from '../contracts'
import { toAppError } from './rows'

/** 너무 오래된 기록까지 다 받지 않도록 최근 몇 건만 */
const MAX_LOGS = 100

const cookingLogRow = z
  .object({
    id: z.string(),
    recipe_id: z.string().nullable(),
    cooked_at: z.string(),
    // complete_cooking 함수가 저장한 usages 배열: [{ ingredientId, amount, removeWhenEmpty }]
    used_ingredients: z.array(z.object({ amount: z.coerce.number() }).loose()),
  })
  .transform(
    (row): CookingLog => ({
      id: row.id,
      recipeId: row.recipe_id,
      cookedAt: row.cooked_at,
      // DB 함수도 amount가 0 이하인 항목은 건너뛰므로 같은 기준으로 셉니다
      usedIngredientCount: row.used_ingredients.filter((usage) => usage.amount > 0).length,
    }),
  )

export const supabaseCookingLogsApi: CookingLogsApi = {
  async fetchCookingLogs() {
    const { data, error } = await requireSupabase()
      .from('cooking_logs')
      .select('id, recipe_id, cooked_at, used_ingredients')
      .order('cooked_at', { ascending: false })
      .limit(MAX_LOGS)
    if (error) throw toAppError(error, '요리 기록을 불러오지 못했어요.')
    return z.array(cookingLogRow).parse(data)
  },
}
