import { Link } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { StateMessage } from '@/components/ui/StateMessage'

export function NotFoundPage() {
  return (
    <div className="py-10">
      <h1 className="sr-only">페이지를 찾을 수 없음</h1>
      <StateMessage
        icon={<span className="text-5xl" aria-hidden>🥕</span>}
        title="페이지를 찾을 수 없어요"
        description="주소가 바뀌었거나 삭제된 페이지일 수 있어요."
        action={
          <Link to="/" className={buttonStyles()}>
            홈으로 가기
          </Link>
        }
      />
    </div>
  )
}
