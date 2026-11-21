-- ════════════════════════════════════════════════════════════════
--  기본 레시피 6개 (src/mocks/recipes.ts와 같은 내용)
--  init.sql 다음에 실행하세요.
--
--  "데이터를 바꾸는 CTE(with 절)" 패턴:
--   recipes에 넣고(returning id) → 그 id로 재료·조리 순서를 한 문장에서 이어서 넣습니다.
-- ════════════════════════════════════════════════════════════════

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('새우 토마토 파스타', '냉동 새우와 방울토마토로 금방 완성하는 상큼한 파스타',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=75&auto=format&fit=crop',
    20, 'easy', 2, array['양식', '20분 요리'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '새우', 200, 'g'), (2, '방울토마토', 10, '개'), (3, '마늘', 4, '쪽'),
    (4, '올리브유', 3, '큰술'), (5, '파스타면', 200, 'g'), (6, '바질', 5, '장')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '끓는 소금물에 파스타면을 8분간 삶아 주세요.'),
  (2, '팬에 올리브유를 두르고 편 썬 마늘을 약불에 볶아 향을 냅니다.'),
  (3, '새우를 넣고 색이 변할 때까지 볶은 뒤 반으로 자른 방울토마토를 넣어요.'),
  (4, '삶은 면과 면수 반 컵을 넣고 1분간 볶은 뒤 바질을 올려 마무리합니다.')
) as x(o, d);

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('닭가슴살 포케 볼', '남은 밥과 채소를 한 그릇에! 고단백 포케',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=75&auto=format&fit=crop',
    15, 'easy', 1, array['한그릇', '다이어트'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '닭가슴살', 1, '팩'), (2, '밥', 1, '공기'), (3, '오이', 1, '개'),
    (4, '방울토마토', 5, '개'), (5, '계란', 1, '개'), (6, '간장', 1, '큰술')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '닭가슴살을 한입 크기로 썰어 팬에 노릇하게 구워 주세요.'),
  (2, '계란은 반숙으로 삶고, 오이와 방울토마토는 먹기 좋게 썹니다.'),
  (3, '그릇에 밥을 담고 재료를 둘러 올린 뒤 간장 소스를 뿌려 완성해요.')
) as x(o, d);

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('두부 채소 곡물 볼', '두부를 바삭하게 구워 채소와 곁들인 든든한 한 끼',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=75&auto=format&fit=crop',
    25, 'medium', 2, array['비건', '한그릇'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '두부', 1, '모'), (2, '밥', 2, '공기'), (3, '방울토마토', 6, '개'),
    (4, '양파', 1, '개'), (5, '애호박', 1, '개'), (6, '간장', 2, '큰술')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '두부는 키친타월로 물기를 빼고 깍둑썰기 합니다.'),
  (2, '팬에 두부를 굴려 가며 겉면을 바삭하게 구워요.'),
  (3, '양파와 애호박을 볶다가 간장으로 간을 합니다.'),
  (4, '밥 위에 두부, 볶은 채소, 방울토마토를 올려 완성해요.')
) as x(o, d);

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('소고기 채소 샐러드', '간장 마늘 소스로 구운 소고기를 듬뿍 올린 따뜻한 샐러드',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=75&auto=format&fit=crop',
    20, 'medium', 2, array['샐러드', '고단백'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '소고기', 200, 'g'), (2, '양상추', 0.5, '통'), (3, '양파', 0.5, '개'),
    (4, '마늘', 2, '쪽'), (5, '간장', 2, '큰술')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '소고기에 간장과 다진 마늘을 넣고 10분간 재워 둡니다.'),
  (2, '양상추는 찬물에 담갔다가 물기를 빼고, 양파는 얇게 채 썰어요.'),
  (3, '센 불에 소고기를 빠르게 구워 채소 위에 올려 주세요.')
) as x(o, d);

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('바나나 프렌치토스트', '익어가는 바나나와 식빵으로 만드는 달콤한 브런치',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=75&auto=format&fit=crop',
    15, 'easy', 2, array['브런치', '디저트'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '식빵', 4, '장'), (2, '계란', 2, '개'), (3, '우유', 100, 'ml'),
    (4, '바나나', 1, '개'), (5, '블루베리', 1, '줌')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '계란과 우유를 잘 섞어 계란물을 만듭니다.'),
  (2, '식빵을 계란물에 충분히 적셔 주세요.'),
  (3, '버터를 녹인 팬에 앞뒤로 노릇하게 구워요.'),
  (4, '슬라이스한 바나나와 블루베리를 올려 완성합니다.')
) as x(o, d);

with r as (
  insert into public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, tags)
  values ('오이 토마토 그린 샐러드', '냉장고 속 채소를 아삭하게 즐기는 5분 샐러드',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=75&auto=format&fit=crop',
    5, 'easy', 1, array['샐러드', '5분 요리'])
  returning id
), i as (
  insert into public.recipe_ingredients (recipe_id, sort_order, name, quantity, unit)
  select r.id, x.o, x.n, x.q, x.u from r, (values
    (1, '양상추', 0.3, '통'), (2, '오이', 1, '개'), (3, '방울토마토', 5, '개'),
    (4, '올리브유', 1, '큰술'), (5, '발사믹식초', 1, '큰술')
  ) as x(o, n, q, u)
)
insert into public.recipe_steps (recipe_id, step_order, description)
select r.id, x.o, x.d from r, (values
  (1, '채소를 씻어 물기를 빼고 먹기 좋은 크기로 썰어요.'),
  (2, '올리브유와 발사믹식초를 1:1로 섞어 드레싱을 만듭니다.'),
  (3, '채소에 드레싱을 뿌려 가볍게 버무려 완성해요.')
) as x(o, d);
