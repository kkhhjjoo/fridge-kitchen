import { House, Refrigerator, ShoppingCart, Sparkles, UserRound, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  /** 모바일 탭바처럼 좁은 곳에서 쓸 짧은 이름 */
  shortLabel: string
  icon: LucideIcon
}

/**
 * 메뉴 목록을 데이터로 분리 → 상단 내비와 하단 탭바가 같은 목록을 공유합니다.
 * 메뉴를 추가/변경할 때 이 배열만 고치면 두 곳에 모두 반영돼요.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '홈', shortLabel: '홈', icon: House },
  { to: '/fridge', label: '내 냉장고', shortLabel: '냉장고', icon: Refrigerator },
  { to: '/recipes', label: 'AI 레시피 추천', shortLabel: 'AI 추천', icon: Sparkles },
  { to: '/shopping', label: '장보기 목록', shortLabel: '장보기', icon: ShoppingCart },
  { to: '/mypage', label: '마이페이지', shortLabel: '마이', icon: UserRound },
]
