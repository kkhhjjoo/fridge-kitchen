import { Bell, BellOff } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useExpiryNotifications } from '../hooks/useExpiryNotifications'
import { NotificationItem } from './NotificationItem'

/** 종 목록에 보여 줄 최대 개수 (나머지는 마이페이지에서) */
const MAX_IN_POPOVER = 5

/**
 * 헤더의 🔔 알림 버튼
 * - 새 알림이 있으면 숫자 배지
 * - 누르면 알림 목록이 펼쳐지고, 닫을 때 모두 읽음 처리 (열어 둔 동안은 "새 알림" 점이 보이게)
 * - 바깥을 누르거나 Esc를 누르면 닫힘
 */
export function NotificationBell() {
  const { notifications, newCount, soonDays, markAllSeen } = useExpiryNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const close = (returnFocus: boolean) => {
    setOpen(false)
    markAllSeen()
    if (returnFocus) buttonRef.current?.focus() // 키보드 사용자가 제자리로 돌아오게
  }

  // 열려 있을 때만: 바깥 클릭 / Esc 키로 닫기
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
    // close는 렌더마다 새로 만들어지지만 열림 상태가 바뀔 때만 다시 연결하면 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const label = newCount > 0 ? `알림, 새 알림 ${newCount}개` : '알림'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close(false) : setOpen(true))}
        className={cn(
          'relative grid size-10 place-items-center rounded-full bg-white text-ink-700 ring-1 ring-cream-300 transition-colors hover:text-brand-700',
          open && 'text-brand-700 ring-brand-600',
        )}
      >
        <Bell aria-hidden className="size-5" />
        {newCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-cream-100"
          >
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="유통기한 알림"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card bg-white p-2 shadow-card-hover ring-1 ring-cream-200"
        >
          <div className="flex items-baseline justify-between px-3 pt-2 pb-1">
            <p className="font-bold text-ink-900">알림</p>
            <p className="text-xs text-ink-500">유통기한 {soonDays}일 전부터</p>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-ink-500">
              <BellOff aria-hidden className="size-6 text-ink-300" />
              유통기한이 임박한 재료가 없어요.
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {notifications.slice(0, MAX_IN_POPOVER).map((notification) => (
                <li key={notification.key}>
                  <NotificationItem notification={notification} onNavigate={() => close(false)} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-1 border-t border-cream-200 px-1 pt-2 pb-1">
            <Link
              to="/mypage#notifications"
              onClick={() => close(false)}
              className="block rounded-xl px-3 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              {notifications.length > MAX_IN_POPOVER
                ? `알림 ${notifications.length}개 모두 보기`
                : '마이페이지에서 알림 보기'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
