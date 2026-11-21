import { isRouteErrorResponse, useRouteError } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { StateMessage } from '@/components/ui/StateMessage'

/**
 * 렌더링 중 예상치 못한 에러가 나면 보여줄 화면 (라우터의 errorElement)
 * 이게 없으면 사용자는 개발자용 에러 스택을 그대로 보게 됩니다.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : '알 수 없는 오류'

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="sr-only">오류 발생</h1>
      <StateMessage
        icon={<span className="text-5xl" aria-hidden>🍳</span>}
        title="앗, 문제가 생겼어요"
        description={import.meta.env.DEV ? message : '잠시 후 다시 시도해 주세요.'}
        action={
          // <Link> 대신 <a>: 전체 새로고침으로 꼬인 상태를 확실히 초기화합니다.
          <a href="/" className={buttonStyles()}>
            홈으로 가기
          </a>
        }
      />
    </div>
  )
}
