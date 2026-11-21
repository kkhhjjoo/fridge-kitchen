import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StateMessage } from '@/components/ui/StateMessage'
import { RecipeCard, RecipeCardSkeleton } from '@/features/recipes/components/RecipeCard'
import { useRecipeRecommendations } from '@/features/recipes/hooks/useRecipeRecommendations'

const MAX_VISIBLE = 4

export function RecommendedSection() {
  const { recommendations, isPending, isError, refetch } = useRecipeRecommendations()

  return (
    <section aria-labelledby="recommended-title">
      <SectionHeader
        id="recommended-title"
        title="지금 만들 수 있는 요리"
        description="내 냉장고 재료와 가장 잘 맞는 레시피예요"
        moreLink={{ to: '/recipes', label: '더 보기' }}
      />

      {isError ? (
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
      ) : (
        // aria-busy: 로딩 중임을 스크린리더에 알려 줍니다.
        <ul aria-busy={isPending} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: MAX_VISIBLE }, (_, i) => (
                <li key={i}>
                  <RecipeCardSkeleton />
                </li>
              ))
            : recommendations.slice(0, MAX_VISIBLE).map((item) => (
                <li key={item.recipe.id}>
                  <RecipeCard recommendation={item} />
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}
