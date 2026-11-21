import { useMemo } from 'react'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { rankRecipes } from '../utils/match'
import { useRecipes } from './useRecipes'

interface RecommendationOptions {
  /** true면 임박 재료를 많이 쓰는 레시피를 우선 */
  prioritizeExpiring?: boolean
}

/**
 * 내 냉장고 기준 레시피 추천 목록
 * 두 개의 쿼리(재료, 레시피)를 조합해서 정렬한 결과를 돌려줍니다.
 * 냉장고 재료가 바뀌면(등록/삭제) 재료 쿼리가 갱신되면서 추천도 자동으로 다시 계산돼요.
 * 마이페이지에서 임박 기준일을 바꾸면 "임박 재료 n개 활용" 숫자도 다시 계산됩니다.
 */
export function useRecipeRecommendations({ prioritizeExpiring = false }: RecommendationOptions = {}) {
  const ingredientsQuery = useIngredients()
  const recipesQuery = useRecipes()
  const soonDays = useExpirySoonDays()

  // useMemo: 재료/레시피/옵션이 바뀔 때만 다시 계산 (매 렌더마다 정렬하지 않도록)
  const recommendations = useMemo(() => {
    if (!ingredientsQuery.data || !recipesQuery.data) return []
    return rankRecipes(recipesQuery.data, ingredientsQuery.data, { prioritizeExpiring, soonDays })
  }, [ingredientsQuery.data, recipesQuery.data, prioritizeExpiring, soonDays])

  return {
    recommendations,
    isPending: ingredientsQuery.isPending || recipesQuery.isPending,
    isError: ingredientsQuery.isError || recipesQuery.isError,
    refetch: () => {
      void ingredientsQuery.refetch()
      void recipesQuery.refetch()
    },
  }
}
