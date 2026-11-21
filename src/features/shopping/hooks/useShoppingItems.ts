import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchShoppingItems } from '@/api/shopping'

export function useShoppingItems() {
  return useQuery({
    queryKey: queryKeys.shopping.all,
    queryFn: fetchShoppingItems,
  })
}
