'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

interface MealEntry { name: string; calories: number; protein: number; carbs: number; fat: number; description: string }
interface PlanDay { day: number; date: string; breakfast: MealEntry; lunch: MealEntry; dinner: MealEntry; snack: MealEntry; totalCalories: number }

export default function MealPlanPage() {
  const user = useAppStore(s => s.user)
  const router = useRouter()
  const [plan, setPlan] = useState<{ days: PlanDay[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeDay, setActiveDay] = useState(0)

  useEffect(() => { if (!user) router.replace('/onboarding') }, [user, router])

  const fetchPlan = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/meal-plan?userId=${user.id}`)
    const data = await res.json()
    if (data) setPlan(data.planData)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  if (!user) return null

  const generatePlan = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          startDate: new Date().toISOString().split('T')[0],
          goal: user.goal,
          dailyCalories: user.dailyCalorieGoal,
          protein: user.proteinGoalG,
          carbs: user.carbGoalG,
          fat: user.fatGoalG,
          restrictions: user.dietaryRestrictions,
          allergies: user.allergies
        })
      })
      const data = await res.json()
      setPlan(data.planData)
    } catch { alert('生成に失敗しました') }
    finally { setGenerating(false) }
  }

  const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
  const MEAL_LABELS: Record<string, string> = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' }

  return (
    <AppShell>
      <div className="bg-teal-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold">14日間ミールプラン</h1>
        <p className="text-teal-100 text-sm mt-1">AIがあなたの目標に合わせたプランを作成</p>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : !plan ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ミールプランを作成しましょう</h3>
            <p className="text-gray-500 text-sm mb-2">目標: {user.goal === 'lose_weight' ? '体重減量' : user.goal === 'gain_muscle' ? '筋肉増量' : '健康維持'}</p>
            <p className="text-gray-500 text-sm mb-6">1日 {user.dailyCalorieGoal} kcal / P{user.proteinGoalG}g C{user.carbGoalG}g F{user.fatGoalG}g</p>
            <button onClick={generatePlan} disabled={generating}
              className="bg-teal-500 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50">
              {generating ? 'AIがプランを作成中...(1分ほどかかります)' : '🤖 14日間プランを生成'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
              {plan.days.map((d, i) => (
                <button key={i} onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-colors ${activeDay === i ? 'bg-teal-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  <span>Day</span>
                  <span className="font-bold">{d.day}</span>
                </button>
              ))}
            </div>

            {plan.days[activeDay] && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Day {plan.days[activeDay].day}</h3>
                  <span className="text-sm text-teal-600 font-medium">合計 {plan.days[activeDay].totalCalories} kcal</span>
                </div>

                <div className="space-y-3">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealKey => {
                    const meal = plan.days[activeDay][mealKey]
                    return (
                      <div key={mealKey} className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{MEAL_ICONS[mealKey]}</span>
                          <span className="font-medium text-gray-700">{MEAL_LABELS[mealKey]}</span>
                          <span className="ml-auto text-sm text-teal-600 font-medium">{meal.calories} kcal</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{meal.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{meal.description}</p>
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button onClick={generatePlan} disabled={generating}
                  className="w-full mt-4 border border-teal-400 text-teal-600 py-3 rounded-xl font-medium">
                  {generating ? 'プランを再生成中...' : '🔄 プランを再生成'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
