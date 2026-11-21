import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { aiChefDevPlugin } from './dev-server/aiChefPlugin'

// https://vite.dev/config/
export default defineConfig({
  // tailwindcss(): Tailwind v4 공식 Vite 플러그인 (별도 postcss 설정 불필요)
  // aiChefDevPlugin(): 개발 서버에서만 /api/ai-chef 주소를 열어 내 컴퓨터의 claude(구독)로 AI 셰프를 돌림
  plugins: [react(), tailwindcss(), aiChefDevPlugin()],
  resolve: {
    // '@/components/...' 처럼 src 기준 절대 경로로 import 할 수 있게 해 줍니다.
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
    // React는 앱 전체에서 반드시 한 벌만 있어야 합니다(Hook이 동작하는 전제).
    // 개발 서버의 의존성 사전 번들링이 라이브러리 안에 React를 중복 포함하는 것을 막아 줍니다.
    dedupe: ['react', 'react-dom'],
  },
})
