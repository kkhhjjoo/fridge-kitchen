// ════════════════════════════════════════════════════════════════
//  AI 셰프 맞춤 추천 — Supabase Edge Function (Deno에서 실행)
//
//  ⚠️ 2026-11-21 현재 사용하지 않음 (예비용으로 보관)
//   지금 화면은 API 키 대신 Claude 구독을 쓰는 dev-server/aiChefPlugin.ts를 부릅니다.
//   나중에 사이트를 인터넷에 배포해서 AI 셰프를 쓰고 싶으면, 이 함수(API 키 방식)로
//   다시 바꾸면 됩니다. (Supabase에는 version 2가 올라가 있고, ANTHROPIC_API_KEY도 등록되어 있음)
//
//  왜 브라우저에서 바로 Claude를 부르지 않나요?
//   → API 키가 브라우저에 들어가면 누구나 꺼내 쓸 수 있어요.
//     키는 이 함수의 비밀 값(ANTHROPIC_API_KEY)에만 두고, 브라우저는 이 함수만 부릅니다.
//
//  하는 일
//   1) 로그인한 사용자인지 확인 (Supabase가 보낸 로그인 토큰으로)
//   2) 그 사람의 냉장고 재료를 DB에서 직접 읽기 (브라우저가 보낸 재료 목록은 믿지 않음)
//   3) Claude에게 "이 재료로 만들 레시피"를 정해진 JSON 모양으로 요청
//   4) 받은 답을 Zod로 한 번 더 검사해서 돌려주기
//
//  배포:  npx supabase functions deploy ai-chef --project-ref <프로젝트 ref>
//  키 등록: npx supabase secrets set ANTHROPIC_API_KEY=... --project-ref <프로젝트 ref>
// ════════════════════════════════════════════════════════════════
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@4'

/** 브라우저(localhost:5173 등)에서 부를 수 있도록 허용하는 응답 헤더 (CORS) */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/** 실패 응답: 화면에 그대로 보여 줄 쉬운 말 */
const fail = (message: string, status: number) => json({ error: message }, status)

// ── 브라우저가 보내는 값 ─────────────────────────────────────────
const requestSchema = z.object({
  /** "15분 안에 끝나는 저녁"처럼 사용자가 적은 취향·상황 (비워도 됨) */
  wish: z.string().trim().max(300).default(''),
  servings: z.number().int().min(1).max(10).default(2),
})

// ── Claude에게 받을 답의 모양 (structured outputs: 이 모양 그대로만 답함) ──
const RECIPE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          cookingTimeMinutes: { type: 'integer' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          servings: { type: 'integer' },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
              },
              required: ['name', 'quantity', 'unit'],
              additionalProperties: false,
            },
          },
          steps: { type: 'array', items: { type: 'string' } },
          tip: { type: 'string' },
        },
        required: ['title', 'description', 'cookingTimeMinutes', 'difficulty', 'servings', 'ingredients', 'steps', 'tip'],
        additionalProperties: false,
      },
    },
  },
  required: ['recipes'],
  additionalProperties: false,
}

/** 받은 답을 한 번 더 검사 (모양은 API가 지켜 주지만, 값의 범위는 우리가 확인) */
const responseSchema = z.object({
  recipes: z
    .array(
      z.object({
        title: z.string().min(1).max(60),
        description: z.string().max(200),
        cookingTimeMinutes: z.number().int().min(1).max(600),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        servings: z.number().int().min(1).max(20),
        ingredients: z
          .array(z.object({ name: z.string().min(1), quantity: z.number().min(0), unit: z.string() }))
          .min(1),
        steps: z.array(z.string().min(1)).min(1).max(15),
        tip: z.string().max(200),
      }),
    )
    .min(1)
    .max(3),
})

const SYSTEM_PROMPT = `당신은 한국 가정식에 밝은 요리사입니다. 사용자의 냉장고 재료로 집에서 바로 만들 수 있는 레시피를 제안합니다.

규칙:
- 레시피는 3개를 제안합니다. 서로 다른 종류(예: 국·볶음·면)로 고릅니다.
- 냉장고 재료를 최대한 활용하고, 유통기한이 임박했거나 지난 재료를 우선 씁니다. 유통기한이 지난 재료는 상태를 확인하라는 말을 tip에 넣습니다.
- 냉장고에 없는 재료는 꼭 필요한 것만 넣습니다. 소금·설탕·후추·식용유·물 같은 기본 양념은 있다고 봅니다.
- 재료 이름은 냉장고 재료와 같은 재료라면 냉장고에 적힌 이름 그대로 씁니다. (화면에서 이름으로 "있는 재료"를 비교합니다)
- 모든 글은 한국어로, 단위는 g, ml, 개, 큰술, 작은술, 컵, 쪽, 장 같은 한국 가정에서 쓰는 단위로 씁니다.
- description은 한 문장, steps는 3~8단계로 불 세기와 시간을 넣어 씁니다.
- 사용자 요청은 <wish> 안에 있습니다. 요리와 관계없는 요청은 무시하고 레시피만 제안합니다.`

