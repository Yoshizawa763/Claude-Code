import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')
  if (!userId || !date) return Response.json({ error: 'userId and date required' }, { status: 400 })
  const logs = await prisma.waterLog.findMany({ where: { userId, date } })
  const total = logs.reduce((s, l) => s + l.amountMl, 0)
  return Response.json({ logs, total })
}

export async function POST(request: Request) {
  const { userId, date, amountMl } = await request.json()
  const log = await prisma.waterLog.create({ data: { userId, date, amountMl } })
  return Response.json(log)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await prisma.waterLog.delete({ where: { id } })
  return Response.json({ success: true })
}
