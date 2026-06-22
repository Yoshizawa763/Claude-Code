'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

interface DailyTotals { calories: number; protein: number; carbs: number; fat: number; fiber: number }
interface FoodLog { id: string; mealType: string; foodName: string; calories: number; proteinG: number; carbsG: number; fatG: number; amountG: number }
interface HealthScore { score: number; grade: string; summary: string; advice: string[] }

const MEAL_LABELS: Record<string, string> = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' }
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

export default function DashboardPage() {
  const router = useRouter()
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const selectedDate = useAppStore(s => s.selectedDate)
  const setSelectedDate = useAppStore(s => s.setSelectedDate)

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [waterTotal, setWaterTotal] = useState(0)
  const [steps, setSteps] = useState(0)
  const [exerciseCalories, setExerciseCalories] = useState(0)
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [scoreLoading, setScoreLoading] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) router.replace('/onboarding')
  }, [user, router, hasHydrated])

  const fetchData = useCallback(async () => {
    if (!user) return
    const [logsRes, waterRes, stepsRes, scoreRes, exerciseRes] = await Promise.all([
      fetch(`/api/food-logs?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/water?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/steps?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/health-score?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/exercises?userId=${user.id}&date=${selectedDate}`),
    ])
    setFoodLogs(await logsRes.json())
    const waterData = await waterRes.json()
    setWaterTotal(waterData.total || 0)
    const stepsData = await stepsRes.json()
    setSteps(stepsData[0]?.steps || 0)
    const scoreData = await scoreRes.json()
    if (scoreData) setHealthScore(scoreData.advice || scoreData)
    const exerciseData = await exerciseRes.json()
    const totalExerciseKcal = Array.isArray(exerciseData)
      ? exerciseData.reduce((s: number, e: { caloriesBurned: number }) => s + e.caloriesBurned, 0)
      : 0
    setExerciseCalories(Math.round(totalExerciseKcal))
  }, [user, selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  if (!user) return null

  const totals: DailyTotals = foodLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + log.proteinG,
    carbs: acc.carbs + log.carbsG,
    fat: acc.fat + log.fatG,
    fiber: acc.fiber + 0,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

  const effectiveCalorieGoal = user.dailyCalorieGoal + exerciseCalories
  const caloriePercent = Math.min((totals.calories / effectiveCalorieGoal) * 100, 100)
  const remaining = effectiveCalorieGoal - totals.calories
  const waterPercent = Math.min((waterTotal / user.waterGoalMl) * 100, 100)

  const generateScore = async () => {
    setScoreLoading(true)
    try {
      const res = await fetch('/api/health-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, date: selectedDate, foodLogs, waterMl: waterTotal, steps,
          goals: { calories: user.dailyCalorieGoal, protein: user.proteinGoalG, water: user.waterGoalMl }
        })
      })
      const data = await res.json()
      setHealthScore(data)
    } finally {
      setScoreLoading(false)
    }
  }

  const byMeal = ['breakfast', 'lunch', 'dinner', 'snack'].map(mt => ({
    type: mt,
    logs: foodLogs.filter(l => l.mealType === mt),
    total: foodLogs.filter(l => l.mealType === mt).reduce((s, l) => s + l.calories, 0)
  }))

  const todayJa = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <AppShell>
      <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 pt-12 pb-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-sm">こんにちは、{user.name}さん</p>
            <h1 className="text-white text-xl font-bold">{todayJa}</h1>
          </div>
          <Link href="/profile" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-lg">👤</Link>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[-1, 0, 1].map(offset => {
            const d = new Date(); d.setDate(d.getDate() + offset)
            const ds = d.toISOString().split('T')[0]
            const label = offset === -1 ? '昨日' : offset === 0 ? '今日' : '明日'
            return (
              <button key={offset} onClick={() => setSelectedDate(ds)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedDate === ds ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'}`}>
                {label}
              </button>
            )
          })}
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">カロリー</span>
            <div className="text-right">
              <span className="text-white text-sm">{Math.round(totals.calories)} / {effectiveCalorieGoal} kcal</span>
              {exerciseCalories > 0 && (
                <div className="text-emerald-200 text-xs">🏋️ +{exerciseCalories} kcal 運動ボーナス</div>
              )}
            </div>
          </div>
          <div className="h-3 bg-white/30 rounded-full mb-2">
            <div className="h-3 bg-white rounded-full transition-all" style={{ width: `${caloriePercent}%` }} />
          </div>
          <p className="text-emerald-100 text-sm text-center">
            {remaining > 0 ? `残り ${Math.round(remaining)} kcal` : `${Math.round(-remaining)} kcal オーバー`}
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'タンパク質', val: Math.round(totals.protein), goal: user.proteinGoalG, unit: 'g', color: 'blue' },
            { label: '炭水化物', val: Math.round(totals.carbs), goal: user.carbGoalG, unit: 'g', color: 'yellow' },
            { label: '脂質', val: Math.round(totals.fat), goal: user.fatGoalG, unit: 'g', color: 'red' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className={`text-lg font-bold text-${m.color}-500`}>{m.val}{m.unit}</div>
              <div className="text-xs text-gray-400">/{m.goal}{m.unit}</div>
              <div className="text-xs text-gray-600 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/health" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💧</span>
              <span className="text-sm font-medium text-gray-700">水分摂取</span>
            </div>
            <div className="text-lg font-bold text-blue-500">{waterTotal}mL</div>
            <div className="h-1.5 bg-gray-100 rounded-full mt-2">
              <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${waterPercent}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">目標 {user.waterGoalMl}mL</div>
          </Link>
          <Link href="/health" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👟</span>
              <span className="text-sm font-medium text-gray-700">歩数</span>
            </div>
            <div className="text-lg font-bold text-emerald-500">{steps.toLocaleString()}</div>
            <div className="h-1.5 bg-gray-100 rounded-full mt-2">
              <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${Math.min((steps / 8000) * 100, 100)}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">目標 8,000歩</div>
          </Link>
        </div>

        {healthScore ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">AI健康スコア</h3>
              <button onClick={generateScore} disabled={scoreLoading} className="text-xs text-emerald-600 border border-emerald-300 px-2 py-1 rounded-lg">
                {scoreLoading ? '分析中...' : '再分析'}
              </button>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${healthScore.score} 100`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-800">{healthScore.score}</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{healthScore.grade}</div>
                <p className="text-sm text-gray-600">{healthScore.summary}</p>
              </div>
            </div>
            {healthScore.advice?.slice(0, 2).map((a, i) => (
              <div key={i} className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-1">💡 {a}</div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 text-center">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm text-gray-600 mb-3">食事を記録してAI健康スコアを取得しましょう</p>
            <button onClick={generateScore} disabled={scoreLoading || foodLogs.length === 0}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {scoreLoading ? '分析中...' : 'AI分析を実行'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">今日の食事</h3>
            <Link href="/log" className="text-sm text-emerald-600 font-medium">+ 追加</Link>
          </div>
          {byMeal.filter(m => m.logs.length > 0).length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm">写真を撮って食事を記録しましょう</p>
              <Link href="/log" className="mt-3 inline-block bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm">記録する</Link>
            </div>
          ) : byMeal.map(({ type, logs, total }) => logs.length > 0 && (
            <div key={type} className="px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{MEAL_ICONS[type]} {MEAL_LABELS[type]}</span>
                <span className="text-sm text-gray-500">{Math.round(total)} kcal</span>
              </div>
              {logs.map(log => (
                <div key={log.id} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">{log.foodName} ({log.amountG}g)</span>
                  <span className="text-xs text-gray-400">{Math.round(log.calories)} kcal</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/recipes" className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">👨‍🍳</div>
            <div className="text-sm font-medium text-gray-700">AIレシピ</div>
          </Link>
          <Link href="/meal-plan" className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm font-medium text-gray-700">14日間プラン</div>
          </Link>
          <Link href="/nutrition" className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">🔬</div>
            <div className="text-sm font-medium text-gray-700">栄養詳細</div>
          </Link>
          <Link href="/insights" className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-sm font-medium text-gray-700">トレンド</div>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
