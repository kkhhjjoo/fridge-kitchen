import { Refrigerator } from 'lucide-react'

/**
 * 첫 로딩 화면 — 주소로 바로 들어왔을 때 페이지 코드를 받는 짧은 순간에 표시
 * role="status": 스크린리더에 "불러오는 중"임을 알려 줍니다.
 */
export function PageLoader() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-cream-100">
      <div className="flex flex-col items-center gap-3 text-brand-600">
        <Refrigerator aria-hidden className="size-10 animate-pulse" />
        <span className="text-sm font-medium text-ink-500">불러오는 중…</span>
      </div>
    </div>
  )
}
