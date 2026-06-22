import { searchFoods } from '@/lib/food-db'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const userId = searchParams.get('userId')

  const dbResults = searchFoods(query)

  let customFoods: any[] = []
  if (userId && query) {
    customFoods = await prisma.customFood.findMany({
      where: { userId, name: { contains: query } },
      take: 10
    })
  }

  return Response.json({ dbResults, customFoods })
}
