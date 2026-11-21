/**
 * 입력 요소에 붙일 접근성 속성 묶음 (FormField / FieldMessage와 짝)
 *   <Input {...fieldAria('ingredient-name', errors.name?.message)} />
 *
 * 컴포넌트 파일과 분리한 이유: Vite의 빠른 새로고침(Fast Refresh)은
 * 컴포넌트만 export하는 파일에서 가장 잘 동작하기 때문이에요.
 */
export function fieldAria(id: string, error?: string, hasHint = false) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hasHint ? `${id}-message` : undefined,
  }
}
