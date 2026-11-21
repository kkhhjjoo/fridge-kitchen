import { toDateOnlyString } from '@/lib/date'
import type { AddShoppingItemsResult, ShoppingApi } from '../contracts'
import { ingredientsTable, roundQuantity, shoppingTable as table } from './db'
import { mockDelay } from './delay'

/** 데모 모드 장보기 API (localStorage) */
export const mockShoppingApi: ShoppingApi = {
  async fetchShoppingItems() {
    await mockDelay(400)
    return table.list()
  },

  async addShoppingItems(inputs) {
    await mockDelay()
    // 아직 사지 않은 같은 이름의 항목이 있으면 중복으로 넣지 않음
    const pendingNames = new Set(
      table
        .list()
        .filter((item) => !item.isChecked)
        .map((item) => item.name),
    )
    const result: AddShoppingItemsResult = { added: [], skippedNames: [] }

    for (const input of inputs) {
      if (pendingNames.has(input.name)) {
        result.skippedNames.push(input.name)
        continue
      }
      result.added.push(table.insert({ ...input, id: crypto.randomUUID(), isChecked: false }))
      pendingNames.add(input.name)
    }
    return result
  },

  async setShoppingItemChecked(id, isChecked) {
    await mockDelay(150)
    return table.update(id, { isChecked })
  },

  async deleteShoppingItems(ids) {
    await mockDelay(200)
    return ids.map((id) => table.remove(id))
  },

  async stockFromShopping(inputs, shoppingItemIds) {
    await mockDelay()
    let createdCount = 0
    let mergedCount = 0
    const today = toDateOnlyString(new Date())

    for (const input of inputs) {
      const existing = ingredientsTable
        .list()
        .find((item) => item.name === input.name && item.unit === input.unit)

      if (existing) {
        // 같은 재료가 있으면 수량을 합치고, 유통기한은 더 빠른 날짜를 남김
        // ('YYYY-MM-DD' 문자열은 사전순 정렬 = 날짜순 정렬)
        const dates = [existing.expiresAt, input.expiresAt].filter((d): d is string => d !== null)
        ingredientsTable.update(existing.id, {
          quantity: roundQuantity(existing.quantity + input.quantity),
          expiresAt: dates.sort()[0] ?? null,
        })
        mergedCount++
      } else {
        ingredientsTable.insert({ ...input, id: crypto.randomUUID(), createdAt: today })
        createdCount++
      }
    }

    for (const id of shoppingItemIds) table.remove(id)
    return { createdCount, mergedCount }
  },
}
