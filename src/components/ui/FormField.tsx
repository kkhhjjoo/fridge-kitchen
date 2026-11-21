import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * 폼 필드 레이아웃: 라벨 + 입력 요소 + (힌트 또는 에러 메시지)
 *
 * 접근성 연결 규칙
 *  - <label htmlFor={id}>  ↔ 입력 요소의 id      → 라벨을 눌러도 입력칸에 포커스, 스크린리더가 이름을 읽음
 *  - 에러 문구의 id         ↔ aria-describedby    → 스크린리더가 에러 내용까지 읽어 줌
 * 입력 요소 쪽에서는 fieldAria(id, error) 헬퍼(./fieldAria.ts)를 사용합니다.
 */
interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ id, label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-700">
        {label}
        {required && (
          <span className="ml-0.5 text-accent-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

/** 에러가 있으면 에러를, 없으면 힌트를 표시 (role="alert": 에러가 생기는 순간 스크린리더가 읽음) */
export function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-message`} role="alert" className="text-xs font-medium text-red-600">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={`${id}-message`} className="text-xs text-ink-500">
        {hint}
      </p>
    )
  }
  return null
}

const inputBase =
  'h-11 w-full rounded-xl border border-cream-300 bg-white px-3.5 text-[15px] text-ink-900 ' +
  'placeholder:text-ink-300 transition-colors hover:border-ink-300 ' +
  'focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 ' +
  'aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/20'

/** 기본 스타일이 적용된 <input>. register()가 넘겨주는 ref도 그대로 전달됩니다(React 19는 ref가 일반 prop). */
export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input className={cn(inputBase, className)} {...props} />
}

export function Select({ className, ...props }: ComponentPropsWithRef<'select'>) {
  return <select className={cn(inputBase, 'appearance-auto pr-2', className)} {...props} />
}
