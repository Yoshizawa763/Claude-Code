import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const recipes = await prisma.recipe.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return Response.json(recipes.map(r => ({
    ...r,
    ingredients: JSON.parse(r.ingredients),
    instructions: JSON.parse(r.instructions),
    tags: JSON.parse(r.tags),
  })))
}

export async function POST(request: Request) {
  const body = await request.json()
  const { ingredients, instructions, tags, ...rest } = body
  const recipe = await prisma.recipe.create({
    data: { ...rest, ingredients: JSON.stringify(ingredients || []), instructions: JSON.stringify(instructions || []), tags: JSON.stringify(tags || []) }
  })
  return Response.json(recipe)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await prisma.recipe.delete({ where: { id } })
  return Response.json({ success: true })
}
