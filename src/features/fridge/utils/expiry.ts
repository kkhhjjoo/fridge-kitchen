import { daysUntil } from '@/lib/date'
import { EXPIRY_SOON_DAYS } from '../constants'
import type { ExpiryStatus, Ingredient } from '../types'

/**
 * 유통기한 상태 계산 — UI 색상/문구가 모두 이 함수 결과를 기준으로 결정됩니다.
 * soonDays: 며칠 이내를 '임박'으로 볼지 (화면에서는 useExpirySoonDays()로 받은 값을 넘겨요)
 */
export function getExpiryStatus(
  expiresAt: string | null,
  soonDays: number = EXPIRY_SOON_DAYS,
  today?: Date,
): ExpiryStatus {
  if (expiresAt === null) return 'none'
  const days = daysUntil(expiresAt, today)
  if (days < 0) return 'expired'
  if (days <= soonDays) return 'soon'
  return 'fresh'
}

/** 'D-3', 'D-Day', 'D+2' 형식 라벨 */
export function formatDday(expiresAt: string, today?: Date): string {
  const days = daysUntil(expiresAt, today)
  if (days === 0) return 'D-Day'
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
}

/** 유통기한이 지났거나 임박한 재료만, 기한이 가까운 순으로 */
export function selectExpiringIngredients(
  ingredients: Ingredient[],
  soonDays: number = EXPIRY_SOON_DAYS,
  today?: Date,
): Ingredient[] {
  return ingredients
    .filter((item) => {
      const status = getExpiryStatus(item.expiresAt, soonDays, today)
      return status === 'soon' || status === 'expired'
    })
    .sort((a, b) => (a.expiresAt ?? '').localeCompare(b.expiresAt ?? ''))
}
