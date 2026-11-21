import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchRecipes } from '@/api/recipes'

/** 전체 레시피 목록 조회 (추천 계산, 장보기의 "출처 레시피" 이름 표시 등에 공통 사용) */
export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes.all,
    queryFn: fetchRecipes,
    staleTime: Infinity, // 레시피 데이터는 거의 바뀌지 않으므로 한 번 받으면 계속 재사용
  })
}
