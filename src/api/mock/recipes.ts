import { mockRecipes } from '@/mocks/recipes'
import type { RecipesApi } from '../contracts'
import { mockRequest } from './delay'

/** 데모 모드 레시피 API (고정 목 데이터) */
export const mockRecipesApi: RecipesApi = {
  fetchRecipes: () => mockRequest(mockRecipes),

  async fetchRecipeById(recipeId) {
    const recipe = mockRecipes.find((item) => item.id === recipeId)
    // 에러를 던지면 TanStack Query가 error 상태로 바꿔 줍니다.
    if (!recipe) throw new Error('레시피를 찾을 수 없어요.')
    return mockRequest(recipe)
  },
}
