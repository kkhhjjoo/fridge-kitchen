import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { fieldAria } from '@/components/ui/fieldAria'
import { FieldMessage, Input } from '@/components/ui/FormField'
import { useCompleteCooking } from '../hooks/useCompleteCooking'
import { cookingFormSchema, type CookingFormValues } from '../schemas'
import type { OwnedRecipeIngredient, RecipeRecommendation } from '../types'

const round = (value: number) => Math.round(value * 100) / 100

/**
 * 레시피 재료 → 폼 한 줄 기본값
 * 단위가 같으면(예: 마늘 4쪽 / 보유 10쪽) 레시피 양을 그대로 채우고,
 * 단위가 다르면(예: 방울토마토 10개 / 보유 1팩) 자동 환산이 불가능하니 0으로 두고 사용자가 입력하게 합니다.
 */
function toFormRow(item: OwnedRecipeIngredient): CookingFormValues['items'][number] {
  const unitMatches = item.unit === item.owned.unit
  return {
    ingredientId: item.owned.id,
    name: item.owned.name,
    unit: item.owned.unit,
    ownedQuantity: item.owned.quantity,
    recipeAmountLabel: `${round(item.quantity)}${item.unit}`,
    unitMatches,
    amount: unitMatches ? Math.min(item.quantity, item.owned.quantity) : 0,
    removeWhenEmpty: true,
  }
}

function CookingForm({ recommendation, onDone }: { recommendation: RecipeRecommendation; onDone: () => void }) {
  const completeCooking = useCompleteCooking(recommendation.recipe.id)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CookingFormValues>({
    resolver: zodResolver(cookingFormSchema),
    defaultValues: { items: recommendation.availableIngredients.map(toFormRow) },
  })
  const { fields } = useFieldArray({ control, name: 'items' })

  // 입력 중인 사용량을 실시간으로 구독 → "남는 양" 미리보기 계산
  const watchedItems = useWatch({ control, name: 'items' })

  const onSubmit = ({ items }: CookingFormValues) => {
    completeCooking.mutate(
      items.map(({ ingredientId, amount, removeWhenEmpty }) => ({
        ingredientId,
        amount,
        removeWhenEmpty,
      })),
      { onSuccess: onDone },
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <ul className="space-y-3">
        {fields.map((field, index) => {
          const amount = watchedItems[index]?.amount ?? 0
          // NaN(빈 칸)일 때는 미리보기를 계산하지 않음
          const remaining = Number.isNaN(amount) ? null : round(field.ownedQuantity - amount)
          const isUsedUp = remaining === 0 && amount > 0
          const inputId = `cooking-amount-${index}`
          const error = errors.items?.[index]?.amount?.message
          const sameUnit = field.unitMatches

          return (
            <li key={field.id} className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={inputId} className="font-bold text-ink-900">
                  {field.name}
                </label>
                <span className="text-xs text-ink-500">
                  보유 {field.ownedQuantity}
                  {field.unit} · 레시피 {field.recipeAmountLabel}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    {...fieldAria(inputId, error, !sameUnit)}
                    {...register(`items.${index}.amount`, { valueAsNumber: true })}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-ink-500">
                    {field.unit}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setValue(`items.${index}.amount`, field.ownedQuantity, { shouldValidate: true })
                  }
                >
                  전부
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue(`items.${index}.amount`, 0, { shouldValidate: true })}
                >
                  안 씀
                </Button>
              </div>

              <FieldMessage
                id={inputId}
                error={error}
                hint={sameUnit ? undefined : '단위가 달라 자동으로 채우지 못했어요. 사용한 양을 입력해 주세요.'}
              />

              {remaining !== null && amount > 0 && !error && (
                <p className="mt-1.5 text-xs text-ink-500">
                  남는 양: <strong className="text-ink-700">{Math.max(0, remaining)}{field.unit}</strong>
                </p>
              )}

              {/* 다 쓴 재료만 "삭제할지" 물어봄 */}
              {isUsedUp && (
                <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    {...register(`items.${index}.removeWhenEmpty`)}
                    className="size-4 accent-brand-600"
                  />
                  다 썼어요 — 냉장고에서 삭제
                </label>
              )}
            </li>
          )
        })}
      </ul>

      <div className="sticky bottom-0 -mx-1 flex gap-2 bg-cream-50 px-1 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onDone}>
          취소
        </Button>
        <Button type="submit" className="flex-2" disabled={completeCooking.isPending}>
          {completeCooking.isPending ? '정리 중…' : '재고에서 빼기'}
        </Button>
      </div>
    </form>
  )
}

interface CompleteCookingDialogProps {
  open: boolean
  recommendation: RecipeRecommendation
  onClose: () => void
}

/** 요리 완료 → 사용한 재료 확인 후 냉장고 재고에서 차감 */
export function CompleteCookingDialog({ open, recommendation, onClose }: CompleteCookingDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="요리 완료! 🎉"
      description="사용한 만큼 냉장고 재고에서 뺄게요. 실제로 쓴 양으로 고쳐 주세요."
    >
      <CookingForm recommendation={recommendation} onDone={onClose} />
    </Dialog>
  )
}
