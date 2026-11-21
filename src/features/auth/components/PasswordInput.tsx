import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentPropsWithRef } from 'react'
import { Input } from '@/components/ui/FormField'

/**
 * 비밀번호 입력칸 + "보기" 토글
 * 모바일에서 오타를 확인할 수 있게 해 주는 작은 배려예요.
 * register()가 넘겨주는 ref·onChange 등은 그대로 <Input>에 전달됩니다.
 */
export function PasswordInput(props: Omit<ComponentPropsWithRef<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-cream-100"
      >
        {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
      </button>
    </div>
  )
}
