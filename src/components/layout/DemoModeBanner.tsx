import { FlaskConical } from 'lucide-react'

/**
 * 데모 모드 안내 띠 — Supabase 환경 변수가 없을 때만 표시
 * 사용자가 "왜 다른 기기에서는 데이터가 안 보이지?"라고 헷갈리지 않도록 상태를 분명히 알려 줍니다.
 */
export function DemoModeBanner() {
  return (
    <div role="note" className="bg-ink-900 px-4 py-2 text-center text-xs text-cream-200 sm:text-sm">
      <FlaskConical aria-hidden className="mr-1.5 inline size-4 align-[-3px] text-accent-400" />
      <strong className="text-white">데모 모드</strong> · 데이터가 이 브라우저에만 저장돼요. (Supabase 미연결)
    </div>
  )
}
