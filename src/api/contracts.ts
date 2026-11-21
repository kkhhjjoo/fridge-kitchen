import type { Ingredient, IngredientInput } from '@/features/fridge/types'
import type { CookingLog, Profile, ProfileUpdate } from '@/features/profile/types'
import type { AiChefRequest, AiRecipe } from '@/features/recipes/aiChefTypes'
import type { Recipe } from '@/features/recipes/types'
import type { ShoppingItem, ShoppingItemInput } from '@/features/shopping/types'

/**
 * API 계약(Contract)
 *
 * "어떤 함수가 있고, 무엇을 받아 무엇을 돌려주는지"만 정의합니다.
 * 실제 구현은 두 가지:
 *   - api/mock/*      : 브라우저 localStorage에 저장 (데모 모드)
 *   - api/supabase/*  : Supabase DB에 저장
 * 둘 다 이 인터페이스를 따르므로, 화면·훅 코드는 어느 쪽이 쓰이는지 몰라도 됩니다.
 * (이런 설계를 "저장소 패턴(Repository Pattern)"이라고 불러요)
 */

export interface IngredientUsage {
  ingredientId: string
  amount: number
  /** 남은 양이 0이 되면 냉장고에서 삭제할지 */
  removeWhenEmpty: boolean
}

export interface CompleteCookingResult {
  updatedCount: number
  removedCount: number
}

export interface IngredientsApi {
  fetchIngredients: () => Promise<Ingredient[]>
  createIngredient: (input: IngredientInput) => Promise<Ingredient>
  updateIngredient: (id: string, input: IngredientInput) => Promise<Ingredient>
  /** 삭제된 재료를 반환 → "실행 취소"에 사용 */
  deleteIngredient: (id: string) => Promise<Ingredient>
  /** 실행 취소: 삭제했던 재료를 같은 id로 다시 넣기 */
  restoreIngredient: (ingredient: Ingredient) => Promise<Ingredient>
  /** 요리 완료: 사용량만큼 차감 + 요리 기록 저장 (한 번에 처리) */
  completeCooking: (recipeId: string, usages: IngredientUsage[]) => Promise<CompleteCookingResult>
}

export interface RecipesApi {
  fetchRecipes: () => Promise<Recipe[]>
  /** 없으면 에러를 던집니다 */
  fetchRecipeById: (recipeId: string) => Promise<Recipe>
}

export interface AddShoppingItemsResult {
  added: ShoppingItem[]
  /** 이미 장보기 목록에 (구매 전 상태로) 있어서 건너뛴 재료 이름 */
  skippedNames: string[]
}

export interface StockResult {
  createdCount: number
  /** 같은 이름·단위의 재료가 있어 수량을 합친 개수 */
  mergedCount: number
}

export interface ShoppingApi {
  fetchShoppingItems: () => Promise<ShoppingItem[]>
  addShoppingItems: (inputs: ShoppingItemInput[]) => Promise<AddShoppingItemsResult>
  setShoppingItemChecked: (id: string, isChecked: boolean) => Promise<ShoppingItem>
  deleteShoppingItems: (ids: string[]) => Promise<ShoppingItem[]>
  /** 장 본 재료를 냉장고에 넣고(같은 재료는 합치기) 장보기 목록에서 제거 — 한 번에 처리 */
  stockFromShopping: (inputs: IngredientInput[], shoppingItemIds: string[]) => Promise<StockResult>
}

export interface FavoritesApi {
  fetchFavoriteIds: () => Promise<string[]>
  addFavorite: (recipeId: string) => Promise<void>
  removeFavorite: (recipeId: string) => Promise<void>
}

export interface ProfileApi {
  fetchProfile: () => Promise<Profile>
  /** 바꾼 뒤의 프로필 전체를 돌려줍니다 */
  updateProfile: (update: ProfileUpdate) => Promise<Profile>
}

export interface CookingLogsApi {
  /** 최근 요리가 맨 앞 */
  fetchCookingLogs: () => Promise<CookingLog[]>
}

export interface AiChefApi {
  /** 내 냉장고 재료 + 요청으로 AI가 새 레시피를 만들어 줍니다 (보통 3개) */
  suggestRecipes: (request: AiChefRequest) => Promise<AiRecipe[]>
}
