const HANGUL_START = 0xac00 // '가'
const HANGUL_END = 0xd7a3 // '힣'

/**
 * 단어의 마지막 글자에 받침이 있는지 확인
 * 한글 완성형 글자는 (초성 × 21 + 중성) × 28 + 종성 순서로 배열되어 있어서
 * (코드 - '가') % 28 이 0이면 받침이 없는 글자입니다.
 */
export function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1)
  if (!last) return false
  const code = last.charCodeAt(0)
  if (code < HANGUL_START || code > HANGUL_END) return false // 영어·숫자 등은 받침 없음으로 처리
  return (code - HANGUL_START) % 28 !== 0
}

/** 목적격 조사 붙이기: 두부 → 두부를, 계란 → 계란을 ("을(를)" 같은 어색한 표기 방지) */
export function withObjectParticle(word: string): string {
  return `${word}${hasFinalConsonant(word) ? '을' : '를'}`
}
