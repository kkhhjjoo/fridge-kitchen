import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SeenNotificationsState {
  /** 이미 본 알림의 키 목록 */
  seenKeys: string[]
  /** 지금 있는 알림을 모두 읽음으로 (사라진 알림의 키는 정리해서 목록이 계속 커지지 않게) */
  markAllSeen: (currentKeys: string[]) => void
}

/**
 * "어떤 알림을 이미 봤는지" 기억 (Zustand + persist → 이 브라우저의 localStorage에 저장)
 *
 * 알림 자체는 냉장고 재료에서 그때그때 계산하므로 DB에 저장하지 않아요.
 * 읽음 표시만 브라우저에 남기면 충분합니다. (다른 기기에서는 다시 "새 알림"으로 보일 수 있어요)
 */
export const useSeenNotificationsStore = create<SeenNotificationsState>()(
  persist(
    (set) => ({
      seenKeys: [],
      markAllSeen: (currentKeys) => set({ seenKeys: currentKeys }),
    }),
    { name: 'fridge-kitchen:notifications-seen:v1' },
  ),
)
