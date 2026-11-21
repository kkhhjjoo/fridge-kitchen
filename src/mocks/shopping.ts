import type { ShoppingItem } from '@/features/shopping/types'

export const mockShoppingItems: ShoppingItem[] = [
  { id: 'shop-1', name: '파스타면', quantity: 500, unit: 'g', isChecked: false, recipeId: 'rcp-1' },
  { id: 'shop-2', name: '바질', quantity: 1, unit: '팩', isChecked: false, recipeId: 'rcp-1' },
  { id: 'shop-3', name: '애호박', quantity: 1, unit: '개', isChecked: false, recipeId: 'rcp-3' },
  { id: 'shop-4', name: '대파', quantity: 1, unit: '단', isChecked: true, recipeId: null },
]
