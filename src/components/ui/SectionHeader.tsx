import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface SectionHeaderProps {
  /** 제목 요소의 id — <section aria-labelledby>와 연결해 스크린리더가 구역 이름을 읽게 합니다. */
  id: string
  title: string
  description?: ReactNode
  moreLink?: { to: string; label: string }
}

export function SectionHeader({ id, title, description, moreLink }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-lg font-bold text-ink-900 sm:text-xl">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {moreLink && (
        <Link
          to={moreLink.to}
          className="inline-flex shrink-0 items-center rounded-full text-sm font-medium text-ink-500 hover:text-brand-700"
        >
          {moreLink.label}
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  )
}
