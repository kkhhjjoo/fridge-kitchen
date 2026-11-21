import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IngredientCategory, StorageType } from '../types'

export type IngredientSort = 'expiry' | 'name' | 'recent'

export interface FridgeFilter {
  category: IngredientCategory | 'all'
  storage: StorageType | 'all'
  search: string
  sort: IngredientSort
}

interface FridgeFilterState extends FridgeFilter {
  /** 여러 필드를 한 번에 바꾸는 범용 setter: setFilter({ category: 'meat' }) */
  setFilter: (patch: Partial<FridgeFilter>) => void
  resetFilter: () => void
}

const DEFAULT_FILTER: FridgeFilter = {
  category: 'all',
  storage: 'all',
  search: '',
  sort: 'expiry',
}

/**
 * 냉장고 목록 필터 상태
 *
 * persist 미들웨어: 상태를 localStorage에 자동 저장/복원합니다.
 * partialize로 "정렬 방식"만 저장 → 사용자가 고른 정렬은 다음 방문에도 유지되지만,
 * 검색어나 카테고리 필터는 매번 초기화되어 "재료가 사라졌다"는 오해를 막습니다.
 */
export const useFridgeFilterStore = create<FridgeFilterState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTER,
      setFilter: (patch) => set(patch),
      resetFilter: () => set(DEFAULT_FILTER),
    }),
    {
      name: 'fridge-kitchen:fridge-filter',
      partialize: (state) => ({ sort: state.sort }),
    },
  ),
)

/** 정렬 외의 필터가 하나라도 걸려 있는지 (빈 결과 안내 문구에 사용) */
export function hasActiveFilter(filter: FridgeFilter): boolean {
  return filter.category !== 'all' || filter.storage !== 'all' || filter.search.trim() !== ''
}
