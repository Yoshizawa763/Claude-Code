import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const days = parseInt(searchParams.get('days') || '30')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const logs = await prisma.foodLog.findMany({
    where: { userId, date: { gte: startDateStr } },
    orderBy: { date: 'asc' }
  })

  const byDate: Record<string, any> = {}
  for (const log of logs) {
    if (!byDate[log.date]) {
      byDate[log.date] = { date: log.date, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    }
    byDate[log.date].calories += log.calories
    byDate[log.date].protein += log.proteinG
    byDate[log.date].carbs += log.carbsG
    byDate[log.date].fat += log.fatG
    byDate[log.date].fiber += log.fiberG
  }

  const weightLogs = await prisma.weightLog.findMany({
    where: { userId, date: { gte: startDateStr } },
    orderBy: { date: 'asc' }
  })

  return Response.json({
    nutrition: Object.values(byDate),
    weight: weightLogs,
  })
}
