import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { fieldAria } from '@/components/ui/fieldAria'
import { FieldMessage, FormField, Input } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { daysFromToday } from '@/lib/date'
import { CATEGORY_META, STORAGE_LABEL } from '../constants'
import {
  createIngredientFormSchema,
  splitIngredientNames,
  type IngredientFormOutput,
  type IngredientFormValues,
} from '../schemas'
import { INGREDIENT_CATEGORIES, STORAGE_TYPES } from '../types'
import { guessIngredientDefaults } from '../utils/guessDefaults'

// 스키마는 한 번만 만들어 두고 재사용 (렌더링할 때마다 새로 만들지 않도록)
const createSchema = createIngredientFormSchema(true) // 등록: 쉼표로 여러 개 허용
const editSchema = createIngredientFormSchema(false) // 수정: 하나만

/** 단위 입력 시 자동완성 후보 (<datalist>) — 자유 입력도 가능 */
const UNIT_SUGGESTIONS = ['개', 'g', 'kg', 'ml', 'L', '팩', '봉', '모', '장', '병', '단', '통', '쪽', '공기']

/** 유통기한 빠른 입력 버튼 */
const EXPIRY_PRESETS = [
  { label: '+3일', days: 3 },
  { label: '+1주', days: 7 },
  { label: '+2주', days: 14 },
  { label: '+1달', days: 30 },
]

// 라디오 버튼을 "칩" 모양으로 꾸미는 공통 클래스
// has-checked: 안에 있는 라디오가 선택됐을 때 / has-focus-visible: 키보드로 포커스됐을 때 (Tailwind v4)
const chipClass =
  'flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors select-none ' +
  'hover:border-ink-300 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:text-brand-800 ' +
  'has-focus-visible:ring-2 has-focus-visible:ring-brand-600/40'

interface IngredientFormProps {
  defaultValues: IngredientFormValues
  /** true면 이름 칸에 쉼표로 여러 재료를 적을 수 있음 (새 재료 등록) */
  allowMultiple?: boolean
  submitLabel: string
  isSubmitting: boolean
  /** 검증을 통과하고 변환까지 끝난 값만 전달됩니다 (expiresAt: '' → null) */
  onSubmit: (values: IngredientFormOutput) => void
  onCancel: () => void
}

