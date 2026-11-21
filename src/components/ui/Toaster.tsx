import { Toaster as SonnerToaster } from 'sonner'

/**
 * 전역 토스트 표시 영역 — sonner 라이브러리 사용
 *
 * 사용법 (어느 파일에서든):
 *   import { toast } from 'sonner'
 *   toast.success('저장했어요')
 *   toast.error('실패했어요')
 *   toast.success('삭제했어요', { action: { label: '실행 취소', onClick: undo } })
 *
 * 이 컴포넌트는 sonner의 <Toaster>를 우리 앱 디자인에 맞게 한 번 감싼 것입니다.
 * → 위치·색상·문구 설정을 한곳에서 관리하고, 앱에는 AppLayout에서 딱 한 번만 렌더링해요.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      theme="light"
      richColors // 성공=초록, 에러=빨강 등 종류별 색상
      closeButton
      duration={4000}
      visibleToasts={3}
      // 모바일 하단 탭바(높이 4rem)에 가리지 않도록 그 위에 띄웁니다
      offset={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      mobileOffset={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      containerAriaLabel="알림"
      toastOptions={{
        // Tailwind v4에서 클래스 뒤의 !는 !important — 라이브러리 기본 스타일을 덮어쓰기 위해 사용
        classNames: {
          toast: 'rounded-2xl! font-sans! text-sm! shadow-lg!',
          actionButton: 'rounded-lg! bg-accent-500! font-bold! text-white!',
        },
      }}
    />
  )
}
