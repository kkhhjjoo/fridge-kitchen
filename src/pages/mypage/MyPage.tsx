import { PageHeader } from '@/components/ui/PageHeader'
import { CookingHistorySection } from './CookingHistorySection'
import { FavoritesSection } from './FavoritesSection'
import { NotificationsSection } from './NotificationsSection'
import { ProfileCard } from './ProfileCard'
import { SettingsSection } from './SettingsSection'

/**
 * 마이페이지
 * 홈처럼 페이지는 묶음(섹션)을 순서대로 놓기만 하고, 각 묶음이 자기 데이터를 불러옵니다.
 * → 한 묶음이 실패해도 다른 묶음은 정상으로 보여요.
 */
export function MyPage() {
  return (
    <>
      <PageHeader title="마이페이지" description="내 정보와 요리 기록을 확인하세요." />
      <div className="space-y-10 sm:space-y-14">
        <ProfileCard />
        <NotificationsSection />
        <FavoritesSection />
        <CookingHistorySection />
        <SettingsSection />
      </div>
    </>
  )
}
