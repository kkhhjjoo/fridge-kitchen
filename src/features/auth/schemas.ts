import { z } from 'zod'

const email = z.string().trim().min(1, '이메일을 입력해 주세요.').pipe(z.email('올바른 이메일 형식이 아니에요.'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
})

export type LoginValues = z.infer<typeof loginSchema>

/**
 * 회원가입 — 비밀번호 확인은 두 필드를 비교해야 해서 .refine()으로 검사하고,
 * path로 에러를 "비밀번호 확인" 칸에 붙입니다.
 */
export const signupSchema = z
  .object({
    nickname: z.string().trim().min(1, '닉네임을 입력해 주세요.').max(20, '20자 이내로 입력해 주세요.'),
    email,
    password: z
      .string()
      .min(8, '8자 이상 입력해 주세요.')
      .regex(/[A-Za-z]/, '영문을 포함해 주세요.')
      .regex(/[0-9]/, '숫자를 포함해 주세요.'),
    passwordConfirm: z.string().min(1, '비밀번호를 한 번 더 입력해 주세요.'),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: '비밀번호가 서로 달라요.',
    path: ['passwordConfirm'],
  })

export type SignupValues = z.infer<typeof signupSchema>
