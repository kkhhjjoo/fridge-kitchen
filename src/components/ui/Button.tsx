import type { ComponentPropsWithRef } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

// ComponentPropsWithRef<'button'>: onClick, disabled, aria-* 등 기본 button 속성을 모두 받습니다.
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  // type 기본값을 'button'으로: form 안에서 의도치 않게 submit 되는 실수를 막아 줍니다.
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />
}
