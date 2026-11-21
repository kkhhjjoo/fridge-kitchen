import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { signUpWithEmail } from '@/api/auth'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { fieldAria } from '@/components/ui/fieldAria'
import { FormField, Input } from '@/components/ui/FormField'
import { GuestOnly } from '@/features/auth/components/GuestOnly'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { signupSchema, type SignupValues } from '@/features/auth/schemas'

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nickname: '', email: '', password: '', passwordConfirm: '' },
  })

  const signup = useMutation({
    mutationFn: ({ email, password, nickname }: SignupValues) =>
      signUpWithEmail(email, password, nickname),
  })

  // 이메일 인증이 필요한 경우: 폼 대신 "메일함을 확인하세요" 안내
  if (signup.data?.needsEmailConfirmation) {
    return (
      <GuestOnly>
        <AuthLayout title="메일함을 확인해 주세요" description="거의 다 됐어요!">
          <div className="flex flex-col items-center text-center">
            <MailCheck aria-hidden className="size-12 text-brand-600" />
            <p className="mt-4 text-sm text-ink-700">
              <strong>{getValues('email')}</strong>로 인증 메일을 보냈어요.
              <br />
              메일의 링크를 누르면 바로 시작할 수 있어요.
            </p>
            <Link to={loginHref} className="mt-6 text-sm font-semibold text-brand-700 hover:underline">
              로그인 화면으로
            </Link>
          </div>
        </AuthLayout>
      </GuestOnly>
    )
  }

  return (
    <GuestOnly>
      <AuthLayout
        title="냉털키친 시작하기"
        description="냉장고 속 재료로 오늘 한 끼를 찾아 드려요."
        footer={
          <>
            이미 계정이 있나요?{' '}
            <Link to={loginHref} className="font-semibold text-brand-700 hover:underline">
              로그인
            </Link>
          </>
        }
      >
        <form
          noValidate
          onSubmit={handleSubmit((values) => signup.mutate(values))}
          className="space-y-4"
        >
          {signup.error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {signup.error.message}
            </p>
          )}
          <FormField id="signup-nickname" label="닉네임" error={errors.nickname?.message}>
            <Input
              {...fieldAria('signup-nickname', errors.nickname?.message)}
              {...register('nickname')}
              autoComplete="nickname"
              placeholder="예) 냉털요정"
            />
          </FormField>
          <FormField id="signup-email" label="이메일" error={errors.email?.message}>
            <Input
              {...fieldAria('signup-email', errors.email?.message)}
              {...register('email')}
              type="email"
              autoComplete="email"
              inputMode="email"
            />
          </FormField>
          <FormField
            id="signup-password"
            label="비밀번호"
            error={errors.password?.message}
            hint="영문과 숫자를 섞어 8자 이상"
          >
            <PasswordInput
              {...fieldAria('signup-password', errors.password?.message, true)}
              {...register('password')}
              autoComplete="new-password" // 브라우저가 강력한 비밀번호를 제안해 줌
            />
          </FormField>
          <FormField id="signup-password-confirm" label="비밀번호 확인" error={errors.passwordConfirm?.message}>
            <PasswordInput
              {...fieldAria('signup-password-confirm', errors.passwordConfirm?.message)}
              {...register('passwordConfirm')}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? '가입 중…' : '가입하기'}
          </Button>
        </form>
      </AuthLayout>
    </GuestOnly>
  )
}
