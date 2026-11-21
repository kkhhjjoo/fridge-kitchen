import { CircleCheck, CircleDashed, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ExpiryBadge } from '@/features/fridge/components/ExpiryBadge'
import { useAddShoppingItems } from '@/features/shopping/hooks/useShoppingMutations'
import type { RecipeIngredient, RecipeRecommendation } from '../types'

/** 2 → "2", 0.5 → "0.5" 처럼 불필요한 소수점 없이 표시 */
const formatAmount = ({ quantity, unit }: Pick<RecipeIngredient, 'quantity' | 'unit'>) =>
  `${Number(quantity.toFixed(2))}${unit}`

/**
 * 레시피 재료 체크리스트 — "있는 재료"와 "부족한 재료"를 나눠 보여 줍니다.
 */
export function IngredientChecklist({ recommendation }: { recommendation: RecipeRecommendation }) {
  const { recipe, availableIngredients, missingIngredients } = recommendation
  const addToShopping = useAddShoppingItems()

  return (
    <div className="space-y-6">
      {missingIngredients.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-accent-600">
            <CircleDashed aria-hidden className="size-4" />
            부족한 재료 {missingIngredients.length}개
          </h3>
          <ul className="divide-y divide-cream-200 rounded-2xl bg-accent-50 px-4 ring-1 ring-accent-100">
            {missingIngredients.map((item) => (
              <li key={item.name} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold text-ink-900">{item.name}</span>
                <span className="text-ink-500">{formatAmount(item)}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="accent"
            className="mt-3 w-full"
            disabled={addToShopping.isPending}
            onClick={() =>
              addToShopping.mutate(
                missingIngredients.map((item) => ({ ...item, recipeId: recipe.id })),
              )
            }
          >
            <ShoppingCart aria-hidden className="size-4" />
            {addToShopping.isPending ? '담는 중…' : '부족한 재료 장보기에 담기'}
          </Button>
        </div>
      )}

      {availableIngredients.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-brand-700">
            <CircleCheck aria-hidden className="size-4" />
            냉장고에 있는 재료 {availableIngredients.length}개
          </h3>
          <ul className="divide-y divide-cream-200 rounded-2xl bg-white px-4 shadow-card">
            {availableIngredients.map((item) => (
              <li key={item.name} className="flex items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">
                    필요 {formatAmount(item)} · 보유 {formatAmount(item.owned)}
                  </p>
                </div>
                {/* 기한 없는 재료(소금 등)에는 배지를 굳이 표시하지 않음 */}
                {item.owned.expiresAt && <ExpiryBadge expiresAt={item.owned.expiresAt} />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
