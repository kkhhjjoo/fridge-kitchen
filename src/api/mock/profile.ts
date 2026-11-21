import type { ProfileApi } from '../contracts'
import { profileTable as table } from './db'
import { mockDelay } from './delay'

const DEMO_ID = 'demo'

/** 테이블의 행 → 화면용 Profile (id는 빼고 돌려줌) */
function readProfile() {
  const row = table.list().find((item) => item.id === DEMO_ID)
  if (!row) throw new Error('프로필을 찾을 수 없어요.')
  return { nickname: row.nickname, expiryAlertDays: row.expiryAlertDays }
}

/** 데모 모드 프로필 API (localStorage) */
export const mockProfileApi: ProfileApi = {
  async fetchProfile() {
    await mockDelay(200)
    return readProfile()
  },

  async updateProfile(update) {
    await mockDelay()
    table.update(DEMO_ID, update)
    return readProfile()
  },
}
