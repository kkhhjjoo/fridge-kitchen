import { Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * 단계별 조리 순서 — 요리하면서 끝낸 단계를 눌러 체크할 수 있어요.
 * 체크 상태는 요리하는 동안만 필요한 값이라 서버/전역 상태가 아닌 useState(지역 상태)로 충분합니다.
 */
export function StepList({ steps }: { steps: string[] }) {
  const [doneSteps, setDoneSteps] = useState<ReadonlySet<number>>(() => new Set())

  const toggleStep = (index: number) =>
    setDoneSteps((prev) => {
      // Set도 불변성 유지: 기존 Set을 고치지 않고 복사본을 만들어 반환
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  const progress = steps.length === 0 ? 0 : Math.round((doneSteps.size / steps.length) * 100)

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        {/* progressbar 역할: 스크린리더가 "50%" 같은 진행률을 읽어 줌 */}
        <div
          role="progressbar"
          aria-label="조리 진행률"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-ink-500">
          {doneSteps.size}/{steps.length} 단계
        </span>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const isDone = doneSteps.has(index)
          return (
            <li key={index}>
              <button
                type="button"
                aria-pressed={isDone}
                onClick={() => toggleStep(index)}
                className={cn(
                  'flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-colors',
                  isDone ? 'bg-brand-50' : 'bg-white shadow-card hover:bg-cream-50',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold',
                    isDone ? 'bg-brand-600 text-white' : 'bg-cream-200 text-ink-700',
                  )}
                >
                  {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span
                  className={cn(
                    'pt-1 leading-relaxed',
                    isDone ? 'text-ink-500 line-through decoration-ink-300' : 'text-ink-900',
                  )}
                >
                  <span className="sr-only">{index + 1}단계: </span>
                  {step}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {steps.length > 0 && doneSteps.size === steps.length && (
        <p role="status" className="mt-4 rounded-2xl bg-brand-600 p-4 text-center font-bold text-white">
          🎉 요리 완성! 맛있게 드세요
        </p>
      )}
    </div>
  )
}
