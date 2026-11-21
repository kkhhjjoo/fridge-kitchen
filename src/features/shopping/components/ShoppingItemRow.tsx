import { Check, ChefHat, X } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import type { ShoppingItem } from '../types'

interface ShoppingItemRowProps {
  item: ShoppingItem
  /** 출처 레시피 제목 (레시피에서 담은 항목일 때) */
  recipeTitle?: string
  onToggle: (item: ShoppingItem) => void
  onDelete: (item: ShoppingItem) => void
}

/**
 * 장보기 항목 한 줄
 * 진짜 <input type="checkbox">를 쓰고 모양만 숨겨서(sr-only) 꾸몄어요.
 * → 키보드 Space로 체크, 스크린리더의 "체크됨/체크 안 됨" 안내가 자동으로 됩니다.
 */
export function ShoppingItemRow({ item, recipeTitle, onToggle, onDelete }: ShoppingItemRowProps) {
  const checkboxId = `shopping-check-${item.id}`

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white py-1 pr-1 pl-3 shadow-card">
      {/* label이 체크박스+텍스트를 감싸서, 줄 어디를 눌러도 체크됩니다 (넓은 터치 영역) */}
      <label htmlFor={checkboxId} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2.5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={item.isChecked}
          onChange={() => onToggle(item)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors',
            // peer-focus-visible: 숨긴 체크박스에 키보드 포커스가 오면 가짜 박스에 링 표시
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600/40',
            item.isChecked ? 'border-brand-600 bg-brand-600 text-white' : 'border-cream-300 bg-white',
          )}
        >
          {item.isChecked && <Check className="size-4" strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              'block truncate font-semibold',
              item.isChecked ? 'text-ink-500 line-through' : 'text-ink-900',
            )}
          >
            {item.name}
          </span>
          <span className="text-sm text-ink-500">
            {item.quantity}
            {item.unit}
          </span>
        </span>
      </label>

      {recipeTitle && item.recipeId && (
        <Link
          to={`/recipes/${item.recipeId}`}
          className="hidden max-w-40 shrink-0 items-center gap-1 truncate rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-cream-200 sm:inline-flex"
        >
          <ChefHat aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{recipeTitle}</span>
        </Link>
      )}

      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label={`${item.name} 삭제`}
        className="grid size-10 shrink-0 place-items-center rounded-full text-ink-300 hover:bg-red-50 hover:text-red-600"
      >
        <X aria-hidden className="size-5" />
      </button>
    </div>
  )
}
