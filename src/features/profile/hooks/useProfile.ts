import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, updateProfile } from '@/api/profile'
import { queryKeys } from '@/api/queryKeys'
import { EXPIRY_SOON_DAYS } from '@/features/fridge/constants'
import type { ProfileUpdate } from '../types'

const profileKey = queryKeys.profile.all

/** 내 프로필 (닉네임, 임박 알림 기준일) */
export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: fetchProfile })
}

/**
 * 유통기한 '임박' 기준일
 * 프로필을 아직 못 불러왔거나 실패하면 기본값(3일)을 씁니다.
 * → 냉장고·홈·추천 화면이 프로필 로딩을 기다리지 않고 바로 그려져요.
 */
export function useExpirySoonDays(): number {
  const { data } = useProfile()
  return data?.expiryAlertDays ?? EXPIRY_SOON_DAYS
}

/** 프로필 수정 — 성공하면 받은 프로필로 캐시를 바로 바꿔서 모든 화면에 반영 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateProfile(update),
    onSuccess: (profile) => queryClient.setQueryData(profileKey, profile),
  })
}
