import { Heart, RotateCcw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StateMessage } from '@/components/ui/StateMessage'
import { RecipeCard, RecipeCardSkeleton } from '@/features/recipes/components/RecipeCard'
import { useFavoriteIds } from '@/features/recipes/hooks/useFavorites'
import { useRecipeRecommendations } from '@/features/recipes/hooks/useRecipeRecommendations'

/**
 * 즐겨찾기한 레시피 목록
 * 추천 목록(내 냉장고 기준 보유율 계산 포함)에서 즐겨찾기한 것만 골라 보여 줍니다.
 * → 레시피 화면과 똑같은 카드를 쓰고, 하트를 누르면 여기서도 바로 빠져요.
 */
export function FavoritesSection() {
  const favoriteIds = useFavoriteIds()
  const { recommendations, isPending, isError, refetch } = useRecipeRecommendations()
  const favorites = recommendations.filter((item) => favoriteIds.has(item.recipe.id))

  let content
  if (isPending) {
    content = (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <RecipeCardSkeleton />
          </li>
        ))}
      </ul>
    )
  } else if (isError) {
    content = (
      <StateMessage
        title="즐겨찾기를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" onClick={refetch}>
            <RotateCcw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (favorites.length === 0) {
    content = (
      <StateMessage
        icon={<Heart aria-hidden className="size-8" />}
        title="아직 즐겨찾기한 레시피가 없어요"
        description="레시피 카드의 하트를 누르면 여기에 모여요."
        action={
          <Link to="/recipes" className={buttonStyles({ variant: 'secondary' })}>
            레시피 보러 가기
          </Link>
        }
      />
    )
  } else {
    content = (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((recommendation) => (
          <li key={recommendation.recipe.id}>
            <RecipeCard recommendation={recommendation} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="favorites-title">
      <SectionHeader
        id="favorites-title"
        title="즐겨찾기 레시피"
        description={favorites.length > 0 ? `${favorites.length}개를 담아 두었어요` : undefined}
      />
      {content}
    </section>
  )
}
