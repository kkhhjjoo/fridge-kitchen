/** 임박 알림 기준일로 고를 수 있는 범위 (DB의 check 제약과 같게 맞춤: 1~14일) */
export const EXPIRY_ALERT_DAYS_MIN = 1
export const EXPIRY_ALERT_DAYS_MAX = 14

/** 내 프로필 = DB profiles 테이블에서 화면에 필요한 값만 */
export interface Profile {
  nickname: string
  /** 유통기한이 며칠 이내로 남으면 '임박'으로 볼지 */
  expiryAlertDays: number
}

/** 프로필 수정: 바꿀 값만 보내기 (Partial = 모든 속성이 선택) */
export type ProfileUpdate = Partial<Profile>

/** 요리 기록 1건 (요리 완료 버튼을 누를 때마다 쌓임) */
export interface CookingLog {
  id: string
  /** 레시피가 삭제되면 null */
  recipeId: string | null
  /** ISO 날짜·시간 문자열 */
  cookedAt: string
  /** 이 요리에 냉장고에서 꺼내 쓴 재료 수 */
  usedIngredientCount: number
}
