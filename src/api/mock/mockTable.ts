/**
 * 아주 작은 "가짜 DB 테이블"
 *
 * Supabase를 연결하기 전까지 등록/수정/삭제를 실제처럼 체험할 수 있게 해 줍니다.
 * - 데이터는 메모리에 두고, 바뀔 때마다 localStorage에 저장 → 새로고침해도 유지
 * - localStorage를 쓸 수 없는 환경(시크릿 모드 등)에서도 앱이 죽지 않도록 try/catch
 *
 * M5에서 Supabase로 바꾸면 이 파일은 삭제합니다.
 */
export interface MockTable<T extends { id: string }> {
  list: () => T[]
  insert: (row: T) => T
  update: (id: string, patch: Partial<Omit<T, 'id'>>) => T
  remove: (id: string) => T
}

export function createMockTable<T extends { id: string }>(storageKey: string, seed: T[]): MockTable<T> {
  let rows: T[] = load() ?? structuredClone(seed)

  function load(): T[] | null {
    try {
      const raw = localStorage.getItem(storageKey)
      // 우리 앱이 직접 저장한 값이므로 형식을 신뢰합니다. (외부 데이터라면 Zod로 검증해야 해요)
      return raw ? (JSON.parse(raw) as T[]) : null
    } catch {
      return null
    }
  }

  function save(): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows))
    } catch {
      // 저장 실패는 무시 (메모리에는 남아 있으므로 현재 세션 동안은 정상 동작)
    }
  }

  function findOrThrow(id: string): T {
    const row = rows.find((item) => item.id === id)
    if (!row) throw new Error('데이터를 찾을 수 없어요. 이미 삭제되었을 수 있어요.')
    return row
  }

  return {
    list: () => structuredClone(rows),

    insert(row) {
      rows = [row, ...rows]
      save()
      return structuredClone(row)
    },

    update(id, patch) {
      const updated = { ...findOrThrow(id), ...patch }
      rows = rows.map((item) => (item.id === id ? updated : item))
      save()
      return structuredClone(updated)
    },

    remove(id) {
      const removed = findOrThrow(id)
      rows = rows.filter((item) => item.id !== id)
      save()
      return removed
    },
  }
}