export function IngredientForm({
  defaultValues,
  allowMultiple = false,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: IngredientFormProps) {
  /**
   * useForm의 제네릭 3개: <입력 중 값 타입, context, 검증 후 값 타입>
   * zodResolver가 제출 시점에 스키마로 검증 → 통과하면 handleSubmit 콜백이 호출됩니다.
   * RHF는 입력할 때마다 리렌더링하지 않는(비제어 컴포넌트) 방식이라 빠릅니다.
   */
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<IngredientFormValues, unknown, IngredientFormOutput>({
    resolver: zodResolver(allowMultiple ? createSchema : editSchema),
    defaultValues,
  })

  // useWatch: 특정 필드 값만 구독 (빠른 입력 버튼의 "선택됨" 표시용)
  // watch()보다 이 훅이 권장됩니다 — 해당 필드가 바뀔 때만 리렌더링되고 React Compiler와도 호환돼요.
  const expiresAt = useWatch({ control, name: 'expiresAt' })

  // 이름 칸에 쉼표로 2개 이상 적었는지 — 맞으면 "여러 개 등록" 모양으로 바뀜
  const nameValue = useWatch({ control, name: 'name' })
  const names = allowMultiple ? splitIngredientNames(nameValue) : []
  const isMultiple = names.length > 1

  const setExpiry = (value: string) =>
    setValue('expiresAt', value, { shouldValidate: true, shouldDirty: true })

  return (
    // noValidate: 브라우저 기본 검증 말풍선 대신 우리가 만든 에러 메시지를 사용
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        id="ingredient-name"
        label="재료 이름"
        error={errors.name?.message}
        hint={allowMultiple ? '쉼표(,)로 나눠 적으면 여러 재료를 한 번에 넣을 수 있어요.' : undefined}
        required
      >
        <Input
          {...fieldAria('ingredient-name', errors.name?.message, allowMultiple)}
          {...register('name')}
          placeholder={allowMultiple ? '예) 대파, 계란, 두부' : '예) 대파'}
          autoComplete="off"
          data-autofocus // Dialog가 열릴 때 이 칸에 포커스 (autoFocus는 showModal과 순서가 꼬여서 사용하지 않음)
        />
      </FormField>

      {isMultiple && (
        // aria-live: 재료 수가 바뀔 때 스크린리더가 읽어 줌
        <div aria-live="polite" className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
          <p className="text-sm font-semibold text-brand-800">재료 {names.length}개를 한 번에 넣어요</p>
          <p className="mt-0.5 text-xs text-ink-500">
            카테고리·보관 위치·유통기한은 재료마다 자동으로 정해요. 다르면 넣은 뒤 하나씩 고쳐 주세요.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {names.map((name) => {
              const guess = guessIngredientDefaults(name)
              const meta = CATEGORY_META[guess.category]
              return (
                <li
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-ink-700 ring-1 ring-cream-300"
                >
                  <span aria-hidden>{meta.emoji}</span>
                  <span className="font-semibold text-ink-900">{name}</span>
                  <span className="text-ink-500">
                    · {meta.label} · {STORAGE_LABEL[guess.storage]} ·{' '}
                    {guess.shelfLifeDays === null ? '기한 없음' : `${guess.shelfLifeDays}일`}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* 관련 있는 라디오 묶음은 fieldset + legend로 그룹 이름을 알려 줍니다 (접근성)
          여러 개 등록일 때는 재료마다 자동으로 정하므로 숨깁니다. (hidden: 화면·스크린리더 모두에서 숨김) */}
      <fieldset hidden={isMultiple}>
        <legend className="mb-1.5 text-sm font-semibold text-ink-700">카테고리</legend>
        <div className="grid grid-cols-4 gap-2">
          {INGREDIENT_CATEGORIES.map((category) => (
            <label key={category} className={cn(chipClass, 'flex-col gap-0.5 px-1 py-2 text-xs')}>
              <input type="radio" value={category} className="sr-only" {...register('category')} />
              <span aria-hidden className="text-xl">
                {CATEGORY_META[category].emoji}
              </span>
              {CATEGORY_META[category].label}
            </label>
          ))}
        </div>
        <FieldMessage id="ingredient-category" error={errors.category?.message} />
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="ingredient-quantity" label="수량" error={errors.quantity?.message} required>
          <Input
            {...fieldAria('ingredient-quantity', errors.quantity?.message)}
            // valueAsNumber: 문자열 '2' 대신 숫자 2로 받아서 z.number()로 검증
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            inputMode="decimal" // 모바일에서 숫자 키패드 표시
            min={0}
            step="any"
          />
        </FormField>
        <FormField id="ingredient-unit" label="단위" error={errors.unit?.message} required>
          <Input
            {...fieldAria('ingredient-unit', errors.unit?.message)}
            {...register('unit')}
            list="unit-suggestions"
            autoComplete="off"
          />
          <datalist id="unit-suggestions">
            {UNIT_SUGGESTIONS.map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
        </FormField>
      </div>

      <fieldset hidden={isMultiple}>
        <legend className="mb-1.5 text-sm font-semibold text-ink-700">보관 위치</legend>
        <div className="grid grid-cols-3 gap-2">
          {STORAGE_TYPES.map((storage) => (
            <label key={storage} className={chipClass}>
              <input type="radio" value={storage} className="sr-only" {...register('storage')} />
              {STORAGE_LABEL[storage]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5" hidden={isMultiple}>
        <label htmlFor="ingredient-expires" className="text-sm font-semibold text-ink-700">
          유통기한 <span className="font-normal text-ink-500">(선택)</span>
        </label>
        <Input
          {...fieldAria('ingredient-expires', errors.expiresAt?.message, true)}
          {...register('expiresAt')}
          type="date"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="유통기한 빠른 입력">
          {EXPIRY_PRESETS.map(({ label, days }) => {
            const value = daysFromToday(days)
            return (
              <button
                key={label}
                type="button"
                onClick={() => setExpiry(value)}
                aria-pressed={expiresAt === value}
                className="rounded-full border border-cream-300 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:border-ink-300 aria-pressed:border-brand-600 aria-pressed:bg-brand-50 aria-pressed:text-brand-800"
              >
                {label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setExpiry('')}
            aria-pressed={expiresAt === ''}
            className="rounded-full border border-cream-300 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:border-ink-300 aria-pressed:border-brand-600 aria-pressed:bg-brand-50 aria-pressed:text-brand-800"
          >
            기한 없음
          </button>
        </div>
        <FieldMessage
          id="ingredient-expires"
          error={errors.expiresAt?.message}
          hint="소금·간장처럼 기한이 없는 재료는 비워 두세요."
        />
      </div>

      <div className="sticky bottom-0 -mx-1 flex gap-2 bg-cream-50 px-1 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" className="flex-2" disabled={isSubmitting}>
          {isSubmitting ? '저장 중…' : isMultiple ? `냉장고에 ${names.length}개 넣기` : submitLabel}
        </Button>
      </div>
    </form>
  )
}
