import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { IngredientUsage } from '@/api/contracts'
import { completeCooking } from '@/api/ingredients'
import { queryKeys } from '@/api/queryKeys'

/**
 * 요리 완료 → 사용한 재료를 냉장고 재고에서 차감 (+ 요리 기록 저장)
 * 재료 쿼리를 무효화하면 홈·냉장고·추천 화면이 모두 새 재고 기준으로 다시 계산됩니다.
 */
export function useCompleteCooking(recipeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (usages: IngredientUsage[]) => completeCooking(recipeId, usages),
    onSuccess: ({ updatedCount, removedCount }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all })
      // 마이페이지의 요리 기록·통계도 새 기록이 보이도록
      void queryClient.invalidateQueries({ queryKey: queryKeys.cookingLogs.all })
      const parts = [
        updatedCount > 0 && `${updatedCount}개 차감`,
        removedCount > 0 && `${removedCount}개 다 씀`,
      ].filter(Boolean)
      toast.success(
        parts.length > 0 ? `요리 완료! 재료를 정리했어요. (${parts.join(', ')})` : '요리 완료!',
      )
    },
    onError: (error) => toast.error(error.message || '재료를 정리하지 못했어요.'),
  })
}
