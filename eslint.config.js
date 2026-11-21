import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // supabase/functions: 브라우저가 아니라 Supabase 서버(Deno)에서 도는 코드라 규칙·전역 변수가 달라서 제외
  // app: 앱(Capacitor) 폴더 — 빌드된 웹 파일 복사본과 안드로이드·아이폰 프로젝트라 검사 대상이 아님
  globalIgnores(['dist', 'supabase/functions', 'app']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // 프로젝트 규칙: any 사용 금지
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
])
