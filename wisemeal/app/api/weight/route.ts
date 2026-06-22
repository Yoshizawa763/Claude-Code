import { prisma } from '@/lib/prisma'
import { calculateBMI } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })
  const logs = await prisma.weightLog.findMany({ where: { userId }, orderBy: { date: 'asc' }, take: 90 })
  return Response.json(logs)
}

export async function POST(request: Request) {
  const { userId, date, weightKg, heightCm } = await request.json()
  const bmi = heightCm ? calculateBMI(weightKg, heightCm) : undefined
  const existing = await prisma.weightLog.findFirst({ where: { userId, date } })
  let log
  if (existing) {
    log = await prisma.weightLog.update({ where: { id: existing.id }, data: { weightKg, bmi } })
  } else {
    log = await prisma.weightLog.create({ data: { userId, date, weightKg, bmi } })
  }
  await prisma.user.update({ where: { id: userId }, data: { weightKg } })
  return Response.json(log)
}
