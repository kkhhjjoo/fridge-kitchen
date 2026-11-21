import { useMemo } from 'react'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import { selectExpiringIngredients } from '@/features/fridge/utils/expiry'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { useShoppingItems } from '@/features/shopping/hooks/useShoppingItems'
import { ExpiringSection } from './ExpiringSection'
import { FridgeSummary } from './FridgeSummary'
import { HeroSection } from './HeroSection'
import { RecommendedSection } from './RecommendedSection'
import { TipBanner } from './TipBanner'

/**
 * 홈 페이지
 * 페이지 컴포넌트는 "데이터를 가져와서 섹션에 나눠 주는" 역할만 하고,
 * 실제 화면 구성은 각 섹션 컴포넌트가 담당합니다. (관심사 분리)
 */
export function HomePage() {
  const ingredientsQuery = useIngredients()
  const shoppingQuery = useShoppingItems()

  const soonDays = useExpirySoonDays()

  // 재료 데이터나 임박 기준일이 바뀔 때만 임박 재료를 다시 계산
  const expiring = useMemo(
    () => (ingredientsQuery.data ? selectExpiringIngredients(ingredientsQuery.data, soonDays) : undefined),
    [ingredientsQuery.data, soonDays],
  )
  const remainingShopping = shoppingQuery.data?.filter((item) => !item.isChecked).length

  return (
    <div className="space-y-10 sm:space-y-14">
      <div className="space-y-4 sm:space-y-6">
        <HeroSection expiringCount={expiring?.length} />
        <FridgeSummary
          totalCount={ingredientsQuery.data?.length}
          expiringCount={expiring?.length}
          shoppingCount={remainingShopping}
        />
      </div>
      <ExpiringSection ingredients={expiring} isPending={ingredientsQuery.isPending} soonDays={soonDays} />
      <RecommendedSection />
      <TipBanner />
    </div>
  )
}
