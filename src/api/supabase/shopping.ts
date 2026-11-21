import { z } from 'zod'
import { requireSupabase } from '@/lib/supabase'
import type { ShoppingApi } from '../contracts'
import { shoppingRow, toAppError } from './rows'

export const supabaseShoppingApi: ShoppingApi = {
  async fetchShoppingItems() {
    const { data, error } = await requireSupabase()
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw toAppError(error, '장보기 목록을 불러오지 못했어요.')
    return z.array(shoppingRow).parse(data)
  },

  async addShoppingItems(inputs) {
    const db = requireSupabase()

    // 아직 사지 않은 같은 이름의 항목은 중복으로 넣지 않음
    const { data: pending, error: pendingError } = await db
      .from('shopping_items')
      .select('name')
      .eq('is_checked', false)
    if (pendingError) throw toAppError(pendingError, '장보기 목록에 담지 못했어요.')

    const pendingNames = new Set(z.array(z.object({ name: z.string() })).parse(pending).map((r) => r.name))
    const toInsert = inputs.filter((input) => !pendingNames.has(input.name))
    const skippedNames = inputs.filter((input) => pendingNames.has(input.name)).map((i) => i.name)

    if (toInsert.length === 0) return { added: [], skippedNames }

    const { data, error } = await db
      .from('shopping_items')
      .insert(
        toInsert.map((input) => ({
          name: input.name,
          quantity: input.quantity,
          unit: input.unit,
          recipe_id: input.recipeId,
        })),
      )
      .select()
    if (error) throw toAppError(error, '장보기 목록에 담지 못했어요.')
    return { added: z.array(shoppingRow).parse(data), skippedNames }
  },

  async setShoppingItemChecked(id, isChecked) {
    const { data, error } = await requireSupabase()
      .from('shopping_items')
      .update({ is_checked: isChecked })
      .eq('id', id)
      .select()
      .single()
    if (error) throw toAppError(error, '체크 상태를 바꾸지 못했어요.')
    return shoppingRow.parse(data)
  },

  async deleteShoppingItems(ids) {
    const { data, error } = await requireSupabase()
      .from('shopping_items')
      .delete()
      .in('id', ids)
      .select()
    if (error) throw toAppError(error, '삭제하지 못했어요.')
    return z.array(shoppingRow).parse(data)
  },

  async stockFromShopping(inputs, shoppingItemIds) {
    // DB 함수 하나로 "냉장고에 추가 + 장보기에서 제거"를 트랜잭션 처리
    const { data, error } = await requireSupabase().rpc('stock_from_shopping', {
      items: inputs,
      shopping_item_ids: shoppingItemIds,
    })
    if (error) throw toAppError(error, '냉장고에 넣지 못했어요.')
    return z.object({ createdCount: z.number(), mergedCount: z.number() }).parse(data)
  },
}
