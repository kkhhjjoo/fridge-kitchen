import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-cream-200 text-ink-700',
  brand: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-600',
  danger: 'bg-red-100 text-red-700',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
