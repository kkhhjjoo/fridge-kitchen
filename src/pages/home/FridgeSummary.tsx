import { AlarmClock, Refrigerator, ShoppingCart, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

interface StatCardProps {
  to: string
  label: string
  /** undefined면 아직 로딩 중 → 스켈레톤 표시 */
  value: number | undefined
  unit: string
  icon: LucideIcon
  highlight?: boolean
}

/** 숫자 하나를 크게 보여주는 대시보드형 카드 */
function StatCard({ to, label, value, unit, icon: Icon, highlight = false }: StatCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-card p-4 shadow-card transition-shadow hover:shadow-card-hover sm:p-5',
        highlight ? 'bg-accent-50 ring-1 ring-accent-100' : 'bg-white',
      )}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-2xl',
          highlight ? 'bg-accent-500 text-white' : 'bg-brand-50 text-brand-700',
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500 sm:text-sm">{label}</p>
        {value === undefined ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <p className="text-xl font-extrabold text-ink-900 sm:text-2xl">
            {value}
            <span className="ml-0.5 text-sm font-semibold text-ink-500">{unit}</span>
          </p>
        )}
      </div>
    </Link>
  )
}

interface FridgeSummaryProps {
  totalCount: number | undefined
  expiringCount: number | undefined
  shoppingCount: number | undefined
}

export function FridgeSummary({ totalCount, expiringCount, shoppingCount }: FridgeSummaryProps) {
  return (
    <section aria-label="냉장고 요약">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <li>
          <StatCard to="/fridge" label="보관 중인 재료" value={totalCount} unit="개" icon={Refrigerator} />
        </li>
        <li>
          <StatCard
            to="/fridge"
            label="유통기한 임박"
            value={expiringCount}
            unit="개"
            icon={AlarmClock}
            highlight={(expiringCount ?? 0) > 0}
          />
        </li>
        <li>
          <StatCard to="/shopping" label="사야 할 재료" value={shoppingCount} unit="개" icon={ShoppingCart} />
        </li>
      </ul>
    </section>
  )
}
