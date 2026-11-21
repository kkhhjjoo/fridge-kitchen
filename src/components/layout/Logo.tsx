import { Refrigerator } from 'lucide-react'
import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="냉털키친 홈으로">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Refrigerator aria-hidden className="size-5" strokeWidth={2.2} />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink-900">
        냉털<span className="text-brand-600">키친</span>
      </span>
    </Link>
  )
}
