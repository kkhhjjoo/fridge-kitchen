import { isSupabaseEnabled } from '@/lib/supabase'
import type { ProfileApi } from './contracts'
import { mockProfileApi } from './mock/profile'
import { supabaseProfileApi } from './supabase/profile'

/** 환경 변수 유무에 따라 구현을 고릅니다. (Supabase 모드 / 데모 모드) */
const api: ProfileApi = isSupabaseEnabled ? supabaseProfileApi : mockProfileApi

export const { fetchProfile, updateProfile } = api
