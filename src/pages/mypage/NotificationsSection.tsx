import { BellOff, CheckCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StateMessage } from '@/components/ui/StateMessage'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { useExpiryNotifications } from '@/features/notifications/hooks/useExpiryNotifications'

/** 마이페이지 "알림" — 유통기한 임박·지난 재료 알림 전체 */
export function NotificationsSection() {
  const { notifications, newCount, soonDays, isPending, isError, markAllSeen } = useExpiryNotifications()
  const sectionRef = useRef<HTMLElement>(null)
  const { hash } = useLocation()

  // 헤더 종에서 "모두 보기"로 오면 (/mypage#notifications) 이 묶음으로 스크롤
  useEffect(() => {
    if (hash === '#notifications' && !isPending) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash, isPending])

  let content
  if (isPending) {
    content = (
      <div className="space-y-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    )
  } else if (isError) {
    content = <StateMessage title="알림을 불러오지 못했어요" description="냉장고 재료를 불러오지 못했어요." />
  } else if (notifications.length === 0) {
    content = (
      <StateMessage
        icon={<BellOff aria-hidden className="size-8" />}
        title="새 알림이 없어요"
        description={`유통기한이 ${soonDays}일 이내로 남은 재료가 생기면 알려 드릴게요.`}
      />
    )
  } else {
    content = (
      <ul className="divide-y divide-cream-200 rounded-card bg-white p-2 shadow-card">
        {notifications.map((notification) => (
          <li key={notification.key}>
            <NotificationItem notification={notification} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section ref={sectionRef} id="notifications" aria-labelledby="notifications-title" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionHeader
          id="notifications-title"
          title="알림"
          description={`유통기한이 ${soonDays}일 이내로 남았거나 지난 재료예요. 기준일은 아래 설정에서 바꿀 수 있어요.`}
        />
        {newCount > 0 && (
          <Button variant="ghost" size="sm" className="mb-4" onClick={markAllSeen}>
            <CheckCheck aria-hidden className="size-4" />
            모두 읽음
          </Button>
        )}
      </div>
      {content}
    </section>
  )
}
