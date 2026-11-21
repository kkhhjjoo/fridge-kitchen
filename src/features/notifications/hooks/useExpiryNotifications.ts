import { useMemo } from 'react'
import { useIngredients } from '@/features/fridge/hooks/useIngredients'
import type { Ingredient } from '@/features/fridge/types'
import { getExpiryStatus, selectExpiringIngredients } from '@/features/fridge/utils/expiry'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import { daysUntil } from '@/lib/date'
import { useSeenNotificationsStore } from '../stores/useSeenNotificationsStore'

export interface ExpiryNotification {
  /**
   * 알림을 구분하는 키: 재료 id + 유통기한 + 상태
   * → 같은 재료라도 "임박"에서 "기한 지남"으로 바뀌면 새 알림이 됩니다.
   *   유통기한을 고쳐도 새 알림이 돼요.
   */
  key: string
  ingredient: Ingredient
  status: 'soon' | 'expired'
  /** 남은 날 (지났으면 음수) */
  days: number
  message: string
  isNew: boolean
}

function toMessage(name: string, days: number): string {
  if (days < 0) return `${name} 유통기한이 ${Math.abs(days)}일 지났어요`
  if (days === 0) return `${name} 유통기한이 오늘까지예요`
  return `${name} 유통기한이 ${days}일 남았어요`
}

/**
 * 유통기한 알림 목록
 * 마이페이지에서 고른 기준일(기본 3일) 이내로 남았거나 지난 재료를 알림으로 만듭니다.
 * 기한이 가까운 순 (지난 것이 맨 위)
 */
export function useExpiryNotifications() {
  const { data: ingredients, isPending, isError } = useIngredients()
  const soonDays = useExpirySoonDays()
  const seenKeys = useSeenNotificationsStore((state) => state.seenKeys)
  const markAllSeen = useSeenNotificationsStore((state) => state.markAllSeen)

  const notifications = useMemo<ExpiryNotification[]>(() => {
    if (!ingredients) return []
    const seen = new Set(seenKeys)
    return selectExpiringIngredients(ingredients, soonDays).map((ingredient) => {
      // selectExpiringIngredients가 기한 있는 재료만 고르므로 expiresAt은 항상 있음
      const expiresAt = ingredient.expiresAt ?? ''
      const status = getExpiryStatus(expiresAt, soonDays) === 'expired' ? 'expired' : 'soon'
      const days = daysUntil(expiresAt)
      const key = `${ingredient.id}:${expiresAt}:${status}`
      return { key, ingredient, status, days, message: toMessage(ingredient.name, days), isNew: !seen.has(key) }
    })
  }, [ingredients, soonDays, seenKeys])

  const newCount = notifications.filter((item) => item.isNew).length

  return {
    notifications,
    newCount,
    soonDays,
    isPending,
    isError,
    /** 지금 보이는 알림을 모두 읽음으로 */
    markAllSeen: () => markAllSeen(notifications.map((item) => item.key)),
  }
}
