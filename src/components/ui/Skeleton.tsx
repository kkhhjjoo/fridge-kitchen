import { cn } from '@/lib/cn'

/** 데이터 로딩 중 자리를 잡아 주는 회색 박스 (레이아웃이 튀는 현상 방지) */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-cream-200', className)} />
}
