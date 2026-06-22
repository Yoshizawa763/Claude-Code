import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')

  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const where: Record<string, string> = { userId }
  if (date) where.date = date

  const logs = await prisma.foodLog.findMany({
    where,
    orderBy: { createdAt: 'asc' }
  })

  return Response.json(logs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { ingredients, allergens, ...rest } = body

  const log = await prisma.foodLog.create({
    data: {
      ...rest,
      ingredients: JSON.stringify(ingredients || []),
      allergens: JSON.stringify(allergens || []),
    }
  })

  return Response.json(log)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await prisma.foodLog.delete({ where: { id } })
  return Response.json({ success: true })
}
