export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  isChecked: boolean
  /** 레시피에서 자동 추가된 경우 출처 레시피 id, 직접 추가했으면 null */
  recipeId: string | null
}

/** 추가할 때 보내는 데이터 (id·체크 여부는 서버가 정함) */
export type ShoppingItemInput = Omit<ShoppingItem, 'id' | 'isChecked'>
