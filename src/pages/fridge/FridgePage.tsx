import { Plus, RotateCw, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { FridgeFilterBar } from '@/features/fridge/components/FridgeFilterBar'
import { IngredientCard } from '@/features/fridge/components/IngredientCard'
import {
  IngredientFormDialog,
  type IngredientEditorState,
} from '@/features/fridge/components/IngredientFormDialog'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import { useDeleteIngredient } from '@/features/fridge/hooks/useIngredientMutations'
import {
  hasActiveFilter,
  useFridgeFilterStore,
} from '@/features/fridge/stores/useFridgeFilterStore'
import { getExpiryStatus } from '@/features/fridge/utils/expiry'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { filterIngredients } from '@/features/fridge/utils/filterIngredients'

/**
 * 내 냉장고 페이지
 * - 데이터: useIngredients (TanStack Query)
 * - 필터: useFridgeFilterStore (Zustand)
 * - 등록/수정: IngredientFormDialog (React Hook Form + Zod)
 * - 삭제: useDeleteIngredient (낙관적 업데이트 + 실행 취소 토스트)
 */
export function FridgePage() {
  const { data: ingredients, isPending, isError, refetch } = useIngredients()
  const deleteMutation = useDeleteIngredient()

  // useShallow 없이 객체를 통째로 구독하면 매번 새 객체라 무한 렌더링 위험 → 필드별로 구독
  const category = useFridgeFilterStore((s) => s.category)
  const storage = useFridgeFilterStore((s) => s.storage)
  const search = useFridgeFilterStore((s) => s.search)
  const sort = useFridgeFilterStore((s) => s.sort)
  const resetFilter = useFridgeFilterStore((s) => s.resetFilter)

  // 홈의 "재료 등록하기" 버튼은 /fridge?new=1 로 이동 → 들어오자마자 등록 창 열기
  const [searchParams, setSearchParams] = useSearchParams()
  const [editor, setEditor] = useState<IngredientEditorState>(() =>
    searchParams.get('new') === '1' ? { mode: 'create' } : null,
  )

  const closeEditor = () => {
    setEditor(null)
    if (searchParams.has('new')) setSearchParams({}, { replace: true }) // 주소창 정리
  }

  const filter = { category, storage, search, sort }
  const visibleIngredients = useMemo(
    () => (ingredients ? filterIngredients(ingredients, { category, storage, search, sort }) : []),
    [ingredients, category, storage, search, sort],
  )

  const soonDays = useExpirySoonDays()
  const expiredCount = ingredients?.filter((i) => getExpiryStatus(i.expiresAt, soonDays) === 'expired').length ?? 0
  const soonCount = ingredients?.filter((i) => getExpiryStatus(i.expiresAt, soonDays) === 'soon').length ?? 0

  const addButton = (
    <Button onClick={() => setEditor({ mode: 'create' })}>
      <Plus aria-hidden className="size-5" />
      재료 추가
    </Button>
  )

  // ── 화면 상태별 본문 ──────────────────────────────
  let content
  if (isPending) {
    content = (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-2xl" />
        ))}
      </div>
    )
  } else if (isError) {
    content = (
      <StateMessage
        title="재료 목록을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" onClick={() => void refetch()}>
            <RotateCw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (ingredients.length === 0) {
    // 처음 사용하는 사용자: 다음 행동을 분명하게 안내
    content = (
      <StateMessage
        icon={<span className="text-5xl" aria-hidden>🧊</span>}
        title="냉장고가 비어 있어요"
        description="가지고 있는 재료를 등록하면 만들 수 있는 요리를 추천해 드려요."
        action={addButton}
      />
    )
  } else {
    content = (
      <div className="space-y-5">
        <FridgeFilterBar ingredients={ingredients} />

        {/* 결과 개수를 스크린리더에도 알려 줌 (필터를 바꿀 때마다 읽힘) */}
        <p className="text-sm text-ink-500" aria-live="polite">
          {visibleIngredients.length}개의 재료
        </p>

        {visibleIngredients.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleIngredients.map((ingredient) => (
              <li key={ingredient.id}>
                <IngredientCard
                  ingredient={ingredient}
                  onEdit={(item) => setEditor({ mode: 'edit', ingredient: item })}
                  onDelete={(item) => deleteMutation.mutate(item)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <StateMessage
            icon={<SearchX aria-hidden className="size-8" />}
            title="조건에 맞는 재료가 없어요"
            description={hasActiveFilter(filter) ? '필터나 검색어를 바꿔 보세요.' : undefined}
            action={
              <Button variant="secondary" onClick={resetFilter}>
                필터 초기화
              </Button>
            }
          />
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="내 냉장고"
        description={
          ingredients && ingredients.length > 0
            ? `보관 중 ${ingredients.length}개 · 임박 ${soonCount}개 · 기한 지남 ${expiredCount}개`
            : '보관 중인 식재료를 한눈에 관리하세요.'
        }
        // 데스크톱: 제목 옆 버튼 / 모바일: 아래 플로팅 버튼
        actions={<div className="hidden md:block">{addButton}</div>}
      />

      {content}

      {/* 모바일 플로팅 추가 버튼 (하단 탭바 위) — 스크롤해도 언제든 누를 수 있게 */}
      <Button
        onClick={() => setEditor({ mode: 'create' })}
        aria-label="재료 추가"
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 p-0 shadow-lg md:hidden"
      >
        <Plus aria-hidden className="size-6" />
      </Button>

      <IngredientFormDialog state={editor} onClose={closeEditor} />
    </>
  )
}
