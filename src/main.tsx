import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './index.css'

const rootElement = document.getElementById('root')
// any 대신 명시적 null 체크: 타입스크립트가 이후 rootElement를 HTMLElement로 확신할 수 있어요.
if (!rootElement) throw new Error('#root 요소를 찾을 수 없습니다.')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
