import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queryKeys } from '@/api/queryKeys'
import { fetchRecipeById } from '@/api/recipes'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { matchRecipe } from '../utils/match'

/**
 * 레시피 1개 + 내 냉장고 기준 분석 (레시피 상세 페이지용)
 */
export function useRecipeRecommendation(recipeId: string) {
  const ingredientsQuery = useIngredients()
  const recipeQuery = useQuery({
    queryKey: queryKeys.recipes.detail(recipeId),
    queryFn: () => fetchRecipeById(recipeId),
    // "없는 레시피"는 다시 시도해도 결과가 같으므로 재시도하지 않음
    retry: false,
  })

  const soonDays = useExpirySoonDays()

  const recommendation = useMemo(() => {
    if (!recipeQuery.data || !ingredientsQuery.data) return undefined
    return matchRecipe(recipeQuery.data, ingredientsQuery.data, soonDays)
  }, [recipeQuery.data, ingredientsQuery.data, soonDays])

  return {
    recommendation,
    isPending: recipeQuery.isPending || ingredientsQuery.isPending,
    error: recipeQuery.error ?? ingredientsQuery.error,
  }
}
