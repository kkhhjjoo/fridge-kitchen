import { Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useIsFavorite, useToggleFavorite } from '../hooks/useFavorites'

interface FavoriteButtonProps {
  recipeId: string
  recipeTitle: string
  className?: string
}

/**
 * 즐겨찾기 하트 버튼
 * aria-pressed: 눌림/안 눌림 상태가 있는 토글 버튼임을 스크린리더에 알려 줍니다.
 */
export function FavoriteButton({ recipeId, recipeTitle, className }: FavoriteButtonProps) {
  const isFavorite = useIsFavorite(recipeId)
  const toggleFavorite = useToggleFavorite()

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`${recipeTitle} 즐겨찾기`}
      onClick={() => toggleFavorite.mutate({ recipeId, favorite: !isFavorite })}
      className={cn(
        'grid size-10 place-items-center rounded-full bg-white/95 shadow-sm transition-transform active:scale-90',
        isFavorite ? 'text-red-500' : 'text-ink-500 hover:text-red-500',
        className,
      )}
    >
      <Heart aria-hidden className={cn('size-5', isFavorite && 'fill-current')} />
    </button>
  )
}
