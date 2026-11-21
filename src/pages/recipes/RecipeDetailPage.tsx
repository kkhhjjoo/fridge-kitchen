import { ArrowLeft, ChefHat, Clock, CookingPot, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { CompleteCookingDialog } from '@/features/recipes/components/CompleteCookingDialog'
import { FavoriteButton } from '@/features/recipes/components/FavoriteButton'
import { IngredientChecklist } from '@/features/recipes/components/IngredientChecklist'
import { StepList } from '@/features/recipes/components/StepList'
import { DIFFICULTY_LABEL } from '@/features/recipes/constants'
import { useRecipeRecommendation } from '@/features/recipes/hooks/useRecipeRecommendation'

function BackLink() {
  return (
    <Link
      to="/recipes"
      className="mb-4 inline-flex items-center gap-1 rounded-full text-sm font-semibold text-ink-500 hover:text-ink-900"
    >
      <ArrowLeft aria-hidden className="size-4" />
      추천 목록
    </Link>
  )
}

function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 py-3">
      <span className="text-brand-600">{icon}</span>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="font-bold text-ink-900">{value}</dd>
    </div>
  )
}

export function RecipeDetailPage() {
  // 라우트 /recipes/:recipeId 에서 recipeId를 꺼냄. 라우터 설정상 항상 있지만 타입은 string | undefined
  const { recipeId = '' } = useParams()
  const { recommendation, isPending, error } = useRecipeRecommendation(recipeId)
  // 훅은 항상 같은 순서로 호출돼야 하므로, 아래의 조기 return(if 문)보다 위에 둡니다 (Hooks 규칙)
  const [isCookingOpen, setIsCookingOpen] = useState(false)

  if (isPending) {
    return (
      <div aria-busy className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Skeleton className="aspect-4/3 rounded-card" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  // 에러(없는 id)이거나 데이터가 비어 있으면 안내 화면
  if (error || !recommendation) {
    return (
      <>
        <BackLink />
        <StateMessage
          icon={<span className="text-5xl" aria-hidden>🍽️</span>}
          title="레시피를 찾을 수 없어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요."
          action={
            <Link to="/recipes" className={buttonStyles()}>
              다른 레시피 보기
            </Link>
          }
        />
      </>
    )
  }

  const { recipe, matchRate } = recommendation

  return (
    <article>
      <BackLink />

      {/* 상단: 데스크톱은 사진 | 정보 2단, 모바일은 위아래 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div className="relative overflow-hidden rounded-card bg-cream-200">
          <img
            src={recipe.imageUrl}
            alt={`완성된 ${recipe.title}`}
            className="aspect-4/3 size-full object-cover"
          />
          <FavoriteButton
            recipeId={recipe.id}
            recipeTitle={recipe.title}
            className="absolute top-4 right-4 size-12"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="brand">재료 {matchRate}% 보유</Badge>
            {recipe.tags.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {recipe.title}
          </h1>
          <p className="mt-2 text-ink-500">{recipe.description}</p>

          {/* dl(설명 목록): "항목 이름 - 값" 쌍을 표현하는 시맨틱 태그 */}
          <dl className="mt-6 flex divide-x divide-cream-200 rounded-2xl bg-white shadow-card">
            <MetaItem
              icon={<Clock aria-hidden className="size-5" />}
              label="조리 시간"
              value={`${recipe.cookingTimeMinutes}분`}
            />
            <MetaItem
              icon={<ChefHat aria-hidden className="size-5" />}
              label="난이도"
              value={DIFFICULTY_LABEL[recipe.difficulty]}
            />
            <MetaItem
              icon={<Users aria-hidden className="size-5" />}
              label="분량"
              value={`${recipe.servings}인분`}
            />
          </dl>
        </div>
      </div>

      {/* 하단: 재료 | 조리 순서 */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <section aria-labelledby="ingredients-title">
          <h2 id="ingredients-title" className="mb-4 text-lg font-bold text-ink-900 sm:text-xl">
            재료
          </h2>
          <IngredientChecklist recommendation={recommendation} />
        </section>

        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="mb-4 text-lg font-bold text-ink-900 sm:text-xl">
            조리 순서
          </h2>
          <StepList steps={recipe.steps} />

          {/* 냉장고 재료를 하나도 안 쓰는 레시피라면 차감할 것이 없으므로 버튼을 숨김 */}
          {recommendation.availableIngredients.length > 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-4 text-center">
              <p className="text-sm text-ink-700">요리를 마쳤다면 사용한 재료를 정리해 주세요.</p>
              <Button size="lg" className="mt-3 w-full" onClick={() => setIsCookingOpen(true)}>
                <CookingPot aria-hidden className="size-5" />
                요리 완료 · 재료 정리하기
              </Button>
            </div>
          )}
        </section>
      </div>

      <CompleteCookingDialog
        open={isCookingOpen}
        recommendation={recommendation}
        onClose={() => setIsCookingOpen(false)}
      />
    </article>
  )
}
