import { useMutation } from '@tanstack/react-query'
import { suggestRecipes } from '@/api/aiChef'
import type { AiChefRequest } from '../aiChefTypes'

/**
 * AI 셰프에게 레시피 요청
 * 조회(useQuery)가 아니라 useMutation인 이유: 버튼을 누를 때만 보내고, 같은 요청도 매번 새 답을 받기 때문이에요.
 * (결과는 data에, 진행 중은 isPending, 실패는 error에 들어 있어요)
 */
export function useAiChef() {
  return useMutation({
    mutationFn: (request: AiChefRequest) => suggestRecipes(request),
  })
}
