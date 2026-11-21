import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { signInWithEmail } from '@/api/auth'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { fieldAria } from '@/components/ui/fieldAria'
import { FormField, Input } from '@/components/ui/FormField'
import { GuestOnly } from '@/features/auth/components/GuestOnly'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { loginSchema, type LoginValues } from '@/features/auth/schemas'

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // 로그인 요청도 "서버 상태를 바꾸는 작업"이라 useMutation으로 isPending/error를 편하게 관리
  // 성공하면 AuthListener가 세션을 받아 상태를 바꾸고 → GuestOnly가 원래 페이지로 이동시킵니다.
  const login = useMutation({
    mutationFn: ({ email, password }: LoginValues) => signInWithEmail(email, password),
  })

  return (
    <form noValidate onSubmit={handleSubmit((values) => login.mutate(values))} className="space-y-4">
      {login.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {login.error.message}
        </p>
      )}
      <FormField id="login-email" label="이메일" error={errors.email?.message}>
        <Input
          {...fieldAria('login-email', errors.email?.message)}
          {...register('email')}
          type="email"
          autoComplete="email" // 브라우저·비밀번호 관리자의 자동 입력 지원
          inputMode="email"
        />
      </FormField>
      <FormField id="login-password" label="비밀번호" error={errors.password?.message}>
        <PasswordInput
          {...fieldAria('login-password', errors.password?.message)}
          {...register('password')}
          autoComplete="current-password"
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
        {login.isPending ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  )
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  // 회원가입 페이지로 갈 때도 "원래 가려던 곳"을 이어서 전달
  const redirect = searchParams.get('redirect')
  const signupHref = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'

  return (
    <GuestOnly>
      <AuthLayout
        title="다시 만나서 반가워요 👋"
        description="로그인하고 내 냉장고를 확인하세요."
        footer={
          <>
            아직 계정이 없나요?{' '}
            <Link to={signupHref} className="font-semibold text-brand-700 hover:underline">
              회원가입
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthLayout>
    </GuestOnly>
  )
}
