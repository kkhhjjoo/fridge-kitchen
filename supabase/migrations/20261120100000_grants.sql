-- ════════════════════════════════════════════════════════════════
--  API 역할 권한 부여 (GRANT)
--
--  보안은 두 겹입니다.
--   1) GRANT : 이 역할이 "이 테이블에 이런 작업을 할 수 있나?" (테이블 단위 문)
--   2) RLS   : 그중 "어떤 행을 볼 수 있나?" (행 단위 필터) — init.sql의 정책
--  최근 Supabase 프로젝트는 SQL로 만든 테이블에 1)을 자동으로 열어 주지 않아서
--  직접 GRANT 해야 합니다. 빠뜨리면 "permission denied for table"(403) 에러가 납니다.
--
--  원칙: 최소 권한
--   - anon(로그인 안 한 사용자)에게는 아무것도 주지 않음 → 앱이 로그인 필수이므로
--   - authenticated(로그인 사용자)에게도 필요한 작업만
-- ════════════════════════════════════════════════════════════════

grant usage on schema public to authenticated;

-- 공용 레시피: 읽기만
grant select on public.recipes, public.recipe_ingredients, public.recipe_steps to authenticated;

-- 프로필: 조회·수정만 (생성은 회원가입 트리거가, 삭제는 계정 삭제 시 cascade로)
grant select, update (nickname, expiry_alert_days) on public.profiles to authenticated;

-- 개인 데이터: CRUD (어떤 행인지는 RLS가 "내 것만"으로 제한)
grant select, insert, update, delete on public.ingredients to authenticated;
grant select, insert, update, delete on public.shopping_items to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert on public.cooking_logs to authenticated;

-- ── 함수 실행 권한 ──
-- Postgres는 새 함수의 실행 권한을 기본으로 PUBLIC(모두)에게 줍니다. → 먼저 회수하고 필요한 역할에만 부여
revoke execute on function public.stock_from_shopping(jsonb, uuid[]) from public, anon;
revoke execute on function public.complete_cooking(uuid, jsonb) from public, anon;
grant execute on function public.stock_from_shopping(jsonb, uuid[]) to authenticated;
grant execute on function public.complete_cooking(uuid, jsonb) to authenticated;

-- 회원가입 트리거 함수는 트리거로만 실행되어야 함 (API로 직접 호출 불가)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
