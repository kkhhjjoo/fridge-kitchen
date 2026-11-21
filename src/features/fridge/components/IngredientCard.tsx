import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatMonthDay } from '@/lib/date'
import { CATEGORY_META, STORAGE_LABEL } from '../constants'
import type { Ingredient } from '../types'
import { getExpiryStatus } from '../utils/expiry'
import { ExpiryBadge } from './ExpiryBadge'

interface IngredientCardProps {
  ingredient: Ingredient
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredient: Ingredient) => void
}

/** 내 냉장고 목록의 재료 한 줄 */
export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  const category = CATEGORY_META[ingredient.category]
  const isExpired = getExpiryStatus(ingredient.expiresAt) === 'expired'

  return (
    <article
      className={cn(
        'flex items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-card',
        // 유통기한 지난 재료는 빨간 테두리로 한 번 더 강조 (배지 텍스트와 함께 → 색만으로 전달하지 않음)
        isExpired && 'ring-1 ring-red-200',
      )}
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-xl bg-cream-100 text-2xl"
        role="img"
        aria-label={category.label}
      >
        {category.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-bold text-ink-900">{ingredient.name}</h3>
          <ExpiryBadge expiresAt={ingredient.expiresAt} />
        </div>
        <p className="mt-0.5 text-sm text-ink-500">
          {ingredient.quantity}
          {ingredient.unit} · {STORAGE_LABEL[ingredient.storage]}
          {ingredient.expiresAt && (
            <>
              {' · '}
              <time dateTime={ingredient.expiresAt}>{formatMonthDay(ingredient.expiresAt)}</time>까지
            </>
          )}
        </p>
      </div>

      {/* 아이콘만 있는 버튼은 aria-label로 "무엇을" 하는지 구체적으로 알려 줍니다 */}
      <div className="flex shrink-0">
        <button
          type="button"
          onClick={() => onEdit(ingredient)}
          aria-label={`${ingredient.name} 수정`}
          className="grid size-10 place-items-center rounded-full text-ink-500 hover:bg-cream-100 hover:text-brand-700"
        >
          <Pencil aria-hidden className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(ingredient)}
          aria-label={`${ingredient.name} 삭제`}
          className="grid size-10 place-items-center rounded-full text-ink-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 aria-hidden className="size-4.5" />
        </button>
      </div>
    </article>
  )
}
