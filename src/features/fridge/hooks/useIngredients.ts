import { useQuery } from '@tanstack/react-query'
import { fetchIngredients } from '@/api/ingredients'
import { queryKeys } from '@/api/queryKeys'

/**
 * 내 냉장고 식재료 목록 조회 훅
 * 컴포넌트는 "어디서 어떻게 가져오는지" 몰라도 되고, 이 훅만 호출하면 됩니다.
 * 같은 키를 쓰는 컴포넌트가 여러 개여도 요청은 한 번만 나가고 캐시를 공유해요.
 */
export function useIngredients() {
  return useQuery({
    queryKey: queryKeys.ingredients.all,
    queryFn: fetchIngredients,
  })
}
