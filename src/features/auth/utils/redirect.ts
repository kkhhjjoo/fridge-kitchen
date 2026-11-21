/**
 * 로그인 후 돌아갈 주소를 안전하게 꺼내기
 *
 * /login?redirect=/fridge 처럼 "원래 가려던 곳"을 기억해 두었다가 로그인 후 보내 줍니다.
 * 단, 누군가 ?redirect=https://나쁜사이트.com 같은 링크를 만들어 보내면
 * 로그인 직후 피싱 사이트로 이동시킬 수 있어요 (Open Redirect 취약점).
 * → 우리 사이트 안의 경로('/'로 시작, '//'는 제외)만 허용합니다.
 */
export function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/'
  }
  return value
}
