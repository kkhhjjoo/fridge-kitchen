import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { isSupabaseEnabled } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  nickname: string
}

/**
 * loading         : 앱이 막 켜져서 저장된 로그인 정보를 확인하는 중
 * authenticated   : 로그인됨
 * unauthenticated : 로그인 안 됨 → 로그인 페이지로 보내야 함
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  setSession: (session: Session | null) => void
}

/** 데모 모드에서는 로그인 없이 이 가상 사용자로 동작 */
const DEMO_USER: AuthUser = { id: 'demo', email: 'demo@fridge-kitchen.local', nickname: '데모 사용자' }

/** Supabase의 사용자 객체 → 앱에서 쓰는 단순한 형태로 변환 */
function toAuthUser(session: Session): AuthUser {
  // user_metadata는 회원가입 때 options.data로 넣은 값 (타입이 정해져 있지 않아 직접 확인)
  const nickname: unknown = session.user.user_metadata.nickname
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    nickname: typeof nickname === 'string' && nickname ? nickname : '냉털러',
  }
}

/**
 * 로그인 상태 (Zustand)
 * 세션은 Supabase가 localStorage에 저장·갱신하고, 바뀔 때마다 AuthListener가 setSession을 호출합니다.
 * 이 스토어는 "화면이 알아야 하는 형태"로 정리해 들고 있는 역할이에요.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  status: isSupabaseEnabled ? 'loading' : 'authenticated',
  user: isSupabaseEnabled ? null : DEMO_USER,
  setSession: (session) =>
    set(
      session
        ? { status: 'authenticated', user: toAuthUser(session) }
        : { status: 'unauthenticated', user: null },
    ),
}))
