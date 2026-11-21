import { Search, X } from 'lucide-react'
import { Input, Select } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { CATEGORY_META, STORAGE_LABEL } from '../constants'
import { useFridgeFilterStore, type IngredientSort } from '../stores/useFridgeFilterStore'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES, type Ingredient } from '../types'

const SORT_LABEL: Record<IngredientSort, string> = {
  expiry: '유통기한 임박순',
  name: '이름순',
  recent: '최근 등록순',
}

const chipBase =
  'inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors'
const chipOn = 'bg-ink-900 text-white'
const chipOff = 'bg-white text-ink-700 ring-1 ring-cream-300 hover:ring-ink-300'

/**
 * 냉장고 필터 영역: 검색 · 보관 위치 · 정렬 · 카테고리 칩
 *
 * 필터 값은 Zustand 스토어에서 직접 읽고 씁니다.
 * → 부모(FridgePage)가 props로 값을 일일이 내려주지 않아도 돼요 (props drilling 방지)
 */
export function FridgeFilterBar({ ingredients }: { ingredients: Ingredient[] }) {
  // 셀렉터로 필요한 값만 꺼내기: 이 값들이 바뀔 때만 리렌더링
  const category = useFridgeFilterStore((s) => s.category)
  const storage = useFridgeFilterStore((s) => s.storage)
  const search = useFridgeFilterStore((s) => s.search)
  const sort = useFridgeFilterStore((s) => s.sort)
  const setFilter = useFridgeFilterStore((s) => s.setFilter)

  // 카테고리별 개수 (칩 옆에 표시) — 0개인 카테고리는 칩을 숨겨 화면을 단순하게
  // (단, 지금 선택된 카테고리는 0개가 되어도 남겨 둬야 선택을 해제할 수 있어요)
  const countByCategory = new Map<string, number>()
  for (const item of ingredients) {
    countByCategory.set(item.category, (countByCategory.get(item.category) ?? 0) + 1)
  }
  const visibleCategories = INGREDIENT_CATEGORIES.filter(
    (c) => countByCategory.has(c) || c === category,
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* 검색 */}
        <div className="relative flex-1">
          <label htmlFor="fridge-search" className="sr-only">
            재료 검색
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-ink-300"
          />
          <Input
            id="fridge-search"
            type="search"
            value={search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="재료 이름으로 찾기"
            className="pr-10 pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setFilter({ search: '' })}
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-cream-100"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* 보관 위치: 3~4개뿐이라 select보다 버튼 묶음(세그먼트)이 한눈에 보여 편해요 */}
          <div
            role="group"
            aria-label="보관 위치"
            className="flex h-11 flex-1 rounded-xl bg-cream-200 p-1 sm:flex-none"
          >
            {(['all', ...STORAGE_TYPES] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter({ storage: value })}
                aria-pressed={storage === value}
                className="flex-1 rounded-lg px-3 text-sm font-semibold text-ink-500 transition-colors aria-pressed:bg-white aria-pressed:text-ink-900 aria-pressed:shadow-sm"
              >
                {value === 'all' ? '전체' : STORAGE_LABEL[value]}
              </button>
            ))}
          </div>

          <label htmlFor="fridge-sort" className="sr-only">
            정렬
          </label>
          <Select
            id="fridge-sort"
            value={sort}
            // select의 value는 string이라, 우리 타입으로 좁혀서 저장
            onChange={(e) => setFilter({ sort: e.target.value as IngredientSort })}
            className="w-auto"
          >
            {(Object.keys(SORT_LABEL) as IngredientSort[]).map((value) => (
              <option key={value} value={value}>
                {SORT_LABEL[value]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 카테고리 칩: 모바일에서는 가로 스크롤 */}
      <div
        role="group"
        aria-label="카테고리"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <button
          type="button"
          onClick={() => setFilter({ category: 'all' })}
          aria-pressed={category === 'all'}
          className={cn(chipBase, category === 'all' ? chipOn : chipOff)}
        >
          전체 <span className="opacity-60">{ingredients.length}</span>
        </button>
        {visibleCategories.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter({ category: value })}
            aria-pressed={category === value}
            className={cn(chipBase, category === value ? chipOn : chipOff)}
          >
            <span aria-hidden>{CATEGORY_META[value].emoji}</span>
            {CATEGORY_META[value].label}
            <span className="opacity-60">{countByCategory.get(value) ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
