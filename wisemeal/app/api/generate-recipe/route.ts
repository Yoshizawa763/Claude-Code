import { anthropic } from '@/lib/anthropic'

export async function POST(request: Request) {
  const body = await request.json()
  const { ingredients, goal, calories, restrictions, servings = 1 } = body

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `以下の食材を使ったヘルシーなレシピを作成してください。
食材: ${ingredients.join('、')}
目標カロリー: ${calories || '適量'}kcal
目標: ${goal || '健康的な食事'}
食事制限: ${restrictions?.join('、') || 'なし'}
人数: ${servings}人前

以下のJSON形式のみで回答してください:
{
  "name": "料理名",
  "description": "料理の説明（1-2文）",
  "servings": ${servings},
  "prepTimeMin": 数値,
  "cookTimeMin": 数値,
  "calories": 1人前のカロリー数値,
  "protein": 1人前のタンパク質g,
  "carbs": 1人前の炭水化物g,
  "fat": 1人前の脂質g,
  "fiber": 1人前の食物繊維g,
  "ingredients": [
    {"name": "食材名", "amount": "分量", "note": "備考（任意）"}
  ],
  "instructions": [
    "手順1の説明",
    "手順2の説明"
  ],
  "tags": ["タグ1", "タグ2"],
  "tips": "調理のコツ（任意）"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return Response.json(JSON.parse(jsonMatch[0]))
  }

  return Response.json({ error: 'Recipe generation failed' }, { status: 500 })
}