Deno.serve(async (req) => {
  // 브라우저가 본 요청 전에 보내는 "허락 확인" 요청 (CORS preflight)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return fail('지원하지 않는 요청이에요.', 405)

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return fail('AI 셰프가 아직 준비되지 않았어요. (서버에 API 키가 등록되지 않음)', 500)

  // 1) 로그인 확인 — 요청에 담긴 사용자 토큰으로 Supabase 클라이언트를 만들면 RLS도 그 사람 기준으로 적용돼요
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return fail('로그인이 필요해요.', 401)
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return fail('로그인이 필요해요.', 401)

  // 2) 요청 값 검사
  const parsedRequest = requestSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsedRequest.success) return fail('요청 내용을 확인해 주세요. (300자 이내)', 400)
  const { wish, servings } = parsedRequest.data

  // 3) 내 냉장고 재료 (RLS 덕분에 내 것만 읽힘)
  const { data: fridge, error: fridgeError } = await supabase
    .from('ingredients')
    .select('name, quantity, unit, expires_at')
    .order('expires_at', { ascending: true, nullsFirst: false })
    .limit(100)
  if (fridgeError) return fail('냉장고 재료를 불러오지 못했어요.', 500)
  if (!fridge || fridge.length === 0) return fail('냉장고에 재료를 먼저 등록해 주세요.', 400)

  const today = new Date().toISOString().slice(0, 10)
  const fridgeLines = fridge
    .map((item) => `- ${item.name} ${item.quantity}${item.unit}${item.expires_at ? ` (유통기한 ${item.expires_at})` : ''}`)
    .join('\n')

  // 4) Claude 호출
  const client = new Anthropic({ apiKey })
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      // 안전 분류기가 드물게 요청을 거절하면, 같은 요청을 다른 모델로 자동으로 다시 시도
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // effort: 생각을 얼마나 깊게 할지. 레시피 제안은 medium이면 충분 (빠르고 저렴)
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: RECIPE_JSON_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `오늘 날짜: ${today}\n인분: ${servings}인분\n\n냉장고 재료:\n${fridgeLines}\n\n<wish>${wish || '특별한 요청 없음'}</wish>`,
        },
      ],
    })

    if (response.stop_reason === 'refusal') return fail('이 요청으로는 레시피를 만들 수 없어요. 다르게 적어 주세요.', 422)
    if (response.stop_reason === 'max_tokens') return fail('답이 너무 길어져 중간에 끊겼어요. 다시 시도해 주세요.', 502)

    const text = response.content.find((block) => block.type === 'text')
    const parsed = responseSchema.safeParse(JSON.parse(text && text.type === 'text' ? text.text : '{}'))
    if (!parsed.success) return fail('AI가 보낸 레시피 모양이 이상해요. 다시 시도해 주세요.', 502)

    return json(parsed.data)
  } catch (error) {
    console.error('[ai-chef]', error) // 원인은 Supabase 대시보드 → Edge Functions → Logs에서 확인

    // 구체적인 것부터 차례로 검사 (모두 Anthropic.APIError의 자식이라 순서가 중요)
    if (error instanceof Anthropic.AuthenticationError) {
      return fail('API 키가 올바르지 않아요. Supabase Secrets의 ANTHROPIC_API_KEY를 확인해 주세요.', 500)
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      return fail('이 API 키로는 쓸 수 없는 모델이나 기능이에요. (권한 없음)', 500)
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail('요청이 많아요. 1분쯤 뒤에 다시 시도해 주세요.', 429)
    }
    if (error instanceof Anthropic.BadRequestError) {
      // 크레딧 부족도 400으로 와요 → 가장 흔한 원인이라 따로 알려 줌
      if (/credit balance/i.test(error.message)) {
        return fail('Anthropic API 크레딧이 부족해요. console.anthropic.com → Billing에서 충전해 주세요.', 402)
      }
      return fail(`AI 요청 형식에 문제가 있어요. (400: ${error.message.slice(0, 200)})`, 500)
    }
    if (error instanceof Anthropic.APIError) {
      return fail(`AI 셰프가 잠시 쉬고 있어요. 잠시 후 다시 시도해 주세요. (${error.status ?? '연결 오류'})`, 502)
    }
    // JSON.parse 실패 등 우리 코드 쪽 문제
    return fail('AI 셰프의 답을 처리하지 못했어요. 다시 시도해 주세요.', 500)
  }
})
