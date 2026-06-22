import { anthropic } from '@/lib/anthropic'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, date, foodLogs, waterMl, steps, goals } = body

  const totalCalories = foodLogs.reduce((s: number, l: any) => s + l.calories, 0)
  const totalProtein = foodLogs.reduce((s: number, l: any) => s + l.proteinG, 0)
  const totalFiber = foodLogs.reduce((s: number, l: any) => s + l.fiberG, 0)
  const mealCount = new Set(foodLogs.map((l: any) => l.mealType)).size

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `今日の食事・健康データを分析し、スコアとアドバイスをJSON形式のみで返してください:\n\n今日の摂取: カロリー${Math.round(totalCalories)}kcal(目標${goals.calories}kcal)、タンパク質${Math.round(totalProtein)}g(目標${goals.protein}g)、食物繊維${Math.round(totalFiber)}g\n食事回数: ${mealCount}回\n水分: ${waterMl}mL(目標${goals.water}mL)\n歩数: ${steps}歩\n\n{"score":整数,"breakdown":{"calories":0-25,"protein":0-25,"variety":0-20,"hydration":0-15,"fiber":0-15},"grade":"A/B/C/D/F","summary":"総評","advice":["アドバイス1","アドバイス2","アドバイス3"],"positives":["良かった点1","良かった点2"],"improvements":["改善点1","改善点2"]}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return Response.json({ error: 'Score generation failed' }, { status: 500 })

  const scoreData = JSON.parse(jsonMatch[0])

  await prisma.healthScore.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, score: scoreData.score, breakdown: JSON.stringify(scoreData.breakdown), advice: JSON.stringify(scoreData) },
    update: { score: scoreData.score, breakdown: JSON.stringify(scoreData.breakdown), advice: JSON.stringify(scoreData) }
  })

  return Response.json(scoreData)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')
  if (!userId || !date) return Response.json({ error: 'userId and date required' }, { status: 400 })

  const score = await prisma.healthScore.findUnique({ where: { userId_date: { userId, date } } })
  if (!score) return Response.json(null)
  return Response.json({ ...score, advice: JSON.parse(score.advice) })
}
