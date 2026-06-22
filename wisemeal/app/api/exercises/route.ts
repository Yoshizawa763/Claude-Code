import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

    const where: Record<string, string> = { userId }
    if (date) where.date = date

    const logs = await prisma.exerciseLog.findMany({ where, orderBy: { createdAt: 'asc' } })
    return Response.json(logs)
  } catch (e) {
    console.error('[GET /api/exercises]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, date, name, durationMin, metValue, caloriesBurned } = body
    const log = await prisma.exerciseLog.create({
      data: { userId, date, name, durationMin, metValue, caloriesBurned }
    })
    return Response.json(log)
  } catch (e) {
    console.error('[POST /api/exercises]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'id required' }, { status: 400 })
    await prisma.exerciseLog.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/exercises]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
