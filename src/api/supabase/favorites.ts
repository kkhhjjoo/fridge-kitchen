import { z } from 'zod'
import { requireSupabase } from '@/lib/supabase'
import type { FavoritesApi } from '../contracts'
import { toAppError } from './rows'

export const supabaseFavoritesApi: FavoritesApi = {
  async fetchFavoriteIds() {
    const { data, error } = await requireSupabase().from('favorites').select('recipe_id')
    if (error) throw toAppError(error, '즐겨찾기를 불러오지 못했어요.')
    return z
      .array(z.object({ recipe_id: z.string() }))
      .parse(data)
      .map((row) => row.recipe_id)
  },

  async addFavorite(recipeId) {
    // upsert: 이미 있으면 무시 (같은 버튼을 빠르게 두 번 눌러도 에러가 나지 않게)
    const { error } = await requireSupabase()
      .from('favorites')
      .upsert({ recipe_id: recipeId }, { onConflict: 'user_id,recipe_id', ignoreDuplicates: true })
    if (error) throw toAppError(error, '즐겨찾기에 담지 못했어요.')
  },

  async removeFavorite(recipeId) {
    // RLS 덕분에 내 즐겨찾기 행만 지워집니다
    const { error } = await requireSupabase().from('favorites').delete().eq('recipe_id', recipeId)
    if (error) throw toAppError(error, '즐겨찾기에서 빼지 못했어요.')
  },
}
