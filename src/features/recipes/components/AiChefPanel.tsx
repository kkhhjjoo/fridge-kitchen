import { RotateCw, Sparkles } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/FormField'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import type { Ingredient } from '@/features/fridge/types'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { cn } from '@/lib/cn'
import {
  AI_CHEF_AVOID_MAX,
  AI_CHEF_WISH_MAX,
  AI_CUISINE_LABEL,
  AI_CUISINES,
  type AiChefRequest,
  type AiCuisine,
} from '../aiChefTypes'
import { useAiChef } from '../hooks/useAiChef'
import { AiRecipeCard } from './AiRecipeCard'

/** 누르면 요청 칸에 채워지는 예시 */
const EXAMPLE_WISHES = ['15분 안에 끝나는 저녁', '임박 재료 다 쓰기', '맵지 않은 아이 반찬', '술안주로 좋은 요리']

const SERVING_OPTIONS = [1, 2, 3, 4]

interface AiChefPanelProps {
  /** 냉장고 재료 (undefined = 아직 불러오는 중) */
  fridge: Ingredient[] | undefined
}

/**
 * AI 셰프 맞춤 추천
 * 취향·상황을 적고 버튼을 누르면 → 개발 서버가 내 컴퓨터의 claude(구독)로 레시피를 받아 옵니다.
 */
export function AiChefPanel({ fridge }: AiChefPanelProps) {
  const [wish, setWish] = useState('')
  const [servings, setServings] = useState(2)
  const [cuisine, setCuisine] = useState<AiCuisine>('any')
  // 이번 화면에서 이미 추천받은 요리 이름 — 다시 누르면 AI가 겹치지 않게 피해요 (새로고침하면 비워짐)
  const [seenTitles, setSeenTitles] = useState<string[]>([])
  const aiChef = useAiChef()
  const soonDays = useExpirySoonDays()
  const wishId = useId()
  const servingsId = useId()

  const fridgeEmpty = fridge !== undefined && fridge.length === 0
  const canAsk = !aiChef.isPending && fridge !== undefined && !fridgeEmpty

  const ask = (request: AiChefRequest) =>
    aiChef.mutate(request, {
      // 받은 요리 이름을 기억 (최근 것만 AI_CHEF_AVOID_MAX개)
      onSuccess: (recipes) =>
        setSeenTitles((prev) => [...prev, ...recipes.map((recipe) => recipe.title)].slice(-AI_CHEF_AVOID_MAX)),
    })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canAsk) ask({ wish: wish.trim(), servings, cuisine, avoidTitles: seenTitles })
  }

  let result = null
  if (aiChef.isPending) {
    result = (
      <div aria-live="polite">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-800">
          <Sparkles aria-hidden className="size-4 animate-pulse" />
          AI 셰프가 냉장고를 살펴보며 레시피를 만드는 중이에요… (10~30초)
        </p>
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-56 rounded-card" />
            </li>
          ))}
        </ul>
      </div>
    )
  } else if (aiChef.isError) {
    result = (
      <StateMessage
        title="레시피를 받아 오지 못했어요"
        description={aiChef.error.message}
        action={
          <Button variant="secondary" onClick={() => aiChef.variables && ask(aiChef.variables)}>
            <RotateCw aria-hidden className="size-4" />
            다시 시도
          </Button>
        }
      />
    )
  } else if (aiChef.data && fridge) {
    result = (
      <ul aria-label="AI 셰프 추천 레시피" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {aiChef.data.map((recipe) => (
          <li key={recipe.title}>
            <AiRecipeCard recipe={recipe} fridge={fridge} soonDays={soonDays} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="ai-chef-title" className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-card bg-brand-700 p-4 text-white sm:p-5"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
            <Sparkles aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="ai-chef-title" className="font-bold">
              AI 셰프 맞춤 추천
            </h2>
            <p className="mt-0.5 text-sm text-brand-100">
              취향과 상황을 적으면 내 냉장고 재료로 새 레시피를 만들어 줘요. (내 컴퓨터의 Claude 구독 사용)
            </p>
          </div>
        </div>

        <label htmlFor={wishId} className="mt-4 block text-sm font-semibold">
          어떤 요리가 먹고 싶어요? <span className="font-normal text-brand-100">(선택)</span>
        </label>
        <textarea
          id={wishId}
          value={wish}
          onChange={(event) => setWish(event.target.value)}
          maxLength={AI_CHEF_WISH_MAX}
          rows={2}
          placeholder="예) 15분 안에 끝나는 저녁, 국물 있는 요리"
          className="mt-1.5 w-full resize-none rounded-xl border-0 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-300 focus:ring-2 focus:ring-accent-400 focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="예시 요청">
          {EXAMPLE_WISHES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setWish(example)}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
            >
              {example}
            </button>
          ))}
        </div>

        {/* 요리 종류: 하나만 고름. 초록 상자 안이라 고른 칩은 흰 바탕으로 표시 */}
        <p id={`${wishId}-cuisine`} className="mt-4 text-sm font-semibold">
          요리 종류
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-labelledby={`${wishId}-cuisine`}>
          {AI_CUISINES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={cuisine === value}
              onClick={() => setCuisine(value)}
              className={cn(
                'h-9 rounded-full px-3.5 text-sm font-semibold transition-colors',
                cuisine === value ? 'bg-white text-brand-800' : 'bg-white/15 text-white hover:bg-white/25',
              )}
            >
              {AI_CUISINE_LABEL[value]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor={servingsId} className="sr-only">
            몇 인분
          </label>
          <Select
            id={servingsId}
            value={servings}
            onChange={(event) => setServings(Number(event.target.value))}
            className="w-28 border-0"
          >
            {SERVING_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}인분
              </option>
            ))}
          </Select>
          <Button type="submit" variant="accent" className="flex-1 sm:flex-none" disabled={!canAsk}>
            <Sparkles aria-hidden className="size-4" />
            {aiChef.isPending ? '만드는 중…' : seenTitles.length > 0 ? '다른 요리 추천받기' : 'AI 셰프에게 묻기'}
          </Button>
          {fridgeEmpty && <p className="text-sm text-brand-100">냉장고에 재료를 먼저 등록해 주세요.</p>}
        </div>
      </form>

      {result}
    </section>
  )
}
