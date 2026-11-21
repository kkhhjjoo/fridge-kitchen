import { isSupabaseEnabled } from '@/lib/supabase'
import type { IngredientsApi } from './contracts'
import { mockIngredientsApi } from './mock/ingredients'
import { supabaseIngredientsApi } from './supabase/ingredients'

/**
 * 환경 변수 유무에 따라 구현을 고릅니다. (Supabase 모드 / 데모 모드)
 * 훅·화면은 항상 이 파일에서 import → 어느 구현이 쓰이는지 신경 쓸 필요가 없어요.
 */
const api: IngredientsApi = isSupabaseEnabled ? supabaseIngredientsApi : mockIngredientsApi

export const {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  restoreIngredient,
  completeCooking,
} = api
