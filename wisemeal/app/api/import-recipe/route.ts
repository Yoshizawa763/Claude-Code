import { anthropic } from '@/lib/anthropic'

export async function POST(request: Request) {
  const { url } = await request.json()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `URLが「${url}」のレシピを分析してください。このURLはInstagram、YouTube、TikTok等のSNSのレシピかもしれません。URLから推測できる料理についてレシピを作成し、以下のJSON形式のみで返してください:
{
  "name": "料理名",
  "description": "料理の説明",
  "servings": 1,
  "prepTimeMin": 数値,
  "cookTimeMin": 数値,
  "calories": 数値,
  "protein": 数値,
  "carbs": 数値,
  "fat": 数値,
  "fiber": 数値,
  "ingredients": [{"name": "食材名", "amount": "分量"}],
  "instructions": ["手順1", "手順2"],
  "tags": ["タグ"],
  "sourceUrl": "${url}"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return Response.json(JSON.parse(jsonMatch[0]))

  return Response.json({ error: 'Import failed' }, { status: 500 })
}
