import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/api/queryKeys'
import {
  addShoppingItems,
  deleteShoppingItems,
  setShoppingItemChecked,
  stockFromShopping,
} from '@/api/shopping'
import type { IngredientInput } from '@/features/fridge/types'
import type { ShoppingItem, ShoppingItemInput } from '../types'

const shoppingKey = queryKeys.shopping.all

/** 장보기 목록에 재료 추가 (직접 추가 / 레시피의 "부족한 재료 담기") */
export function useAddShoppingItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inputs: ShoppingItemInput[]) => addShoppingItems(inputs),
    onSuccess: ({ added, skippedNames }) => {
      void queryClient.invalidateQueries({ queryKey: shoppingKey })

      // 결과에 따라 알맞은 안내 문구 (전부 추가 / 일부 중복 / 전부 중복)
      if (added.length === 0) {
        toast.info('이미 장보기 목록에 담겨 있어요.')
      } else if (skippedNames.length > 0) {
        toast.success(
          `${added.length}개를 장보기 목록에 담았어요. (이미 있는 재료: ${skippedNames.join(', ')})`,
        )
      } else {
        toast.success(`${added.length}개를 장보기 목록에 담았어요.`)
      }
    },
    onError: () => toast.error('장보기 목록에 담지 못했어요.'),
  })
}

/**
 * 구매 완료 체크 — 낙관적 업데이트
 * 체크박스는 누르는 즉시 반응해야 자연스러워서, 서버 응답 전에 캐시부터 바꿉니다.
 */
export function useToggleShoppingItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      setShoppingItemChecked(id, isChecked),
    onMutate: async ({ id, isChecked }) => {
      await queryClient.cancelQueries({ queryKey: shoppingKey })
      const previous = queryClient.getQueryData<ShoppingItem[]>(shoppingKey)
      queryClient.setQueryData<ShoppingItem[]>(shoppingKey, (old) =>
        old?.map((item) => (item.id === id ? { ...item, isChecked } : item)),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(shoppingKey, context.previous)
      toast.error('체크 상태를 바꾸지 못했어요.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: shoppingKey }),
  })
}

/** 항목 삭제 (1개 또는 "완료 항목 모두 삭제") — 낙관적 업데이트 */
export function useDeleteShoppingItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteShoppingItems(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: shoppingKey })
      const previous = queryClient.getQueryData<ShoppingItem[]>(shoppingKey)
      const idSet = new Set(ids)
      queryClient.setQueryData<ShoppingItem[]>(shoppingKey, (old) =>
        old?.filter((item) => !idSet.has(item.id)),
      )
      return { previous }
    },
    onSuccess: (removed) => {
      toast.success(removed.length === 1 ? '삭제했어요.' : `${removed.length}개를 삭제했어요.`)
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(shoppingKey, context.previous)
      toast.error('삭제하지 못했어요.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: shoppingKey }),
  })
}

interface StockToFridgeVariables {
  /** 냉장고에 넣을 재료들 (화면에서 카테고리·유통기한을 확인한 결과) */
  inputs: IngredientInput[]
  /** 다 옮긴 뒤 장보기 목록에서 지울 항목 id */
  shoppingItemIds: string[]
}

/**
 * 장 본 재료를 냉장고에 넣기
 * 1) 냉장고에 재료 추가(같은 재료는 수량 합치기) → 2) 장보기 목록에서 제거
 * 두 목록이 모두 바뀌므로 두 쿼리를 함께 무효화합니다.
 */
export function useStockToFridge() {
  const queryClient = useQueryClient()

  return useMutation({
    // 두 작업(냉장고 추가 + 장보기 제거)을 API 한 번으로 처리 → Supabase에서는 트랜잭션으로 묶임
    mutationFn: ({ inputs, shoppingItemIds }: StockToFridgeVariables) =>
      stockFromShopping(inputs, shoppingItemIds),
    onSuccess: ({ createdCount, mergedCount }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all })
      void queryClient.invalidateQueries({ queryKey: shoppingKey })
      const total = createdCount + mergedCount
      toast.success(
        mergedCount > 0
          ? `${total}개를 냉장고에 넣었어요. (${mergedCount}개는 있던 재료에 합쳤어요)`
          : `${total}개를 냉장고에 넣었어요.`,
      )
    },
    onError: () => toast.error('냉장고에 넣지 못했어요. 다시 시도해 주세요.'),
  })
}
