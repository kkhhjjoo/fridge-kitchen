import { zodResolver } from '@hookform/resolvers/zod'
import { Refrigerator } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/FormField'
import { CATEGORY_META, STORAGE_LABEL } from '@/features/fridge/constants'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES } from '@/features/fridge/types'
import {
  DEFAULT_SHELF_LIFE_DAYS,
  DEFAULT_STORAGE,
  guessCategory,
} from '@/features/fridge/utils/guessDefaults'
import { daysFromToday } from '@/lib/date'
import { useStockToFridge } from '../hooks/useShoppingMutations'
import {
  SHELF_LIFE_OPTIONS,
  stockFormSchema,
  type ShelfLife,
  type StockFormValues,
} from '../schemas'
import type { ShoppingItem } from '../types'

/** 보관 일수(number | null) → 선택지 값. 선택지에 없는 값이면 1주로 */
function toShelfLife(days: number | null): ShelfLife {
  const value = days === null ? '' : String(days)
  return SHELF_LIFE_OPTIONS.find((option) => option.value === value)?.value ?? '7'
}

/** 장보기 항목 → 폼 한 줄의 기본값 (이름으로 카테고리를 추측해 채움) */
function toFormRow(item: ShoppingItem): StockFormValues['items'][number] {
  const category = guessCategory(item.name)
  return {
    shoppingItemId: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category,
    storage: DEFAULT_STORAGE[category],
    shelfLife: toShelfLife(DEFAULT_SHELF_LIFE_DAYS[category]),
  }
}

interface StockFormProps {
  items: ShoppingItem[]
  onDone: () => void
}

function StockForm({ items, onDone }: StockFormProps) {
  const stock = useStockToFridge()
  const { control, register, handleSubmit } = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: { items: items.map(toFormRow) },
  })

  /**
   * useFieldArray: 폼 안의 "배열" 필드를 관리하는 훅
   * fields 각각에는 React key로 쓸 고유 id가 들어 있고,
   * 입력은 register(`items.${index}.category`) 처럼 "경로 문자열"로 연결합니다.
   * (화면에 입력칸이 없는 name·quantity 등도 기본값으로 제출 데이터에 포함돼요)
   */
  const { fields } = useFieldArray({ control, name: 'items' })

  const onSubmit = (values: StockFormValues) => {
    stock.mutate(
      {
        inputs: values.items.map((row) => ({
          name: row.name,
          quantity: row.quantity,
          unit: row.unit,
          category: row.category,
          storage: row.storage,
          expiresAt: row.shelfLife === '' ? null : daysFromToday(Number(row.shelfLife)),
        })),
        shoppingItemIds: values.items.map((row) => row.shoppingItemId),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <ul className="space-y-3">
        {fields.map((field, index) => (
          <li key={field.id} className="rounded-2xl bg-white p-3 shadow-card">
            <p className="mb-2 font-bold text-ink-900">
              {field.name}{' '}
              <span className="text-sm font-normal text-ink-500">
                {field.quantity}
                {field.unit}
              </span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {/* 같은 화면에 같은 종류의 칸이 여러 개라, 라벨에 재료 이름을 넣어 구분해 줍니다 */}
              <label className="sr-only" htmlFor={`stock-category-${index}`}>
                {field.name} 카테고리
              </label>
              <Select id={`stock-category-${index}`} {...register(`items.${index}.category`)} className="h-10 text-sm">
                {INGREDIENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
                  </option>
                ))}
              </Select>
              <label className="sr-only" htmlFor={`stock-storage-${index}`}>
                {field.name} 보관 위치
              </label>
              <Select id={`stock-storage-${index}`} {...register(`items.${index}.storage`)} className="h-10 text-sm">
                {STORAGE_TYPES.map((storage) => (
                  <option key={storage} value={storage}>
                    {STORAGE_LABEL[storage]}
                  </option>
                ))}
              </Select>
              <label className="sr-only" htmlFor={`stock-shelf-${index}`}>
                {field.name} 유통기한
              </label>
              <Select id={`stock-shelf-${index}`} {...register(`items.${index}.shelfLife`)} className="h-10 text-sm">
                {SHELF_LIFE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value === '' ? option.label : `${option.label} 후`}
                  </option>
                ))}
              </Select>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-500">
        이름으로 카테고리와 유통기한을 추측해 채웠어요. 다르면 바꿔 주세요. 냉장고에 같은 재료가
        있으면 수량이 합쳐져요.
      </p>

      <div className="sticky bottom-0 -mx-1 flex gap-2 bg-cream-50 px-1 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onDone}>
          취소
        </Button>
        <Button type="submit" className="flex-2" disabled={stock.isPending}>
          <Refrigerator aria-hidden className="size-4" />
          {stock.isPending ? '넣는 중…' : `${items.length}개 냉장고에 넣기`}
        </Button>
      </div>
    </form>
  )
}

interface StockToFridgeDialogProps {
  open: boolean
  items: ShoppingItem[]
  onClose: () => void
}

export function StockToFridgeDialog({ open, items, onClose }: StockToFridgeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="냉장고에 넣기"
      description="장 본 재료를 내 냉장고에 등록해요."
    >
      <StockForm items={items} onDone={onClose} />
    </Dialog>
  )
}
