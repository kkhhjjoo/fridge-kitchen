import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ' +
  'disabled:pointer-events-none disabled:opacity-50 select-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-white text-ink-900 ring-1 ring-cream-300 hover:bg-cream-50 hover:ring-ink-300',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
  ghost: 'text-ink-700 hover:bg-cream-200',
}

// 모바일 터치 영역을 고려해 md 이상은 높이 44px(h-11) 이상으로 맞췄습니다.
const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

/**
 * 버튼 스타일 클래스를 만들어 주는 함수
 * <button>뿐 아니라 <Link>(페이지 이동)에도 같은 디자인을 입힐 수 있게 분리했습니다.
 *   <Link className={buttonStyles({ variant: 'accent' })} to="/recipes">...</Link>
 */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(base, variants[variant], sizes[size], className)
}
