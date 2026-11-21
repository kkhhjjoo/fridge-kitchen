import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js'

/**
 * Supabase 인증 에러 코드 → 한국어 안내 문구
 * 영어 원문("Invalid login credentials")을 그대로 보여주지 않고, 다음에 할 행동을 알려 줍니다.
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않아요.',
  email_not_confirmed: '이메일 인증이 아직 안 됐어요. 메일함의 인증 링크를 눌러 주세요.',
  user_already_exists: '이미 가입된 이메일이에요. 로그인해 주세요.',
  email_exists: '이미 가입된 이메일이에요. 로그인해 주세요.',
  weak_password: '비밀번호가 너무 약해요. 더 길고 복잡하게 만들어 주세요.',
  email_address_invalid: '사용할 수 없는 이메일 주소예요.',
  over_email_send_rate_limit: '메일을 너무 자주 요청했어요. 잠시 후 다시 시도해 주세요.',
  over_request_rate_limit: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.',
  signup_disabled: '지금은 회원가입을 받을 수 없어요.',
}

export function authErrorMessage(error: unknown): string {
  // 네트워크 끊김·서버 응답 없음: Supabase가 자체 에러 타입(AuthRetryableFetchError)으로 감싸서 줌
  if (isAuthRetryableFetchError(error) || error instanceof TypeError) {
    return '서버에 연결할 수 없어요. 네트워크 연결을 확인해 주세요.'
  }
  const known = isAuthError(error) && error.code ? MESSAGES[error.code] : undefined
  if (known) return known
  return '문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
}
