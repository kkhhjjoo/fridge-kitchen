import { Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { HERO_IMAGE_URL } from '@/mocks/recipes'

/** 시간대별 인사말 — 작은 디테일이지만 서비스가 "나에게 말을 거는" 느낌을 줍니다. */
function getGreeting(hour: number): string {
  if (hour < 11) return '좋은 아침이에요'
  if (hour < 17) return '맛있는 점심 시간이에요'
  return '오늘 하루도 수고했어요'
}

interface HeroSectionProps {
  expiringCount: number | undefined
}

export function HeroSection({ expiringCount }: HeroSectionProps) {
  const greeting = getGreeting(new Date().getHours())

  return (
    <section className="grid overflow-hidden rounded-[2rem] bg-brand-700 text-white md:grid-cols-[1.1fr_1fr]">
      {/* 모바일에서는 이미지가 위(order-first), 데스크톱에서는 오른쪽(order-last) */}
      <div className="relative order-first h-48 sm:h-64 md:order-last md:h-auto">
        <img
          src={HERO_IMAGE_URL}
          alt="신선한 채소와 계란이 담긴 건강한 한 접시"
          className="absolute inset-0 size-full object-cover"
          fetchPriority="high" // 첫 화면의 가장 큰 이미지 → 먼저 로드 (LCP 개선)
        />
        {/* 이미지와 녹색 배경이 자연스럽게 이어지도록 그라데이션 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-brand-700 via-brand-700/10 to-transparent md:bg-gradient-to-r md:from-brand-700 md:via-brand-700/10"
        />
      </div>

      <div className="relative px-6 pt-2 pb-8 sm:px-10 md:py-14">
        <p className="text-sm font-medium text-brand-100">{greeting} 👋</p>
        <h1 className="mt-3 text-[1.75rem] leading-tight font-extrabold tracking-tight sm:text-4xl">
          냉장고 속 재료로
          <br />
          오늘 한 끼 <span className="text-accent-400">뚝딱</span>
        </h1>
        <p className="mt-4 max-w-sm text-brand-100">
          {expiringCount
            ? `유통기한이 임박한 재료가 ${expiringCount}개 있어요. 버리기 전에 맛있게 만들어 볼까요?`
            : '가지고 있는 재료를 등록하면 지금 만들 수 있는 요리를 추천해 드려요.'}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/recipes" className={buttonStyles({ variant: 'accent', size: 'lg' })}>
            <Sparkles aria-hidden className="size-5" />
            AI 레시피 추천받기
          </Link>
          <Link
            to="/fridge?new=1"
            className={buttonStyles({
              variant: 'ghost',
              size: 'lg',
              className: 'bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20',
            })}
          >
            <Plus aria-hidden className="size-5" />
            재료 등록하기
          </Link>
        </div>
      </div>
    </section>
  )
}
