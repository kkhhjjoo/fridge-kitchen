import type { IngredientCategory, StorageType } from './types'

/** 화면에 보여줄 카테고리 이름과 이모지 (Record로 선언 → 카테고리 누락 시 타입 에러) */
export const CATEGORY_META: Record<IngredientCategory, { label: string; emoji: string }> = {
  vegetable: { label: '채소', emoji: '🥬' },
  fruit: { label: '과일', emoji: '🍎' },
  meat: { label: '육류', emoji: '🥩' },
  seafood: { label: '해산물', emoji: '🦐' },
  dairy: { label: '유제품·계란', emoji: '🥚' },
  grain: { label: '곡류·면', emoji: '🍚' },
  sauce: { label: '양념·소스', emoji: '🧂' },
  etc: { label: '기타', emoji: '📦' },
}

export const STORAGE_LABEL: Record<StorageType, string> = {
  fridge: '냉장',
  freezer: '냉동',
  room: '실온',
}

/**
 * 며칠 이내면 '임박'으로 볼지의 기본값
 * 실제로는 마이페이지에서 고른 값(profiles.expiry_alert_days)을 쓰고,
 * 프로필을 아직 못 불러왔을 때만 이 값을 씁니다. → useExpirySoonDays()
 */
export const EXPIRY_SOON_DAYS = 3
