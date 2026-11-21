import type { FavoritesApi } from '../contracts'
import { favoritesTable as table } from './db'
import { mockDelay } from './delay'

/** 데모 모드 즐겨찾기 API (localStorage) */
export const mockFavoritesApi: FavoritesApi = {
  async fetchFavoriteIds() {
    await mockDelay(200)
    return table.list().map((row) => row.id)
  },

  async addFavorite(recipeId) {
    await mockDelay(150)
    if (!table.list().some((row) => row.id === recipeId)) table.insert({ id: recipeId })
  },

  async removeFavorite(recipeId) {
    await mockDelay(150)
    if (table.list().some((row) => row.id === recipeId)) table.remove(recipeId)
  },
}
