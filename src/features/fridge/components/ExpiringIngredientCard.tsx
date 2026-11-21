import { formatMonthDay } from '@/lib/date'
import { CATEGORY_META, STORAGE_LABEL } from '../constants'
import type { Ingredient } from '../types'
import { ExpiryBadge } from './ExpiryBadge'

/** 유통기한 임박 재료 카드 (홈 화면 가로 스크롤 목록용) */
export function ExpiringIngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const category = CATEGORY_META[ingredient.category]

  return (
    <article className="flex h-full flex-col gap-3 rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span
          className="grid size-11 place-items-center rounded-2xl bg-cream-100 text-2xl"
          role="img"
          aria-label={category.label}
        >
          {category.emoji}
        </span>
        <ExpiryBadge expiresAt={ingredient.expiresAt} />
      </div>
      <div>
        <h3 className="font-bold text-ink-900">{ingredient.name}</h3>
        <p className="mt-0.5 text-sm text-ink-500">
          {ingredient.quantity}
          {ingredient.unit} · {STORAGE_LABEL[ingredient.storage]}
        </p>
      </div>
      {ingredient.expiresAt && (
        <p className="mt-auto text-xs text-ink-500">
          <time dateTime={ingredient.expiresAt}>{formatMonthDay(ingredient.expiresAt)}</time>까지
        </p>
      )}
    </article>
  )
}
