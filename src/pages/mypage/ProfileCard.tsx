import { useMutation } from '@tanstack/react-query'
import { LogOut, Pencil, UserRound } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { signOut } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { fieldAria } from '@/components/ui/fieldAria'
import { FieldMessage, Input } from '@/components/ui/FormField'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile'
import { isSupabaseEnabled } from '@/lib/supabase'

/** 닉네임 규칙 — 회원가입 화면, DB check 제약(1~20자)과 같게 */
const nicknameSchema = z.string().trim().min(1, '닉네임을 입력해 주세요.').max(20, '20자 이내로 입력해 주세요.')

/** 마이페이지 맨 위: 내 프로필(닉네임 수정) + 이메일 + 로그아웃 */
export function ProfileCard() {
  const user = useAuthStore((state) => state.user)
  const profileQuery = useProfile()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()

  // 수정 중일 때만 입력칸을 보여 줌 (null = 보기 모드)
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const inputId = useId()

  const logout = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // replace: 뒤로가기로 로그인 필요한 화면에 돌아오지 않도록 기록을 바꿔치기
      void navigate('/login', { replace: true })
      toast.success('로그아웃했어요.')
    },
    onError: (logoutError) => toast.error(logoutError.message),
  })

  if (!user) return null

  // 프로필을 아직 못 불러왔으면 회원가입 때 넣은 닉네임으로 먼저 보여 줌
  const nickname = profileQuery.data?.nickname ?? user.nickname

  const startEditing = () => {
    setDraft(nickname)
    setError(undefined)
  }

  const cancelEditing = () => {
    setDraft(null)
    setError(undefined)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // 폼 기본 동작(페이지 새로고침) 막기
    const result = nicknameSchema.safeParse(draft)
    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }
    if (result.data === nickname) {
      cancelEditing() // 바뀐 게 없으면 저장 요청 없이 닫기
      return
    }
    updateProfile.mutate(
      { nickname: result.data },
      {
        onSuccess: () => {
          cancelEditing()
          toast.success('닉네임을 바꿨어요.')
        },
        onError: (saveError) => toast.error(saveError.message),
      },
    )
  }

  return (
    <section
      aria-label="내 프로필"
      className="flex flex-wrap items-center gap-4 rounded-card bg-white p-5 shadow-card"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
        <UserRound aria-hidden className="size-7" />
      </span>

      {draft === null ? (
        <>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              {profileQuery.isPending ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <p className="truncate text-lg font-bold text-ink-900">{nickname}님</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="size-9 shrink-0 px-0"
                onClick={startEditing}
                disabled={profileQuery.isPending}
                aria-label="닉네임 바꾸기"
              >
                <Pencil aria-hidden className="size-4" />
              </Button>
            </div>
            <p className="truncate text-sm text-ink-500">{user.email}</p>
          </div>
          {/* 데모 모드에는 로그인 개념이 없으므로 로그아웃 버튼도 숨김 */}
          {isSupabaseEnabled && (
            <Button variant="secondary" onClick={() => logout.mutate()} disabled={logout.isPending}>
              <LogOut aria-hidden className="size-4" />
              로그아웃
            </Button>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={inputId} className="text-sm font-semibold text-ink-700">
            닉네임
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={20}
              autoComplete="nickname"
              autoFocus
              className="min-w-0 flex-1 basis-40"
              {...fieldAria(inputId, error, true)}
            />
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? '저장 중…' : '저장'}
            </Button>
            <Button variant="secondary" onClick={cancelEditing} disabled={updateProfile.isPending}>
              취소
            </Button>
          </div>
          <FieldMessage id={inputId} error={error} hint="1~20자로 적어 주세요." />
        </form>
      )}
    </section>
  )
}
