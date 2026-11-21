# 냉털키친 앱 (Capacitor)

웹 화면(`../src`)은 하나만 있고, 이 폴더는 그 **빌드 결과(`../dist`)를 앱으로 감싸는 껍데기**입니다.
화면을 고치면 웹과 앱에 함께 반영돼요. (앱에는 `npm run sync`를 해야 들어감)

```
app/
├─ capacitor.config.ts   앱 이름·아이디, 웹 결과 폴더(../dist)
├─ android/              안드로이드 프로젝트 → Android Studio로 열기
└─ ios/                  아이폰 프로젝트 → 맥의 Xcode로 열기
```

## 명령 (이 `app` 폴더에서)

| 명령 | 하는 일 |
|------|---------|
| `npm run sync` | 웹 빌드 → 안드로이드·아이폰 폴더에 복사 |
| `npm run android` | sync 후 Android Studio 열기 → ▶ 버튼으로 폰/에뮬레이터에 실행 |
| `npm run ios` | sync 후 Xcode 열기 (**맥에서만**) |

## 아이폰
- 아이폰 앱은 애플 규칙상 **맥 + Xcode**로만 만들 수 있어요. 이 폴더(`ios/`)를 맥에 옮겨 `npm install` → `npm run ios`.
- 내 아이폰에 설치: 무료 Apple ID로도 되지만 7일마다 다시 설치해야 해요. 앱스토어/TestFlight는 Apple Developer(연 $99).

## 앱에서 다르게 동작하는 것
- **AI 셰프**: 앱에는 `/api/ai-chef`(내 컴퓨터 개발 서버)가 없어서 동작하지 않아요.
  앱에서 쓰려면 `../supabase/functions/ai-chef`(API 키 방식)로 연결을 바꿔야 해요.
- **회원가입 메일 링크**: 앱 안 주소(https://localhost)로 돌아오도록 되어 있어, 메일 인증은 웹에서 하는 게 편해요.
