import { isSupabaseEnabled } from '@/lib/supabase'
import type { CookingLogsApi } from './contracts'
import { mockCookingLogsApi } from './mock/cookingLogs'
import { supabaseCookingLogsApi } from './supabase/cookingLogs'

/** 환경 변수 유무에 따라 구현을 고릅니다. (Supabase 모드 / 데모 모드) */
const api: CookingLogsApi = isSupabaseEnabled ? supabaseCookingLogsApi : mockCookingLogsApi

export const { fetchCookingLogs } = api
