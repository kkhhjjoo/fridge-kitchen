import { useQuery } from '@tanstack/react-query'
import { fetchCookingLogs } from '@/api/cookingLogs'
import { queryKeys } from '@/api/queryKeys'

/** 내 요리 기록 (최근 것이 맨 앞) */
export function useCookingLogs() {
  return useQuery({ queryKey: queryKeys.cookingLogs.all, queryFn: fetchCookingLogs })
}
