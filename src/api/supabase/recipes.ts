import { z } from 'zod'
import { requireSupabase } from '@/lib/supabase'
import type { RecipesApi } from '../contracts'
import { RECIPE_SELECT, recipeRow, toAppError } from './rows'

const NOT_FOUND = '레시피를 찾을 수 없어요.'

export const supabaseRecipesApi: RecipesApi = {
  async fetchRecipes() {
    const { data, error } = await requireSupabase()
      .from('recipes')
      .select(RECIPE_SELECT)
      .order('created_at')
    if (error) throw toAppError(error, '레시피를 불러오지 못했어요.')
    return z.array(recipeRow).parse(data)
  },

  async fetchRecipeById(recipeId) {
    // 주소창에 이상한 값이 들어오면 DB까지 가지 않고 바로 "없음" 처리 (uuid 형식 검사)
    if (!z.uuid().safeParse(recipeId).success) throw new Error(NOT_FOUND)

    const { data, error } = await requireSupabase()
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', recipeId)
      .maybeSingle() // 결과가 0개면 에러 대신 null
    if (error) throw toAppError(error, '레시피를 불러오지 못했어요.')
    if (!data) throw new Error(NOT_FOUND)
    return recipeRow.parse(data)
  },
}
