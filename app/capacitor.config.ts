import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 냉털키친 앱 설정 (Capacitor)
 *
 * Capacitor = 웹 화면(React)을 안드로이드/iOS 앱 안의 브라우저(WebView)에 넣어 주는 도구.
 * 화면 코드는 웹 폴더(../src) 하나만 있고, 앱은 그 빌드 결과(../dist)를 가져다 씁니다.
 */
const config: CapacitorConfig = {
  // 앱의 고유 이름 (플레이스토어에 올리면 바꿀 수 없으니 정해 두고 쓰기)
  appId: 'com.fridgekitchen.app',
  appName: '냉털키친',
  // 웹을 빌드한 결과 폴더 (npm run build:web → ../dist)
  webDir: '../dist',
  android: {
    // 개발 중 디버깅 허용 (크롬 chrome://inspect 로 앱 안 화면 검사 가능)
    webContentsDebuggingEnabled: true,
  },
}

export default config
