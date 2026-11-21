import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

/**
 * Supabase 로그인 상태 변화를 구독해서 스토어에 반영하는 "보이지 않는" 컴포넌트
 *
 * onAuthStateChange는 구독하자마자 현재 세션(INITIAL_SESSION)을 한 번 알려 주고,
 * 이후 로그인/로그아웃/토큰 갱신 때마다 다시 호출됩니다.
 *
 * 사용자가 바뀌면(로그아웃, 다른 계정 로그인) TanStack Query 캐시를 비웁니다.
 * → 이전 사용자의 냉장고 데이터가 잠깐이라도 보이는 사고를 막아요.
 */
export function AuthListener() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    if (!supabase) return // 데모 모드: 구독할 것이 없음

    let currentUserId: string | null | undefined // undefined = 아직 첫 이벤트 전
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // ⚠️ 이 콜백 안에서 supabase의 다른 함수를 await 하면 교착 상태가 생길 수 있어
      //    상태만 업데이트하고 바로 끝냅니다 (Supabase 공식 권장사항)
      const nextUserId = session?.user.id ?? null
      if (currentUserId !== undefined && currentUserId !== nextUserId) queryClient.clear()
      currentUserId = nextUserId
      setSession(session)
    })

    // 컴포넌트가 사라질 때 구독 해제 (메모리 누수 방지)
    return () => subscription.unsubscribe()
  }, [queryClient, setSession])

  return null
}
