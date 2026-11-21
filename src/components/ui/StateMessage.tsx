import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StateMessageProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * 빈 상태 / 에러 상태 공용 컴포넌트
 * "아무것도 없어요"로 끝내지 않고 다음 행동(action)을 함께 제시하는 것이 UX 포인트입니다.
 */
export function StateMessage({ icon, title, description, action, className }: StateMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-dashed border-cream-300 bg-cream-50 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && <div className="mb-3 text-brand-600">{icon}</div>}
      <p className="font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
