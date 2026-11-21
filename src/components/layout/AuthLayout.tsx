import type { ReactNode } from 'react'
import { Logo } from './Logo'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  /** 카드 아래 보조 영역 (예: "계정이 없나요? 회원가입") */
  footer?: ReactNode
}

/** 로그인·회원가입 화면 공통 레이아웃 — 헤더/탭바 없이 가운데 카드 하나 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <main className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-xl font-bold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
          <div className="mt-6">{children}</div>
        </main>
        {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  )
}
