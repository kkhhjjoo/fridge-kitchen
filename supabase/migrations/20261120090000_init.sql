-- ════════════════════════════════════════════════════════════════
--  냉털키친 초기 스키마
--  docs/PLANNING.md 5장 "데이터베이스 구조"를 실제 SQL로 옮긴 파일입니다.
--  Supabase 대시보드 → SQL Editor 에 붙여 넣고 Run 하면 됩니다. (한 번만)
-- ════════════════════════════════════════════════════════════════

-- ── 1. enum(정해진 값만 허용하는 타입) ─────────────────────────────
create type public.ingredient_category as enum
  ('vegetable', 'fruit', 'meat', 'seafood', 'dairy', 'grain', 'sauce', 'etc');
create type public.storage_type as enum ('fridge', 'freezer', 'room');
create type public.difficulty as enum ('easy', 'medium', 'hard');

-- ── 2. 프로필 (auth.users와 1:1) ──────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '냉털러' check (char_length(nickname) between 1 and 20),
  expiry_alert_days int not null default 3 check (expiry_alert_days between 1 and 14),
  created_at timestamptz not null default now()
);

-- 회원가입하면 프로필 행을 자동으로 만들어 주는 트리거
-- security definer: auth 스키마 이벤트에서 public 테이블에 쓰기 위해 함수 소유자 권한으로 실행
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), '냉털러'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 3. 냉장고 식재료 ───────────────────────────────────────────────
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  -- default auth.uid(): 앱에서 user_id를 보내지 않아도 로그인한 사용자 id가 자동으로 들어감
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  category public.ingredient_category not null,
  quantity numeric(10, 2) not null check (quantity >= 0),
  unit text not null check (char_length(unit) between 1 and 10),
  storage public.storage_type not null default 'fridge',
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ingredients_user_id_idx on public.ingredients (user_id);

-- ── 4. 레시피 (모든 사용자가 함께 보는 공용 데이터) ───────────────────
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null,
  cooking_time_minutes int not null check (cooking_time_minutes > 0),
  difficulty public.difficulty not null,
  servings int not null check (servings > 0),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  sort_order int not null,
  name text not null,
  quantity numeric(10, 2) not null,
  unit text not null
);
create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  step_order int not null,
  description text not null,
  unique (recipe_id, step_order)
);

-- ── 5. 즐겨찾기 / 장보기 / 요리 기록 ────────────────────────────────
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null,
  is_checked boolean not null default false,
  recipe_id uuid references public.recipes (id) on delete set null,
  created_at timestamptz not null default now()
);
create index shopping_items_user_id_idx on public.shopping_items (user_id);

create table public.cooking_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  cooked_at timestamptz not null default now(),
  used_ingredients jsonb not null default '[]'
);
create index cooking_logs_user_id_idx on public.cooking_logs (user_id, cooked_at desc);

-- ════════════════════════════════════════════════════════════════
--  RLS (Row Level Security, 행 단위 보안)
--  켜는 순간 "정책으로 허용한 행"만 읽고 쓸 수 있습니다.
--  공개 키(publishable/anon key)는 브라우저에 노출되므로, 실제 보안은 여기서 지켜집니다.
-- ════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.favorites enable row level security;
alter table public.shopping_items enable row level security;
alter table public.cooking_logs enable row level security;

-- 내 프로필만 조회/수정
create policy "profiles: 본인 조회" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: 본인 수정" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- 레시피는 로그인한 누구나 읽기만 가능
create policy "recipes: 모두 조회" on public.recipes for select to authenticated using (true);
create policy "recipe_ingredients: 모두 조회" on public.recipe_ingredients for select to authenticated using (true);
create policy "recipe_steps: 모두 조회" on public.recipe_steps for select to authenticated using (true);

-- 개인 데이터: user_id가 나인 행만 모든 작업 허용
-- (select auth.uid()) 처럼 괄호로 감싸면 행마다 함수를 다시 부르지 않아 빠릅니다 (Supabase 권장)
create policy "ingredients: 본인 데이터" on public.ingredients
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "favorites: 본인 데이터" on public.favorites
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "shopping_items: 본인 데이터" on public.shopping_items
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cooking_logs: 본인 데이터" on public.cooking_logs
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ════════════════════════════════════════════════════════════════
--  RPC 함수 — 여러 테이블을 바꾸는 작업을 "전부 성공 or 전부 취소"로 묶기 (트랜잭션)
--  security invoker: 호출한 사용자 권한으로 실행 → 위의 RLS가 그대로 적용됨
-- ════════════════════════════════════════════════════════════════

-- 장 본 재료를 냉장고에 넣기 + 장보기 목록에서 제거
-- items: [{ name, quantity, unit, category, storage, expiresAt }]
create function public.stock_from_shopping(items jsonb, shopping_item_ids uuid[])
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item jsonb;
  existing public.ingredients%rowtype;
  created_count int := 0;
  merged_count int := 0;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    select * into existing
    from public.ingredients
    where user_id = auth.uid() and name = item ->> 'name' and unit = item ->> 'unit'
    limit 1;

    if found then
      -- 같은 재료가 있으면 수량 합치기, 유통기한은 더 빠른 날짜 유지 (least는 null을 무시)
      update public.ingredients
      set quantity = existing.quantity + (item ->> 'quantity')::numeric,
          expires_at = least(existing.expires_at, (item ->> 'expiresAt')::date),
          updated_at = now()
      where id = existing.id;
      merged_count := merged_count + 1;
    else
      insert into public.ingredients (name, quantity, unit, category, storage, expires_at)
      values (
        item ->> 'name',
        (item ->> 'quantity')::numeric,
        item ->> 'unit',
        (item ->> 'category')::public.ingredient_category,
        (item ->> 'storage')::public.storage_type,
        (item ->> 'expiresAt')::date
      );
      created_count := created_count + 1;
    end if;
  end loop;

  delete from public.shopping_items where id = any (shopping_item_ids);

  return jsonb_build_object('createdCount', created_count, 'mergedCount', merged_count);
end;
$$;

-- 요리 완료: 재료 차감 + (다 쓴 재료 삭제) + 요리 기록 저장
-- usages: [{ ingredientId, amount, removeWhenEmpty }]
create function public.complete_cooking(p_recipe_id uuid, usages jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  usage jsonb;
  current_quantity numeric;
  remaining numeric;
  updated_count int := 0;
  removed_count int := 0;
begin
  for usage in select * from jsonb_array_elements(usages)
  loop
    continue when (usage ->> 'amount')::numeric <= 0;

    -- for update: 이 행을 잠가서 동시에 다른 요청이 같은 재료를 바꾸지 못하게 함
    select quantity into current_quantity
    from public.ingredients
    where id = (usage ->> 'ingredientId')::uuid
    for update;

    continue when not found;

    remaining := greatest(0, current_quantity - (usage ->> 'amount')::numeric);

    if remaining = 0 and (usage ->> 'removeWhenEmpty')::boolean then
      delete from public.ingredients where id = (usage ->> 'ingredientId')::uuid;
      removed_count := removed_count + 1;
    else
      update public.ingredients
      set quantity = remaining, updated_at = now()
      where id = (usage ->> 'ingredientId')::uuid;
      updated_count := updated_count + 1;
    end if;
  end loop;

  insert into public.cooking_logs (recipe_id, used_ingredients) values (p_recipe_id, usages);

  return jsonb_build_object('updatedCount', updated_count, 'removedCount', removed_count);
end;
$$;
