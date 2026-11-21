import type { CookingLogsApi } from '../contracts'
import { cookingLogsTable as table } from './db'
import { mockDelay } from './delay'

/** 데모 모드 요리 기록 API (localStorage) */
export const mockCookingLogsApi: CookingLogsApi = {
  async fetchCookingLogs() {
    await mockDelay(300)
    return table
      .list()
      .map((log) => ({ ...log, usedIngredientCount: log.usedIngredientCount ?? 0 }))
      .sort((a, b) => b.cookedAt.localeCompare(a.cookedAt)) // 최근 것이 앞
  },
}
