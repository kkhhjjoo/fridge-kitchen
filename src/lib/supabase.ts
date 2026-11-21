import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

/**
 * Supabase 클라이언트 (앱 전체에서 딱 하나만 만들어 공유)
 *
 * 환경 변수가 없으면 null → 앱이 "데모 모드"(목 데이터 + localStorage)로 동작합니다.
 * 덕분에 Supabase 프로젝트가 없어도 개발·시연을 계속할 수 있어요.
 *
 * 여기서 쓰는 키는 "공개용(publishable/anon)" 키라 브라우저에 노출돼도 괜찮습니다.
 * 실제 데이터 보호는 DB의 RLS 정책(supabase/migrations/..._init.sql)이 담당해요.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

/** true면 Supabase 모드, false면 데모 모드 */
export const isSupabaseEnabled = supabase !== null

/** Supabase 모드에서만 호출되는 코드용: null이 아님을 보장하고 클라이언트를 돌려줌 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase가 설정되지 않았어요. .env.local을 확인해 주세요.')
  return supabase
}
