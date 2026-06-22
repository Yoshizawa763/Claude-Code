import { prisma } from '@/lib/prisma'
import { calculateDailyCalories } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, age, gender, heightCm, weightKg, goalWeightKg, activityLevel, goal, allergies, dietaryRestrictions } = body

    const goals = calculateDailyCalories(weightKg, heightCm, age, gender, activityLevel, goal)

    const user = await prisma.user.create({
      data: {
        name, age, gender, heightCm, weightKg, goalWeightKg, activityLevel, goal,
        allergies: JSON.stringify(allergies || []),
        dietaryRestrictions: JSON.stringify(dietaryRestrictions || []),
        dailyCalorieGoal: goals.calories,
        proteinGoalG: goals.protein,
        carbGoalG: goals.carbs,
        fatGoalG: goals.fat,
      }
    })

    return Response.json(user)
  } catch (e) {
    console.error('[POST /api/users]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'id required' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id } })
    return Response.json(user)
  } catch (e) {
    console.error('[GET /api/users]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (data.weightKg && data.heightCm && data.age && data.gender && data.activityLevel && data.goal) {
      const goals = calculateDailyCalories(data.weightKg, data.heightCm, data.age, data.gender, data.activityLevel, data.goal)
      data.dailyCalorieGoal = goals.calories
      data.proteinGoalG = goals.protein
      data.carbGoalG = goals.carbs
      data.fatGoalG = goals.fat
    }

    if (data.allergies) data.allergies = JSON.stringify(data.allergies)
    if (data.dietaryRestrictions) data.dietaryRestrictions = JSON.stringify(data.dietaryRestrictions)

    const user = await prisma.user.update({ where: { id }, data })
    return Response.json(user)
  } catch (e) {
    console.error('[PUT /api/users]', e)
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
