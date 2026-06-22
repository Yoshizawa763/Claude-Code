import { anthropic } from '@/lib/anthropic'

export async function POST(request: Request) {
  const formData = await request.formData()
  const imageFile = formData.get('image') as File | null
  const textQuery = formData.get('text') as string | null
  const userAllergies = formData.get('allergies') as string || '[]'

  const allergies: string[] = JSON.parse(userAllergies)

  if (imageFile) {
    const bytes = await imageFile.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          },
          {
            type: 'text',
            text: `この食事の画像を分析してください。以下のJSON形式で回答してください:
{
  "foodName": "料理名（日本語）",
  "totalCalories": 数値,
  "totalWeight": 数値（g）,
  "protein": 数値（g）,
  "carbs": 数値（g）,
  "fat": 数値（g）,
  "fiber": 数値（g）,
  "sugar": 数値（g）,
  "sodium": 数値（mg）,
  "cholesterol": 数値（mg）,
  "saturatedFat": 数値（g）,
  "transFat": 数値（g）,
  "vitaminA": 数値（mcg）,
  "vitaminC": 数値（mg）,
  "vitaminD": 数値（mcg）,
  "calcium": 数値（mg）,
  "iron": 数値（mg）,
  "potassium": 数値（mg）,
  "allergens": ["含まれるアレルゲンのリスト"],
  "ingredients": [{"name": "食材名", "amountG": 数値, "calories": 数値}],
  "userAllergenWarnings": ["${allergies.join('", "')}のうち含まれるもの"]
}
JSONのみを返してください。`
          }
        ]
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return Response.json(JSON.parse(jsonMatch[0]))
    }
  } else if (textQuery) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `「${textQuery}」の栄養成分を推定してください。以下のJSON形式のみで回答:
{
  "foodName": "${textQuery}",
  "totalCalories": 数値,
  "totalWeight": 数値（g）,
  "protein": 数値（g）,
  "carbs": 数値（g）,
  "fat": 数値（g）,
  "fiber": 数値（g）,
  "sugar": 数値（g）,
  "sodium": 数値（mg）,
  "cholesterol": 数値（mg）,
  "saturatedFat": 数値（g）,
  "transFat": 数値（g）,
  "vitaminA": 数値（mcg）,
  "vitaminC": 数値（mg）,
  "vitaminD": 数値（mcg）,
  "calcium": 数値（mg）,
  "iron": 数値（mg）,
  "potassium": 数値（mg）,
  "allergens": ["推定アレルゲン"],
  "ingredients": [{"name": "食材名", "amountG": 数値, "calories": 数値}],
  "userAllergenWarnings": []
}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return Response.json(JSON.parse(jsonMatch[0]))
    }
  }

  return Response.json({ error: 'Analysis failed' }, { status: 500 })
}
