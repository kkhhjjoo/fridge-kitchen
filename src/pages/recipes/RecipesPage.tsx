import { RotateCw, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { PageHeader } from '@/components/ui/PageHeader'
import { StateMessage } from '@/components/ui/StateMessage'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import { AiChefPanel } from '@/features/recipes/components/AiChefPanel'
import { RecipeCard, RecipeCardSkeleton } from '@/features/recipes/components/RecipeCard'
import { RecipeFilterBar } from '@/features/recipes/components/RecipeFilterBar'
import { useRecipeRecommendations } from '@/features/recipes/hooks/useRecipeRecommendations'
import { useFavoriteIds } from '@/features/recipes/hooks/useFavorites'
import type { RecipeRecommendation } from '@/features/recipes/types'
import {
  ALMOST_MISSING_LIMIT,
  DEFAULT_RECIPE_FILTER,
  filterRecommendations,
  groupRecommendations,
  type RecipeFilter,
} from '@/features/recipes/utils/recommendFilter'

interface RecipeGroupProps {
  id: string
  title: string
  description: string
  items: RecipeRecommendation[]
  showMissingNames?: boolean
}

/** 추천 그룹 하나 (예: "지금 바로 만들 수 있어요") — 비어 있으면 그리지 않음 */
function RecipeGroup({ id, title, description, items, showMissingNames }: RecipeGroupProps) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={id}>
      <div className="mb-4">
        <h2 id={id} className="flex items-center gap-2 text-lg font-bold text-ink-900 sm:text-xl">
          {title}
          <Badge>{items.length}</Badge>
        </h2>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.recipe.id}>
            <RecipeCard recommendation={item} showMissingNames={showMissingNames} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RecipesPage() {
  // 필터는 이 페이지에서만 쓰는 상태라 useState로 충분 (전역 스토어까지는 필요 없음)
  const [filter, setFilter] = useState<RecipeFilter>(DEFAULT_RECIPE_FILTER)
  const updateFilter = (patch: Partial<RecipeFilter>) => setFilter((prev) => ({ ...prev, ...patch }))

  const ingredientsQuery = useIngredients()
  const { recommendations, isPending, isError, refetch } = useRecipeRecommendations({
    prioritizeExpiring: filter.prioritizeExpiring,
  })

  const favoriteIds = useFavoriteIds()

  const groups = useMemo(
    () => groupRecommendations(filterRecommendations(recommendations, filter, favoriteIds)),
    [recommendations, filter, favoriteIds],
  )
  const totalCount = groups.ready.length + groups.almost.length + groups.more.length
  const fridgeCount = ingredientsQuery.data?.length

  let content
  if (isPending) {
    content = (
      <ul aria-busy className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i}>
            <RecipeCardSkeleton />
          </li>
        ))}
      </ul>
    )
  } else if (isError) {
    content = (
      <StateMessage
        title="추천을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" onClick={refetch}>
            <RotateCw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (fridgeCount === 0) {
    content = (
      <StateMessage
        icon={<span className="text-5xl" aria-hidden>🧊</span>}
        title="냉장고가 비어 있어요"
        description="재료를 등록하면 만들 수 있는 요리를 추천해 드려요."
        action={
          <Link to="/fridge?new=1" className={buttonStyles()}>
            재료 등록하기
          </Link>
        }
      />
    )
  } else if (totalCount === 0) {
    content = (
      <StateMessage
        icon={<SearchX aria-hidden className="size-8" />}
        title="조건에 맞는 레시피가 없어요"
        description="추천 기준을 조금 넓혀 보세요."
        action={
          <Button variant="secondary" onClick={() => setFilter(DEFAULT_RECIPE_FILTER)}>
            기준 초기화
          </Button>
        }
      />
    )
  } else {
    content = (
      <div className="space-y-12">
        <RecipeGroup
          id="group-ready"
          title="지금 바로 만들 수 있어요"
          description="필요한 재료가 냉장고에 모두 있어요."
          items={groups.ready}
        />
        <RecipeGroup
          id="group-almost"
          title="재료가 조금 부족해요"
          description={`${ALMOST_MISSING_LIMIT}개 이하만 사면 만들 수 있어요.`}
          items={groups.almost}
          showMissingNames
        />
        <RecipeGroup
          id="group-more"
          title="장을 보면 만들 수 있어요"
          description="재료가 여러 개 필요하지만 도전해 볼 만해요."
          items={groups.more}
          showMissingNames
        />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="AI 레시피 추천"
        description={
          fridgeCount
            ? `냉장고 재료 ${fridgeCount}개를 기준으로 추천해 드려요.`
            : '내 냉장고 재료로 만들 수 있는 요리를 추천해 드려요.'
        }
      />

      {/* AI 셰프: 취향을 적으면 서버 함수 → Claude가 새 레시피를 만들어 줌 (M6) */}
      <div className="mb-10">
        <AiChefPanel fridge={ingredientsQuery.data} />
      </div>

      <h2 className="mb-3 text-lg font-bold text-ink-900 sm:text-xl">내 냉장고로 만들 수 있는 레시피</h2>
      <div className="mb-8">
        <RecipeFilterBar filter={filter} onChange={updateFilter} />
      </div>

      {content}
    </>
  )
}
