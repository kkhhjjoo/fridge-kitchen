import { ChefHat, ChevronDown, Clock, Lightbulb, ShoppingCart, Sparkles, Users } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Ingredient } from '@/features/fridge/types'
import { useAddShoppingItems } from '@/features/shopping/hooks/useShoppingMutations'
import type { AiRecipe } from '../aiChefTypes'
import { DIFFICULTY_LABEL } from '../constants'
import { matchRecipe } from '../utils/match'

/** 늘 집에 있다고 보는 기본 양념 — "부족한 재료"와 장보기에서 뺍니다 */
const PANTRY_BASICS = new Set(['소금', '설탕', '후추', '식용유', '물'])

interface AiRecipeCardProps {
  recipe: AiRecipe
  fridge: Ingredient[]
  soonDays: number
}

/**
 * AI 셰프가 만든 레시피 카드
 * 사진이 없는 일회성 레시피라 글 중심으로 보여 주고, 만드는 법은 눌러서 펼칩니다.
 * 있는/부족한 재료는 기존 추천과 같은 함수(matchRecipe)로 계산해서 화면끼리 기준이 같아요.
 */
export function AiRecipeCard({ recipe, fridge, soonDays }: AiRecipeCardProps) {
  const [open, setOpen] = useState(false)
  const stepsId = useId()
  const addShopping = useAddShoppingItems()

  const { availableIngredients, missingIngredients } = useMemo(
    // matchRecipe는 Recipe 모양을 받으므로 없는 칸(id, 사진, 태그)만 채워서 넘깁니다
    () => matchRecipe({ ...recipe, id: 'ai', imageUrl: '', tags: [] }, fridge, soonDays),
    [recipe, fridge, soonDays],
  )
  const toBuy = missingIngredients.filter((item) => !PANTRY_BASICS.has(item.name))

  return (
    <article className="flex h-full flex-col rounded-card bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-ink-900">{recipe.title}</h3>
        <Badge tone="accent" className="shrink-0">
          <Sparkles aria-hidden className="size-3" />
          AI 추천
        </Badge>
      </div>
      <p className="mt-1 text-sm text-ink-500">{recipe.description}</p>

      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden className="size-3.5" />
          {recipe.cookingTimeMinutes}분
        </span>
        <span className="inline-flex items-center gap-1">
          <ChefHat aria-hidden className="size-3.5" />
          {DIFFICULTY_LABEL[recipe.difficulty]}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users aria-hidden className="size-3.5" />
          {recipe.servings}인분
        </span>
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        {availableIngredients.length > 0 && (
          <div>
            <dt className="mb-1 font-semibold text-ink-700">있는 재료</dt>
            <dd className="flex flex-wrap gap-1.5">
              {availableIngredients.map((item) => (
                <Badge key={item.name} tone="brand">
                  {item.name}
                </Badge>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt className="mb-1 font-semibold text-ink-700">더 필요한 재료</dt>
          <dd className="flex flex-wrap gap-1.5">
            {toBuy.length === 0 ? (
              <span className="text-brand-700">없어요. 바로 만들 수 있어요!</span>
            ) : (
              toBuy.map((item) => (
                <Badge key={item.name} tone="accent">
                  {item.name} {item.quantity > 0 && `${item.quantity}${item.unit}`}
                </Badge>
              ))
            )}
          </dd>
        </div>
      </dl>

      {/* 만드는 법: 눌러서 펼치기 (aria-expanded로 펼침 상태를 알려 줌) */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 self-start px-2"
        aria-expanded={open}
        aria-controls={stepsId}
        onClick={() => setOpen((prev) => !prev)}
      >
        만드는 법 {open ? '접기' : '보기'}
        <ChevronDown aria-hidden className={open ? 'size-4 rotate-180' : 'size-4'} />
      </Button>
      <div id={stepsId} hidden={!open}>
        <ol className="mt-2 space-y-2">
          {recipe.steps.map((step, index) => (
            <li key={index} className="flex gap-2.5 text-sm text-ink-700">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        {recipe.tip && (
          <p className="mt-3 flex gap-1.5 rounded-xl bg-cream-100 p-3 text-sm text-ink-700">
            <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-500" />
            {recipe.tip}
          </p>
        )}
      </div>

      {toBuy.length > 0 && (
        // mt-auto: 카드 높이가 달라도 버튼을 맨 아래에 맞춤, pt-4: 위 내용과 최소 간격
        <div className="mt-auto pt-4">
        <Button
          variant="secondary"
          className="w-full"
          disabled={addShopping.isPending}
          onClick={() =>
            addShopping.mutate(
              toBuy.map((item) => ({
                name: item.name,
                // 수량을 모르면 1개로 (장보기에서 고칠 수 있어요)
                quantity: item.quantity > 0 ? item.quantity : 1,
                unit: item.quantity > 0 ? item.unit : '개',
                recipeId: null, // AI 레시피는 DB에 저장되지 않아 연결할 레시피가 없음
              })),
            )
          }
        >
          <ShoppingCart aria-hidden className="size-4" />
          부족한 재료 장보기에 담기
        </Button>
        </div>
      )}
    </article>
  )
}
