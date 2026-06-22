import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const foods = await prisma.customFood.findMany({ where: { userId } })
  return Response.json(foods)
}

export async function POST(request: Request) {
  const body = await request.json()
  const food = await prisma.customFood.create({ data: body })
  return Response.json(food)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await prisma.customFood.delete({ where: { id } })
  return Response.json({ success: true })
}
