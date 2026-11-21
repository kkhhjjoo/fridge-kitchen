/// <reference types="vite/client" />

/**
 * .env 파일의 환경 변수 타입 선언
 * Vite는 VITE_ 로 시작하는 변수만 브라우저 코드에 노출합니다. (비밀 키를 실수로 노출하지 않도록)
 * 여기에 선언해 두면 import.meta.env.VITE_SUPABASE_URL 에 자동완성과 타입 검사가 적용돼요.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
