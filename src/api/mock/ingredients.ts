import { toDateOnlyString } from '@/lib/date'
import type { IngredientsApi } from '../contracts'
import { cookingLogsTable, ingredientsTable as table, roundQuantity } from './db'
import { mockDelay } from './delay'

/** 데모 모드 식재료 API (localStorage) */
export const mockIngredientsApi: IngredientsApi = {
  async fetchIngredients() {
    await mockDelay(400)
    return table.list()
  },

  async createIngredient(input) {
    await mockDelay()
    return table.insert({
      ...input,
      id: crypto.randomUUID(), // 브라우저 내장 고유 ID 생성기
      createdAt: toDateOnlyString(new Date()),
    })
  },

  async updateIngredient(id, input) {
    await mockDelay()
    return table.update(id, input)
  },

  async deleteIngredient(id) {
    await mockDelay()
    return table.remove(id)
  },

  async restoreIngredient(ingredient) {
    await mockDelay(150)
    return table.insert(ingredient)
  },

  async completeCooking(recipeId, usages) {
    await mockDelay()
    let updatedCount = 0
    let removedCount = 0
    const current = new Map(table.list().map((item) => [item.id, item]))

    for (const { ingredientId, amount, removeWhenEmpty } of usages) {
      const item = current.get(ingredientId)
      if (!item || amount <= 0) continue

      const remaining = Math.max(0, roundQuantity(item.quantity - amount))
      if (remaining === 0 && removeWhenEmpty) {
        table.remove(ingredientId)
        removedCount++
      } else {
        table.update(ingredientId, { quantity: remaining })
        updatedCount++
      }
    }

    cookingLogsTable.insert({
      id: crypto.randomUUID(),
      recipeId,
      cookedAt: new Date().toISOString(),
      usedIngredientCount: updatedCount + removedCount,
    })
    return { updatedCount, removedCount }
  },
}
