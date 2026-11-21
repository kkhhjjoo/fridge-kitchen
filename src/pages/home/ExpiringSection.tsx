import { PartyPopper } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { ExpiringIngredientCard } from '@/features/fridge/components/ExpiringIngredientCard'
import type { Ingredient } from '@/features/fridge/types'

const MAX_VISIBLE = 6

interface ExpiringSectionProps {
  ingredients: Ingredient[] | undefined
  isPending: boolean
  /** 임박 기준일 (마이페이지 설정값) */
  soonDays: number
}

export function ExpiringSection({ ingredients, isPending, soonDays }: ExpiringSectionProps) {
  // 로딩 / 데이터 있음 / 빈 상태 — 세 가지 상태를 모두 디자인하는 것이 완성도의 핵심입니다.
  let content
  if (isPending) {
    content = (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: MAX_VISIBLE }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-card" />
        ))}
      </div>
    )
  } else if (ingredients && ingredients.length > 0) {
    content = (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ingredients.slice(0, MAX_VISIBLE).map((ingredient) => (
          <li key={ingredient.id}>
            <ExpiringIngredientCard ingredient={ingredient} />
          </li>
        ))}
      </ul>
    )
  } else {
    content = (
      <StateMessage
        icon={<PartyPopper aria-hidden className="size-8" />}
        title="임박한 재료가 없어요"
        description="냉장고가 아주 잘 관리되고 있어요!"
      />
    )
  }

  return (
    <section aria-labelledby="expiring-title">
      <SectionHeader
        id="expiring-title"
        title="유통기한이 얼마 안 남았어요"
        description={`${soonDays}일 이내에 먹어야 하는 재료예요`}
        moreLink={{ to: '/fridge', label: '냉장고 보기' }}
      />
      {content}
    </section>
  )
}
