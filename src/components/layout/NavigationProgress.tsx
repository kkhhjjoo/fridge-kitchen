import { useNavigation } from 'react-router'
import { cn } from '@/lib/cn'

/**
 * 페이지 이동 중 상단에 나타나는 얇은 진행 막대
 *
 * lazy 페이지로 이동하면 라우터는 새 페이지 코드를 다 받을 때까지 이전 화면을 유지합니다.
 * 그동안 아무 반응이 없으면 "클릭이 안 됐나?" 싶으니, useNavigation()으로
 * 이동 중(state === 'loading')임을 감지해 막대를 보여 줍니다.
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const isLoading = navigation.state !== 'idle'

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent-500 transition-[transform,opacity]',
        // 로딩 시작: 80%까지 천천히 차오름 → 끝나면 사라짐
        isLoading ? 'scale-x-80 opacity-100 duration-[2000ms]' : 'scale-x-100 opacity-0 duration-200',
      )}
    />
  )
}
