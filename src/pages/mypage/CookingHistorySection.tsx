import { CalendarCheck, ChefHat, Leaf, RotateCcw, Soup, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { useCookingLogs } from '@/features/profile/hooks/useCookingLogs'
import type { CookingLog } from '@/features/profile/types'
import { useRecipes } from '@/features/recipes/hooks/useRecipes'

/** 처음에 보여 줄 기록 수 (나머지는 "더 보기") */
const INITIAL_VISIBLE = 5

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** '2026-11-21T09:30:00Z' → '11월 21일 (토)' (내 컴퓨터 시간대 기준) */
function formatCookedDate(cookedAt: string): string {
  const date = new Date(cookedAt)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`
}

/** 기록 → 통계 숫자 3개 */
function summarize(logs: CookingLog[], now = new Date()) {
  const thisMonth = logs.filter((log) => {
    const date = new Date(log.cookedAt)
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  })
  return {
    thisMonthCount: thisMonth.length,
    totalCount: logs.length,
    usedIngredientCount: logs.reduce((sum, log) => sum + log.usedIngredientCount, 0),
  }
}

interface StatTileProps {
  label: string
  /** undefined면 로딩 중 */
  value: number | undefined
  unit: string
  icon: LucideIcon
}

/** 숫자 하나를 크게 보여 주는 칸 (홈의 냉장고 요약 칸과 같은 모양) */
function StatTile({ label, value, unit, icon: Icon }: StatTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-white p-4 shadow-card sm:p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
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
    </div>
  )
}

/** 요리 기록(요리 완료 버튼을 누른 기록) + 절약 통계 */
export function CookingHistorySection() {
  const logsQuery = useCookingLogs()
  const recipesQuery = useRecipes()
  const [showAll, setShowAll] = useState(false)

  const stats = useMemo(() => (logsQuery.data ? summarize(logsQuery.data) : undefined), [logsQuery.data])

  // 레시피 id → 레시피 이름 (기록에는 id만 있으므로)
  const titleById = useMemo(
    () => new Map(recipesQuery.data?.map((recipe) => [recipe.id, recipe.title])),
    [recipesQuery.data],
  )

  const logs = logsQuery.data ?? []
  const visibleLogs = showAll ? logs : logs.slice(0, INITIAL_VISIBLE)

  let list
  if (logsQuery.isPending) {
    list = (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    )
  } else if (logsQuery.isError) {
    list = (
      <StateMessage
        title="요리 기록을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" onClick={() => void logsQuery.refetch()}>
            <RotateCcw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (logs.length === 0) {
    list = (
      <StateMessage
        icon={<ChefHat aria-hidden className="size-8" />}
        title="아직 요리 기록이 없어요"
        description="레시피 상세에서 '요리 완료'를 누르면 여기에 쌓여요."
        action={
          <Link to="/recipes" className={buttonStyles({ variant: 'secondary' })}>
            오늘 뭐 해 먹지?
          </Link>
        }
      />
    )
  } else {
    list = (
      <>
        <ol className="space-y-2">
          {visibleLogs.map((log) => {
            const title = log.recipeId ? titleById.get(log.recipeId) : undefined
            return (
              <li key={log.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream-100 text-brand-700">
                  <Soup aria-hidden className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  {title && log.recipeId ? (
                    <Link
                      to={`/recipes/${log.recipeId}`}
                      className="block truncate font-bold text-ink-900 hover:text-brand-700"
                    >
                      {title}
                    </Link>
                  ) : (
                    <p className="truncate font-bold text-ink-500">
                      {recipesQuery.isPending ? '불러오는 중…' : '지금은 없는 레시피'}
                    </p>
                  )}
                  <p className="text-sm text-ink-500">
                    <time dateTime={log.cookedAt}>{formatCookedDate(log.cookedAt)}</time>
                    {log.usedIngredientCount > 0 && ` · 재료 ${log.usedIngredientCount}개 사용`}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
        {logs.length > INITIAL_VISIBLE && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAll((prev) => !prev)} aria-expanded={showAll}>
              {showAll ? '접기' : `${logs.length - INITIAL_VISIBLE}개 더 보기`}
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <section aria-labelledby="history-title">
      <SectionHeader
        id="history-title"
        title="요리 기록"
        description="냉장고 재료로 만든 요리가 쌓여요"
      />
      {/* 기록을 못 불러왔을 때는 0이 아니라 아예 숫자를 숨겨서 오해를 막음 */}
      {!logsQuery.isError && (
        <ul aria-label="요리 통계" className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <li>
            <StatTile label="이번 달 요리" value={stats?.thisMonthCount} unit="번" icon={CalendarCheck} />
          </li>
          <li>
            <StatTile label="지금까지 요리" value={stats?.totalCount} unit="번" icon={ChefHat} />
          </li>
          <li>
            <StatTile label="버리지 않고 쓴 재료" value={stats?.usedIngredientCount} unit="개" icon={Leaf} />
          </li>
        </ul>
      )}
      {list}
    </section>
  )
}
