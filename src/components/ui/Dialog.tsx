import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

/**
 * 모달 다이얼로그 — 모바일에서는 바텀시트, sm(640px) 이상에서는 가운데 팝업
 *
 * 브라우저 내장 <dialog> 요소를 사용합니다. showModal()로 열면 브라우저가 알아서
 *  - 다이얼로그 밖으로 Tab 포커스가 나가지 않게 막고(포커스 트랩)
 *  - Esc 키로 닫히게 하고
 *  - 뒤쪽 화면을 스크린리더가 읽지 않게 처리해 줍니다.
 * 직접 구현하면 수십 줄이 필요한 접근성 기능을 공짜로 얻는 셈이에요.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId() // 접근성용 고유 id (같은 컴포넌트를 여러 번 써도 겹치지 않음)
  const descriptionId = useId()

  // React의 open 상태 ↔ 실제 <dialog>의 열림 상태를 동기화
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal()은 첫 번째 버튼(닫기)에 포커스를 줍니다.
      // 내용 중 data-autofocus가 붙은 요소가 있으면 그쪽으로 포커스를 옮겨요 (예: 이름 입력칸)
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Esc 키: 브라우저가 직접 닫지 못하게 막고(preventDefault) React 상태로 닫습니다.
      // → "열림/닫힘"의 기준이 항상 open prop 하나로 유지돼요 (Single Source of Truth)
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // 바깥 어두운 영역(backdrop)을 클릭하면 닫기: 클릭 대상이 dialog 자신일 때만
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-cream-50 p-0 text-ink-900 shadow-2xl backdrop:bg-ink-900/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      {/* 닫혀 있을 땐 내용을 렌더링하지 않음 → 다시 열 때마다 폼이 깨끗하게 초기화돼요 */}
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-cream-200 px-5 pt-5 pb-4 sm:px-6">
            <div>
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-500">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-cream-200 hover:text-ink-900"
            >
              <X aria-hidden className="size-5" />
            </button>
          </header>
          {/* 내용이 길면 이 영역만 스크롤 (헤더는 고정) */}
          <div className="overflow-y-auto px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
            {children}
          </div>
        </div>
      )}
    </dialog>
  )
}
