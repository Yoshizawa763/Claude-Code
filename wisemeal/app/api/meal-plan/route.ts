import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, startDate, goal, dailyCalories, protein, carbs, fat, restrictions, allergies } = body

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `14日間のパーソナライズされた食事プランを作成してください。

目標: ${goal}
1日の目標カロリー: ${dailyCalories}kcal
タンパク質: ${protein}g、炭水化物: ${carbs}g、脂質: ${fat}g
食事制限: ${restrictions?.join('、') || 'なし'}
アレルゲン除外: ${allergies?.join('、') || 'なし'}

以下のJSON形式のみで回答してください（日本語）:
{
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "breakfast": {
        "name": "料理名",
        "calories": 数値,
        "protein": 数値,
        "carbs": 数値,
        "fat": 数値,
        "description": "簡単な説明"
      },
      "lunch": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "description": "" },
      "dinner": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "description": "" },
      "snack": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "description": "" },
      "totalCalories": 数値
    }
  ]
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return Response.json({ error: 'Meal plan generation failed' }, { status: 500 })
  }

  const planData = JSON.parse(jsonMatch[0])

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 13)

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      planData: JSON.stringify(planData),
    }
  })

  return Response.json({ ...mealPlan, planData })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const plans = await prisma.mealPlan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 1
  })

  if (plans.length === 0) return Response.json(null)

  const plan = plans[0]
  return Response.json({ ...plan, planData: JSON.parse(plan.planData) })
}
