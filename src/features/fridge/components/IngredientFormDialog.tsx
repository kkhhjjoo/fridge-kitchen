import { Dialog } from '@/components/ui/Dialog'
import {
  useCreateIngredient,
  useCreateIngredients,
  useUpdateIngredient,
} from '../hooks/useIngredientMutations'
import {
  EMPTY_INGREDIENT_FORM,
  splitIngredientNames,
  toFormValues,
  type IngredientFormOutput,
} from '../schemas'
import type { Ingredient } from '../types'
import { buildGuessedIngredientInput } from '../utils/guessDefaults'
import { IngredientForm } from './IngredientForm'

/**
 * 다이얼로그가 "무엇을 하려고 열렸는지"를 표현하는 타입 (구별된 유니온, Discriminated Union)
 *  - { mode: 'create' }              → 새 재료 등록
 *  - { mode: 'edit', ingredient }    → 기존 재료 수정 (ingredient가 반드시 있음)
 *  - null                            → 닫힘
 * mode 값을 확인하면 TypeScript가 ingredient가 있는지 자동으로 알아냅니다.
 */
export type IngredientEditorState =
  | { mode: 'create' }
  | { mode: 'edit'; ingredient: Ingredient }
  | null

interface IngredientFormDialogProps {
  state: IngredientEditorState
  onClose: () => void
}

export function IngredientFormDialog({ state, onClose }: IngredientFormDialogProps) {
  const createMutation = useCreateIngredient()
  const createManyMutation = useCreateIngredients()
  const updateMutation = useUpdateIngredient()

  const handleSubmit = (values: IngredientFormOutput) => {
    // 검증을 통과했으므로 이름이 1개 이상 있음. '대파,'처럼 끝에 붙은 쉼표도 여기서 정리됩니다.
    const names = splitIngredientNames(values.name)

    // mutate의 두 번째 인자: 이번 호출에만 적용되는 콜백 → 성공했을 때만 다이얼로그 닫기
    // (실패하면 열린 채로 두어 사용자가 입력한 내용을 잃지 않게)
    if (state?.mode === 'edit') {
      updateMutation.mutate(
        { id: state.ingredient.id, input: { ...values, name: names[0] ?? values.name } },
        { onSuccess: onClose },
      )
    } else if (names.length > 1) {
      // 여러 개: 카테고리·보관 위치·유통기한은 재료마다 이름으로 추측, 수량·단위는 공통
      const inputs = names.map((name) => buildGuessedIngredientInput(name, values))
      createManyMutation.mutate(inputs, { onSuccess: onClose })
    } else {
      createMutation.mutate({ ...values, name: names[0] ?? values.name }, { onSuccess: onClose })
    }
  }

  const isEdit = state?.mode === 'edit'

  return (
    <Dialog
      open={state !== null}
      onClose={onClose}
      title={isEdit ? '재료 수정' : '재료 등록'}
      description={isEdit ? undefined : '냉장고에 넣은 재료를 기록해 두세요.'}
    >
      {state && (
        <IngredientForm
          // key가 바뀌면 React가 컴포넌트를 새로 만듭니다 → 다른 재료를 수정할 때 폼이 확실히 초기화
          key={state.mode === 'edit' ? state.ingredient.id : 'create'}
          defaultValues={
            state.mode === 'edit' ? toFormValues(state.ingredient) : EMPTY_INGREDIENT_FORM
          }
          allowMultiple={!isEdit}
          submitLabel={isEdit ? '수정 완료' : '냉장고에 넣기'}
          isSubmitting={
            createMutation.isPending || createManyMutation.isPending || updateMutation.isPending
          }
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Dialog>
  )
}
