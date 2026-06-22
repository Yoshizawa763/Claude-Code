'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

interface FoodLog {
  calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number
  sugarG: number; sodiumMg: number; cholesterolMg: number; saturatedFatG: number; transFatG: number
  vitaminAMcg: number; vitaminCMg: number; vitaminDMcg: number; calciumMg: number; ironMg: number; potassiumMg: number
}

export default function NutritionPage() {
  const user = useAppStore(s => s.user)
  const selectedDate = useAppStore(s => s.selectedDate)
  const router = useRouter()
  const [logs, setLogs] = useState<FoodLog[]>([])

  useEffect(() => { if (!user) router.replace('/onboarding') }, [user, router])

  const fetchLogs = useCallback(async () => {
    if (!user) return
    const res = await fetch(`/api/food-logs?userId=${user.id}&date=${selectedDate}`)
    setLogs(await res.json())
  }, [user, selectedDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  if (!user) return null

  const sum = (key: keyof FoodLog) => logs.reduce((s, l) => s + (l[key] as number), 0)

  const totals = {
    calories: sum('calories'), protein: sum('proteinG'), carbs: sum('carbsG'), fat: sum('fatG'),
    fiber: sum('fiberG'), sugar: sum('sugarG'), sodium: sum('sodiumMg'),
    cholesterol: sum('cholesterolMg'), saturatedFat: sum('saturatedFatG'), transFat: sum('transFatG'),
    vitaminA: sum('vitaminAMcg'), vitaminC: sum('vitaminCMg'), vitaminD: sum('vitaminDMcg'),
    calcium: sum('calciumMg'), iron: sum('ironMg'), potassium: sum('potassiumMg'),
  }

  const pct = (v: number, goal: number) => Math.min(Math.round((v / goal) * 100), 100)

  const macroTotal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9
  const proteinPct = macroTotal > 0 ? Math.round((totals.protein * 4 / macroTotal) * 100) : 0
  const carbPct = macroTotal > 0 ? Math.round((totals.carbs * 4 / macroTotal) * 100) : 0
  const fatPct = macroTotal > 0 ? Math.round((totals.fat * 9 / macroTotal) * 100) : 0

  const NutrientBar = ({ label, value, goal, unit, color = 'emerald' }: any) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">{typeof value === 'number' ? Math.round(value) : value} {unit} {goal ? `/ ${goal}${unit}` : ''}</span>
      </div>
      {goal && (
        <div className="h-2 bg-gray-100 rounded-full">
          <div className={`h-2 bg-${color}-500 rounded-full transition-all`} style={{ width: `${pct(value, goal)}%` }} />
        </div>
      )}
    </div>
  )

  return (
    <AppShell>
      <div className="bg-emerald-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold">栄養詳細</h1>
        <p className="text-emerald-100 text-sm">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">エネルギー</h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-emerald-600">{Math.round(totals.calories)}</div>
            <div className="text-gray-400">/ {user.dailyCalorieGoal} kcal</div>
            <div className="h-3 bg-gray-100 rounded-full mt-3">
              <div className="h-3 bg-emerald-500 rounded-full" style={{ width: `${pct(totals.calories, user.dailyCalorieGoal)}%` }} />
            </div>
          </div>

          {macroTotal > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">マクロ比率</p>
              <div className="h-4 rounded-full overflow-hidden flex">
                <div className="bg-blue-400 h-full" style={{ width: `${proteinPct}%` }} />
                <div className="bg-yellow-400 h-full" style={{ width: `${carbPct}%` }} />
                <div className="bg-red-400 h-full" style={{ width: `${fatPct}%` }} />
              </div>
              <div className="flex justify-around mt-2 text-xs text-gray-500">
                <span>🔵 P {proteinPct}%</span>
                <span>🟡 C {carbPct}%</span>
                <span>🔴 F {fatPct}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">マクロ栄養素</h3>
          <NutrientBar label="タンパク質" value={totals.protein} goal={user.proteinGoalG} unit="g" color="blue" />
          <NutrientBar label="炭水化物" value={totals.carbs} goal={user.carbGoalG} unit="g" color="yellow" />
          <NutrientBar label="脂質" value={totals.fat} goal={user.fatGoalG} unit="g" color="red" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">詳細栄養素</h3>
          <NutrientBar label="食物繊維" value={totals.fiber} goal={21} unit="g" color="green" />
          <NutrientBar label="糖質" value={totals.sugar} unit="g" />
          <NutrientBar label="飽和脂肪酸" value={totals.saturatedFat} goal={16} unit="g" color="orange" />
          <NutrientBar label="トランス脂肪酸" value={totals.transFat} unit="g" />
          <NutrientBar label="コレステロール" value={totals.cholesterol} goal={300} unit="mg" color="purple" />
          <NutrientBar label="ナトリウム" value={totals.sodium} goal={2300} unit="mg" color="red" />
          <NutrientBar label="カリウム" value={totals.potassium} goal={3500} unit="mg" color="emerald" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">ビタミン・ミネラル</h3>
          <NutrientBar label="ビタミンA" value={totals.vitaminA} goal={800} unit="mcg" color="orange" />
          <NutrientBar label="ビタミンC" value={totals.vitaminC} goal={100} unit="mg" color="yellow" />
          <NutrientBar label="ビタミンD" value={totals.vitaminD} goal={15} unit="mcg" color="yellow" />
          <NutrientBar label="カルシウム" value={totals.calcium} goal={700} unit="mg" color="blue" />
          <NutrientBar label="鉄" value={totals.iron} goal={10} unit="mg" color="red" />
        </div>
      </div>
    </AppShell>
  )
}
