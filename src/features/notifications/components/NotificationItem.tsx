import { Link } from 'react-router'
import { CATEGORY_META } from '@/features/fridge/constants'
import { cn } from '@/lib/cn'
import { formatMonthDay } from '@/lib/date'
import type { ExpiryNotification } from '../hooks/useExpiryNotifications'

interface NotificationItemProps {
  notification: ExpiryNotification
  /** 링크를 누른 뒤 할 일 (예: 헤더 알림 창 닫기) */
  onNavigate?: () => void
}

/** 알림 한 줄 — 헤더의 종 목록과 마이페이지 알림에서 함께 씁니다 */
export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const { ingredient, status, message, isNew } = notification
  const category = CATEGORY_META[ingredient.category]

  return (
    <Link
      to="/fridge"
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-cream-100"
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream-100 text-xl"
        role="img"
        aria-label={category.label}
      >
        {category.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          {/* 새 알림 표시: 점 + 숨김 글자 (색만으로 전달하지 않도록) */}
          {isNew && (
            <>
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent-500" />
              <span className="sr-only">새 알림,</span>
            </>
          )}
          <span className={cn('text-sm font-semibold', status === 'expired' ? 'text-red-700' : 'text-ink-900')}>
            {message}
          </span>
        </span>
        {ingredient.expiresAt && (
          <span className="mt-0.5 block text-xs text-ink-500">
            <time dateTime={ingredient.expiresAt}>{formatMonthDay(ingredient.expiresAt)}</time>까지 ·{' '}
            {ingredient.quantity}
            {ingredient.unit}
          </span>
        )}
      </span>
    </Link>
  )
}
