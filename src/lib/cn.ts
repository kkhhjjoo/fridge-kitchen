import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind 클래스 합치기 헬퍼
 * - clsx: 조건부 클래스 처리   cn('a', isActive && 'b')
 * - twMerge: 충돌하는 클래스 정리  cn('px-2', 'px-4') → 'px-4'
 * 컴포넌트에 className을 밖에서 덮어쓸 수 있게 할 때 꼭 필요합니다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
