/**
 * 목 API 요청 헬퍼
 * 실제 네트워크처럼 약간의 지연을 주고 Promise로 데이터를 돌려줍니다.
 * → 로딩 스켈레톤, 버튼 비활성화 같은 UI를 지금부터 실제와 똑같이 개발·확인할 수 있어요.
 *
 * structuredClone: 원본 데이터를 복사해서 반환합니다.
 * (화면 쪽에서 객체를 수정해도 목 DB가 오염되지 않도록)
 */
export function mockRequest<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delayMs)
  })
}

/** 지정한 시간만큼 기다리기 (등록·수정·삭제처럼 "작업 후 응답"하는 목 API용) */
export function mockDelay(delayMs = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
