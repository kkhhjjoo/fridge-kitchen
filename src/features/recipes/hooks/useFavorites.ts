import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { addFavorite, fetchFavoriteIds, removeFavorite } from '@/api/favorites'
import { queryKeys } from '@/api/queryKeys'

const favoritesKey = queryKeys.favorites.all

/**
 * 즐겨찾기 — M3에서는 Zustand(브라우저 저장)였지만, 이제 사용자별로 DB에 저장되는 "서버 상태"라
 * TanStack Query로 옮겼어요. (다른 기기에서 로그인해도 즐겨찾기가 그대로 보입니다)
 */
function useFavoriteIdsQuery() {
  return useQuery({ queryKey: favoritesKey, queryFn: fetchFavoriteIds })
}

/** 즐겨찾기한 레시피 id 집합 (has()로 빠르게 조회) */
export function useFavoriteIds(): ReadonlySet<string> {
  const { data } = useFavoriteIdsQuery()
  return useMemo(() => new Set(data), [data])
}

/** 특정 레시피가 즐겨찾기인지 */
export function useIsFavorite(recipeId: string): boolean {
  const { data } = useFavoriteIdsQuery()
  return data?.includes(recipeId) ?? false
}

/** 즐겨찾기 추가/해제 — 하트가 즉시 바뀌도록 낙관적 업데이트 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recipeId, favorite }: { recipeId: string; favorite: boolean }) =>
      favorite ? addFavorite(recipeId) : removeFavorite(recipeId),

    onMutate: async ({ recipeId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKey })
      const previous = queryClient.getQueryData<string[]>(favoritesKey)
      queryClient.setQueryData<string[]>(favoritesKey, (old = []) =>
        favorite ? [...old, recipeId] : old.filter((id) => id !== recipeId),
      )
      return { previous }
    },
    onSuccess: (_data, { favorite }) => {
      toast.success(favorite ? '즐겨찾기에 담았어요.' : '즐겨찾기에서 뺐어요.')
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(favoritesKey, context.previous)
      toast.error(error.message || '즐겨찾기를 바꾸지 못했어요.')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoritesKey }),
  })
}
