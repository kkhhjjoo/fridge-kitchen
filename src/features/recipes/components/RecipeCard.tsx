import { CircleCheck, ChefHat, Clock, Leaf } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { DIFFICULTY_LABEL } from '../constants'
import type { RecipeRecommendation } from '../types'
import { FavoriteButton } from './FavoriteButton'

interface RecipeCardProps {
  recommendation: RecipeRecommendation
  /** true면 부족한 재료 이름까지 표시 ("조금 부족해요" 목록용) */
  showMissingNames?: boolean
}

/**
 * 레시피 추천 카드 — 음식 사진을 크게 보여주는 이미지 중심 카드
 *
 * 구조 포인트: <Link> 안에 <button>을 넣으면 HTML 규칙 위반(대화형 요소 중첩)이라
 * 카드 전체를 relative 박스로 만들고, 하트 버튼은 Link 바깥 형제로 두어 위에 겹쳐 배치했어요.
 */
export function RecipeCard({ recommendation, showMissingNames = false }: RecipeCardProps) {
  const { recipe, matchRate, missingIngredients, expiringCount } = recommendation
  const canCookNow = missingIngredients.length === 0

  return (
    <div className="group relative h-full">
      <Link
        to={`/recipes/${recipe.id}`}
        className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-cream-200">
          <img
            src={recipe.imageUrl}
            alt="" // 제목이 바로 아래 있으므로 장식용 이미지로 처리 (스크린리더 중복 낭독 방지)
            loading="lazy" // 화면에 보일 때 로드 → 초기 로딩 속도 개선
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            <Badge tone="brand" className="bg-white/95 shadow-sm">
              재료 {matchRate}% 보유
            </Badge>
            {expiringCount > 0 && (
              <Badge tone="accent" className="shadow-sm">
                <Leaf aria-hidden className="size-3" />
                임박 재료 {expiringCount}개 활용
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-bold text-ink-900 group-hover:text-brand-700">{recipe.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-500">{recipe.description}</p>

          {showMissingNames && !canCookNow && (
            <p className="mt-2 text-sm text-accent-600">
              <span className="font-semibold">부족:</span>{' '}
              {missingIngredients.map((item) => item.name).join(', ')}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden className="size-3.5" />
              {recipe.cookingTimeMinutes}분
            </span>
            <span className="inline-flex items-center gap-1">
              <ChefHat aria-hidden className="size-3.5" />
              {DIFFICULTY_LABEL[recipe.difficulty]}
            </span>
            <span className="ml-auto">
              {canCookNow ? (
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                  <CircleCheck aria-hidden className="size-3.5" />
                  바로 만들 수 있어요
                </span>
              ) : (
                <span className="font-semibold text-accent-600">
                  부족 재료 {missingIngredients.length}개
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>

      <FavoriteButton
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        className="absolute top-3 right-3"
      />
    </div>
  )
}

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-white shadow-card">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
