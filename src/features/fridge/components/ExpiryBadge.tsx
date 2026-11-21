import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { useExpirySoonDays } from '@/features/profile/hooks/useProfile'
import type { ExpiryStatus } from '../types'
import { formatDday, getExpiryStatus } from '../utils/expiry'

// 상태 → 배지 색상. 색만으로 정보를 전달하지 않도록 텍스트(D-day)도 항상 함께 표시합니다.
const toneByStatus: Record<ExpiryStatus, BadgeTone> = {
  expired: 'danger',
  soon: 'accent',
  fresh: 'brand',
  none: 'neutral',
}

export function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  const status = getExpiryStatus(expiresAt, useExpirySoonDays())
  const label = expiresAt === null ? '기한 없음' : formatDday(expiresAt)

  return (
    <Badge tone={toneByStatus[status]}>
      {status === 'expired' && <span className="sr-only">유통기한 지남,</span>}
      {label}
    </Badge>
  )
}
