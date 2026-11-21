import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

/** 각 페이지 상단 제목 영역. 페이지마다 h1은 하나만 두는 것이 접근성 원칙입니다. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-ink-500">{description}</p>}
      </div>
      {actions}
    </header>
  )
}
