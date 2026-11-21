import { Leaf } from 'lucide-react'

export function TipBanner() {
  return (
    <aside
      aria-label="냉털 팁"
      className="flex items-start gap-4 rounded-card bg-cream-200/70 p-5 sm:items-center sm:p-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
        <Leaf aria-hidden className="size-5" />
      </span>
      <div>
        <p className="font-bold text-ink-900">오늘의 냉털 팁</p>
        <p className="mt-1 text-sm text-ink-700">
          새로 산 재료는 냉장고 안쪽에, 먼저 산 재료는 앞쪽에 두세요. “선입선출”만 지켜도 버리는
          재료가 크게 줄어들어요.
        </p>
      </div>
    </aside>
  )
}
