import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { fieldAria } from '@/components/ui/fieldAria'
import { FieldMessage, Input } from '@/components/ui/FormField'
import { useAddShoppingItems } from '../hooks/useShoppingMutations'
import { addShoppingItemSchema, type AddShoppingItemValues } from '../schemas'

const DEFAULT_VALUES: AddShoppingItemValues = { name: '', quantity: 1, unit: '개' }

/** 장보기 항목 직접 추가 — 한 줄짜리 빠른 입력 폼 */
export function AddShoppingItemForm() {
  const addItems = useAddShoppingItems()
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AddShoppingItemValues>({
    resolver: zodResolver(addShoppingItemSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = (values: AddShoppingItemValues) => {
    addItems.mutate([{ ...values, recipeId: null }], {
      onSuccess: () => {
        reset(DEFAULT_VALUES)
        // 연속으로 여러 개를 입력하기 편하도록 다시 이름 칸에 포커스
        setFocus('name')
      },
    })
  }

  // 세 칸 중 하나라도 에러가 있으면 아래에 첫 번째 에러만 표시
  const firstError = errors.name?.message ?? errors.quantity?.message ?? errors.unit?.message

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-label="장보기 항목 추가"
      className="rounded-card bg-white p-3 shadow-card sm:p-4"
    >
      <div className="flex flex-wrap gap-2">
        <label htmlFor="shopping-name" className="sr-only">
          재료 이름
        </label>
        <Input
          {...fieldAria('shopping-name', errors.name?.message)}
          {...register('name')}
          placeholder="살 재료 (예: 대파)"
          autoComplete="off"
          className="min-w-0 flex-[1_1_12rem]"
        />
        <div className="flex flex-1 gap-2 sm:flex-none">
          <label htmlFor="shopping-quantity" className="sr-only">
            수량
          </label>
          <Input
            {...fieldAria('shopping-quantity', errors.quantity?.message)}
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            className="w-20"
          />
          <label htmlFor="shopping-unit" className="sr-only">
            단위
          </label>
          <Input
            {...fieldAria('shopping-unit', errors.unit?.message)}
            {...register('unit')}
            autoComplete="off"
            className="w-20"
          />
          <Button type="submit" disabled={addItems.isPending} className="shrink-0 px-4">
            <Plus aria-hidden className="size-5" />
            <span className="max-sm:sr-only">추가</span>
          </Button>
        </div>
      </div>
      {firstError && (
        <div className="mt-2">
          <FieldMessage id="shopping-form" error={firstError} />
        </div>
      )}
    </form>
  )
}
