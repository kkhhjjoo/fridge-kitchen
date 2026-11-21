import { z } from 'zod'
import { requireSupabase } from '@/lib/supabase'
import type { IngredientsApi } from '../contracts'
import { ingredientRow, toAppError, toIngredientRow } from './rows'

/**
 * Supabase 식재료 API
 * user_id는 보내지 않아요. DB 기본값(auth.uid())이 채우고, RLS가 "내 데이터만" 보이게 막아 줍니다.
 */
export const supabaseIngredientsApi: IngredientsApi = {
  async fetchIngredients() {
    const { data, error } = await requireSupabase()
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw toAppError(error, '재료 목록을 불러오지 못했어요.')
    return z.array(ingredientRow).parse(data)
  },

  async createIngredient(input) {
    const { data, error } = await requireSupabase()
      .from('ingredients')
      .insert(toIngredientRow(input))
      .select() // insert 후 저장된 행(id, created_at 포함)을 돌려받기
      .single()
    if (error) throw toAppError(error, '재료를 등록하지 못했어요.')
    return ingredientRow.parse(data)
  },

  async updateIngredient(id, input) {
    const { data, error } = await requireSupabase()
      .from('ingredients')
      .update({ ...toIngredientRow(input), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw toAppError(error, '재료를 수정하지 못했어요.')
    return ingredientRow.parse(data)
  },

  async deleteIngredient(id) {
    const { data, error } = await requireSupabase()
      .from('ingredients')
      .delete()
      .eq('id', id)
      .select()
      .single()
    if (error) throw toAppError(error, '재료를 삭제하지 못했어요.')
    return ingredientRow.parse(data)
  },

  async restoreIngredient(ingredient) {
    const { data, error } = await requireSupabase()
      .from('ingredients')
      .insert({ ...toIngredientRow(ingredient), id: ingredient.id, created_at: ingredient.createdAt })
      .select()
      .single()
    if (error) throw toAppError(error, '재료를 복원하지 못했어요.')
    return ingredientRow.parse(data)
  },

  async completeCooking(recipeId, usages) {
    // rpc(): DB 함수 호출 — 차감·삭제·기록이 하나의 트랜잭션으로 처리됩니다
    const { data, error } = await requireSupabase().rpc('complete_cooking', {
      p_recipe_id: recipeId,
      usages,
    })
    if (error) throw toAppError(error, '재료를 정리하지 못했어요.')
    return z.object({ updatedCount: z.number(), removedCount: z.number() }).parse(data)
  },
}
