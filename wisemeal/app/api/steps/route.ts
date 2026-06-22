import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })
  const where: any = { userId }
  if (date) where.date = date
  const logs = await prisma.stepLog.findMany({ where, orderBy: { date: 'asc' } })
  return Response.json(logs)
}

export async function POST(request: Request) {
  const { userId, date, steps } = await request.json()
  const existing = await prisma.stepLog.findFirst({ where: { userId, date } })
  if (existing) {
    const log = await prisma.stepLog.update({ where: { id: existing.id }, data: { steps } })
    return Response.json(log)
  }
  const log = await prisma.stepLog.create({ data: { userId, date, steps } })
  return Response.json(log)
}
