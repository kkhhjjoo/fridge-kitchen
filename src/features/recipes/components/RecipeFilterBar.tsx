import { Heart, Leaf, Timer } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { DIFFICULTY_LABEL } from '../constants'
import { DIFFICULTIES } from '../types'
import { QUICK_COOKING_MINUTES, type RecipeFilter } from '../utils/recommendFilter'

interface ToggleChipProps {
  pressed: boolean
  onToggle: () => void
  icon: ReactNode
  children: ReactNode
}

/**
 * 칩 색 규칙 (필터 칩·난이도 버튼 공통)
 *  - 켜짐: 진한 초록 바탕 + 흰 글자
 *  - 꺼짐: 베이지 바탕 + 회갈색 글자
 * aria-pressed 값에 따라 Tailwind의 aria-pressed: 변형이 색을 고릅니다.
 */
const chipColors =
  'bg-cream-200 text-ink-700 hover:bg-cream-300 ' +
  'aria-pressed:bg-brand-600 aria-pressed:text-white aria-pressed:hover:bg-brand-700'

/** 켜고 끄는 필터 칩 (aria-pressed로 상태 전달 → 스크린리더가 "선택됨/선택 안 됨"을 읽어 줌) */
function ToggleChip({ pressed, onToggle, icon, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
        chipColors,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

interface RecipeFilterBarProps {
  filter: RecipeFilter
  /** 바꿀 필드만 넘기면 됩니다: onChange({ quickOnly: true }) */
  onChange: (patch: Partial<RecipeFilter>) => void
}

/**
 * 추천 기준 필터
 * 상태는 부모(RecipesPage)가 가지고, 이 컴포넌트는 보여주기와 변경 알림만 담당합니다.
 * (이런 컴포넌트를 "제어 컴포넌트(controlled component)"라고 해요)
 */
export function RecipeFilterBar({ filter, onChange }: RecipeFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="추천 기준"
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
    >
      <ToggleChip
        pressed={filter.prioritizeExpiring}
        onToggle={() => onChange({ prioritizeExpiring: !filter.prioritizeExpiring })}
        icon={<Leaf aria-hidden className="size-4" />}
      >
        임박 재료 우선
      </ToggleChip>
      <ToggleChip
        pressed={filter.quickOnly}
        onToggle={() => onChange({ quickOnly: !filter.quickOnly })}
        icon={<Timer aria-hidden className="size-4" />}
      >
        {QUICK_COOKING_MINUTES}분 이내
      </ToggleChip>
      <ToggleChip
        pressed={filter.favoritesOnly}
        onToggle={() => onChange({ favoritesOnly: !filter.favoritesOnly })}
        icon={<Heart aria-hidden className="size-4" />}
      >
        즐겨찾기
      </ToggleChip>

      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-cream-300" />

      {/* 난이도: 하나만 고르는 세그먼트 */}
      <div role="group" aria-label="난이도" className="flex shrink-0 gap-1.5">
        {(['all', ...DIFFICULTIES] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter.difficulty === value}
            onClick={() => onChange({ difficulty: value })}
            className={cn(
              'h-9 shrink-0 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors',
              chipColors,
            )}
          >
            {value === 'all' ? '전체 난이도' : DIFFICULTY_LABEL[value]}
          </button>
        ))}
      </div>
    </div>
  )
}
