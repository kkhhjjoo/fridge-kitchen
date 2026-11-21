import { z } from 'zod'
import type { Profile } from '@/features/profile/types'
import { requireSupabase } from '@/lib/supabase'
import type { ProfileApi } from '../contracts'
import { toAppError } from './rows'

const PROFILE_COLUMNS = 'nickname, expiry_alert_days'

const profileRow = z
  .object({ nickname: z.string(), expiry_alert_days: z.number() })
  .transform((row): Profile => ({ nickname: row.nickname, expiryAlertDays: row.expiry_alert_days }))

/**
 * Supabase 프로필 API
 * profiles 행은 회원가입 때 DB 트리거가 만들어 둡니다.
 * RLS 정책이 "내 행만" 보이게 하므로 id 조건 없이 single()로 내 프로필 하나를 받습니다.
 */
export const supabaseProfileApi: ProfileApi = {
  async fetchProfile() {
    const { data, error } = await requireSupabase().from('profiles').select(PROFILE_COLUMNS).single()
    if (error) throw toAppError(error, '프로필을 불러오지 못했어요.')
    return profileRow.parse(data)
  },

  async updateProfile(update) {
    const supabase = requireSupabase()
    // 내 id로 행을 정확히 지정 (RLS가 막아 주지만, 의도를 코드에 분명히 남기기)
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error('로그인 정보를 확인하지 못했어요. 다시 로그인해 주세요.')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        // undefined인 칸은 JSON으로 보낼 때 빠지므로 "바꾼 값만" 저장됩니다
        nickname: update.nickname,
        expiry_alert_days: update.expiryAlertDays,
      })
      .eq('id', userData.user.id)
      .select(PROFILE_COLUMNS)
      .single()
    if (error) throw toAppError(error, '프로필을 저장하지 못했어요.')
    return profileRow.parse(data)
  },
}
