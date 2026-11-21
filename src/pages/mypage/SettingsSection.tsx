import { useId } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/FormField'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile'
import { EXPIRY_ALERT_DAYS_MAX, EXPIRY_ALERT_DAYS_MIN } from '@/features/profile/types'

/** 고를 수 있는 날짜: 1일 ~ 14일 */
const DAY_OPTIONS = Array.from(
  { length: EXPIRY_ALERT_DAYS_MAX - EXPIRY_ALERT_DAYS_MIN + 1 },
  (_, i) => EXPIRY_ALERT_DAYS_MIN + i,
)

/** 설정: 유통기한 임박 알림 기준일 — 고르는 즉시 저장 */
export function SettingsSection() {
  const profileQuery = useProfile()
  const updateProfile = useUpdateProfile()
  const selectId = useId()
  const hintId = `${selectId}-message`

  const handleChange = (days: number) => {
    updateProfile.mutate(
      { expiryAlertDays: days },
      {
        onSuccess: () => toast.success(`유통기한이 ${days}일 남으면 '임박'으로 알려 드릴게요.`),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <section aria-labelledby="settings-title">
      <SectionHeader id="settings-title" title="설정" />
      <div className="rounded-card bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1 basis-56">
            <label htmlFor={selectId} className="font-semibold text-ink-900">
              유통기한 임박 알림
            </label>
            <p id={hintId} className="mt-1 text-sm text-ink-500">
              남은 날이 이 기준 이하인 재료를 홈과 냉장고에서 &lsquo;임박&rsquo;으로 표시해요.
            </p>
          </div>

          {profileQuery.isPending ? (
            <Skeleton className="h-11 w-32" />
          ) : profileQuery.isError ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              설정을 불러오지 못했어요.
            </p>
          ) : (
            <Select
              id={selectId}
              aria-describedby={hintId}
              className="w-32"
              value={profileQuery.data.expiryAlertDays}
              onChange={(event) => handleChange(Number(event.target.value))}
              disabled={updateProfile.isPending}
            >
              {DAY_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  {days}일 전부터
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>
    </section>
  )
}
