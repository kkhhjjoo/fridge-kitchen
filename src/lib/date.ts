const MS_PER_DAY = 1000 * 60 * 60 * 24

/** 시·분·초를 버리고 '날짜'만 남긴 Date (D-day 계산이 시간대에 흔들리지 않도록) */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** 'YYYY-MM-DD' 문자열을 로컬 자정 기준 Date로 변환 */
export function parseDateOnly(value: string): Date {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Date → 'YYYY-MM-DD' (DB의 date 타입과 같은 형식) */
export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 오늘 기준 n일 뒤 날짜 문자열 (목 데이터 생성용) */
export function daysFromToday(days: number, today: Date = new Date()): string {
  const date = startOfDay(today)
  date.setDate(date.getDate() + days)
  return toDateOnlyString(date)
}

/** 오늘부터 target 날짜까지 남은 일수. 지났으면 음수. */
export function daysUntil(target: string, today: Date = new Date()): number {
  const diff = parseDateOnly(target).getTime() - startOfDay(today).getTime()
  return Math.round(diff / MS_PER_DAY)
}

/** 'M월 D일' 형식 */
export function formatMonthDay(value: string): string {
  const date = parseDateOnly(value)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}
