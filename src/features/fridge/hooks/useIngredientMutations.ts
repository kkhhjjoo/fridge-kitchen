import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createIngredient,
  deleteIngredient,
  restoreIngredient,
  updateIngredient,
} from '@/api/ingredients'
import { queryKeys } from '@/api/queryKeys'
import { withObjectParticle } from '@/lib/korean'
import { toast } from 'sonner'
import type { Ingredient, IngredientInput } from '../types'

/** 에러 객체에서 사용자에게 보여줄 메시지 꺼내기 (unknown 타입을 안전하게 처리) */
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/**
 * 재료 등록
 * useMutation: 서버 데이터를 "바꾸는" 요청용 훅 (조회는 useQuery)
 * 성공하면 invalidateQueries로 목록 캐시를 "오래됨" 처리 → 자동으로 다시 불러옵니다.
 * 홈 화면도 같은 쿼리 키를 쓰므로 홈의 통계·임박 재료도 함께 갱신돼요.
 */
export function useCreateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: IngredientInput) => createIngredient(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all })
      toast.success(`${withObjectParticle(created.name)} 냉장고에 넣었어요.`)
    },
    onError: (error) => toast.error(getErrorMessage(error, '재료를 등록하지 못했어요.')),
  })
}

/** 토스트용 이름 묶음: 3개까지는 모두, 그 이상은 "대파, 계란 외 3개" */
function joinNames(names: string[]): string {
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} 외 ${names.length - 2}개`
}

/**
 * 재료 여러 개 한 번에 등록 (이름 칸에 쉼표로 적었을 때)
 * 하나씩 차례로 저장합니다. 중간에 실패하면 거기서 멈추고, 몇 개까지 들어갔는지 알려 줘요.
 */
export function useCreateIngredients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inputs: IngredientInput[]) => {
      const created: Ingredient[] = []
      for (const input of inputs) {
        try {
          created.push(await createIngredient(input))
        } catch (error) {
          const reason = getErrorMessage(error, '재료를 등록하지 못했어요.')
          throw new Error(
            created.length > 0
              ? `${joinNames(created.map((item) => item.name))}까지 넣고, ${input.name}부터 넣지 못했어요. (${reason})`
              : reason,
            { cause: error }, // 원래 에러를 함께 넘겨 개발자 도구에서 원인을 볼 수 있게
          )
        }
      }
      return created
    },
    onSuccess: (created) => {
      toast.success(`${withObjectParticle(joinNames(created.map((item) => item.name)))} 냉장고에 넣었어요.`)
    },
    onError: (error) => toast.error(getErrorMessage(error, '재료를 등록하지 못했어요.')),
    // 일부만 들어간 경우에도 목록이 맞게 보이도록 성공·실패 모두 다시 불러오기
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all }),
  })
}

/** 재료 수정 */
export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IngredientInput }) =>
      updateIngredient(id, input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all })
      toast.success(`${updated.name} 정보를 수정했어요.`)
    },
    onError: (error) => toast.error(getErrorMessage(error, '재료를 수정하지 못했어요.')),
  })
}

/**
 * 재료 삭제 — 낙관적 업데이트(Optimistic Update) + 실행 취소
 *
 * 1) onMutate: 서버 응답을 기다리지 않고 캐시에서 먼저 지움 → 화면이 즉시 반응
 * 2) onError:  실패하면 1)에서 저장해 둔 이전 목록으로 되돌림(롤백)
 * 3) onSuccess: "실행 취소" 버튼이 달린 토스트 표시
 * 4) onSettled: 성공/실패 상관없이 서버 데이터로 최종 동기화
 */
export function useDeleteIngredient() {
  const queryClient = useQueryClient()
  const key = queryKeys.ingredients.all

  return useMutation({
    mutationFn: (ingredient: Ingredient) => deleteIngredient(ingredient.id),

    onMutate: async (ingredient) => {
      // 진행 중인 조회 요청이 낙관적 결과를 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Ingredient[]>(key)
      queryClient.setQueryData<Ingredient[]>(key, (old) =>
        old?.filter((item) => item.id !== ingredient.id),
      )
      // 여기서 return한 값은 onError의 세 번째 인자(context)로 전달됩니다.
      return { previous }
    },

    onError: (error, _ingredient, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      toast.error(getErrorMessage(error, '재료를 삭제하지 못했어요.'))
    },

    onSuccess: (deleted) => {
      // sonner의 action: 토스트 안에 버튼을 달아 줍니다. 누르면 토스트는 자동으로 닫혀요.
      toast.success(`${withObjectParticle(deleted.name)} 삭제했어요.`, {
        duration: 6000, // 실행 취소를 누를 시간을 넉넉히
        action: {
          label: '실행 취소',
          onClick: () => {
            restoreIngredient(deleted)
              .then(() => queryClient.invalidateQueries({ queryKey: key }))
              .catch(() => toast.error('복원하지 못했어요.'))
          },
        },
      })
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
