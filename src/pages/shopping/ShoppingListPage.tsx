import { Refrigerator, RotateCw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'
import { AddShoppingItemForm } from '@/features/shopping/components/AddShoppingItemForm'
import { ShoppingItemRow } from '@/features/shopping/components/ShoppingItemRow'
import { StockToFridgeDialog } from '@/features/shopping/components/StockToFridgeDialog'
import {
  useDeleteShoppingItems,
  useToggleShoppingItem,
} from '@/features/shopping/hooks/useShoppingMutations'
import { useShoppingItems } from '@/features/shopping/hooks/useShoppingItems'
import type { ShoppingItem } from '@/features/shopping/types'

/**
 * 장보기 목록 페이지
 * "살 것"과 "장바구니에 담은 것(체크됨)" 두 구역으로 나누고,
 * 체크한 항목은 "냉장고에 넣기"로 한 번에 내 냉장고에 등록합니다.
 */
export function ShoppingListPage() {
  const { data: items, isPending, isError, refetch } = useShoppingItems()
  const { data: recipes } = useRecipes()
  const toggle = useToggleShoppingItem()
  const remove = useDeleteShoppingItems()
  const [isStockOpen, setIsStockOpen] = useState(false)

  // 레시피 id → 제목 (출처 표시용). 레시피 목록이 바뀔 때만 다시 만듦
  const recipeTitleById = useMemo(
    () => new Map(recipes?.map((recipe) => [recipe.id, recipe.title])),
    [recipes],
  )

  const toBuy = items?.filter((item) => !item.isChecked) ?? []
  const inCart = items?.filter((item) => item.isChecked) ?? []

  const handleToggle = (item: ShoppingItem) => toggle.mutate({ id: item.id, isChecked: !item.isChecked })
  const handleDelete = (item: ShoppingItem) => remove.mutate([item.id])

  const renderRows = (list: ShoppingItem[]) => (
    <ul className="space-y-2">
      {list.map((item) => (
        <li key={item.id}>
          <ShoppingItemRow
            item={item}
            recipeTitle={item.recipeId ? recipeTitleById.get(item.recipeId) : undefined}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </li>
      ))}
    </ul>
  )

  let content
  if (isPending) {
    content = (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    )
  } else if (isError) {
    content = (
      <StateMessage
        title="장보기 목록을 불러오지 못했어요"
        action={
          <Button variant="secondary" onClick={() => void refetch()}>
            <RotateCw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (items.length === 0) {
    content = (
      <StateMessage
        icon={<span className="text-5xl" aria-hidden>🛒</span>}
        title="장보기 목록이 비어 있어요"
        description="위에서 직접 추가하거나, 레시피의 부족한 재료를 담아 보세요."
      />
    )
  } else {
    content = (
      <div className="space-y-8">
        <section aria-labelledby="to-buy-title">
          <h2 id="to-buy-title" className="mb-3 font-bold text-ink-900">
            살 것 <span className="text-ink-500">{toBuy.length}</span>
          </h2>
          {toBuy.length > 0 ? (
            renderRows(toBuy)
          ) : (
            <p className="rounded-2xl bg-cream-50 p-4 text-center text-sm text-ink-500">
              모두 담았어요! 👏
            </p>
          )}
        </section>

        {inCart.length > 0 && (
          <section aria-labelledby="in-cart-title">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="in-cart-title" className="font-bold text-ink-900">
                장바구니에 담음 <span className="text-ink-500">{inCart.length}</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate(inCart.map((item) => item.id))}
              >
                <Trash2 aria-hidden className="size-4" />
                완료 항목 삭제
              </Button>
            </div>
            {renderRows(inCart)}
            <Button className="mt-4 w-full" size="lg" onClick={() => setIsStockOpen(true)}>
              <Refrigerator aria-hidden className="size-5" />
              {inCart.length}개 냉장고에 넣기
            </Button>
          </section>
        )}
      </div>
    )
  }

  return (
    // 목록형 화면이라 너무 넓으면 읽기 불편 → 최대 너비 제한
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="장보기 목록"
        description={
          items && items.length > 0
            ? `살 것 ${toBuy.length}개 · 담은 것 ${inCart.length}개`
            : '부족한 재료를 잊지 말고 챙기세요.'
        }
      />
      <div className="mb-8">
        <AddShoppingItemForm />
      </div>
      {content}

      <StockToFridgeDialog open={isStockOpen} items={inCart} onClose={() => setIsStockOpen(false)} />
    </div>
  )
}
