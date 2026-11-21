import type { ReactNode } from 'react'
import { Construction } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { PageHeader } from '@/components/ui/PageHeader'
import { StateMessage } from '@/components/ui/StateMessage'

interface ComingSoonPageProps {
  title: string
  description: string
  /** 이 페이지에 들어갈 예정 기능 (기획 문서와 동일) */
  plannedFeatures: string[]
  /** 제목과 "준비 중" 안내 사이에 먼저 보여줄 내용 (예: 마이페이지의 계정 카드) */
  before?: ReactNode
}

/**
 * 아직 구현 전인 페이지의 임시 화면
 * 라우팅·내비게이션은 지금 완성해 두고, 내용은 다음 마일스톤에서 채웁니다.
 */
export function ComingSoonPage({ title, description, plannedFeatures, before }: ComingSoonPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      {before}
      <StateMessage
        icon={<Construction aria-hidden className="size-8" />}
        title="열심히 준비하고 있어요"
        description="곧 이런 기능을 만나볼 수 있어요."
        action={
          <div className="flex flex-col items-center gap-5">
            <ul className="flex flex-wrap justify-center gap-2">
              {plannedFeatures.map((feature) => (
                <li
                  key={feature}
                  className="rounded-full bg-white px-3 py-1 text-sm text-ink-700 ring-1 ring-cream-300"
                >
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/" className={buttonStyles({ variant: 'secondary' })}>
              홈으로 돌아가기
            </Link>
          </div>
        }
      />
    </>
  )
}
