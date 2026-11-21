import { authErrorMessage } from '@/features/auth/utils/authErrorMessage'
import { requireSupabase } from '@/lib/supabase'

/**
 * 인증 API (Supabase Auth)
 * 로그인 상태(세션)는 Supabase가 localStorage에 저장하고 자동으로 갱신(refresh)해 줍니다.
 * 우리는 결과를 onAuthStateChange 이벤트로 받아 화면에 반영해요 (AuthListener).
 */

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
  if (error) throw new Error(authErrorMessage(error))
}

export interface SignUpResult {
  /** true면 이메일 인증을 해야 로그인됩니다 (Supabase 기본 설정) */
  needsEmailConfirmation: boolean
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
): Promise<SignUpResult> {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: {
      // user_metadata로 저장 → DB 트리거(handle_new_user)가 profiles.nickname에 복사
      data: { nickname },
      // 인증 메일의 링크를 누르면 돌아올 주소
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) throw new Error(authErrorMessage(error))
  // 세션이 없다 = 아직 로그인 안 됨 = 메일 인증 필요
  return { needsEmailConfirmation: data.session === null }
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw new Error(authErrorMessage(error))
}
