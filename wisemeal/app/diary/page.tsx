'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

const MEAL_LABELS: Record<string, string> = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' }
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

interface FoodLog { id: string; mealType: string; foodName: string; amountG: number; calories: number; proteinG: number; carbsG: number; fatG: number; date: string }

export default function DiaryPage() {
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const selectedDate = useAppStore(s => s.selectedDate)
  const setSelectedDate = useAppStore(s => s.setSelectedDate)
  const router = useRouter()
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dailyCalories, setDailyCalories] = useState<Record<string, number>>({})

  useEffect(() => { if (!hasHydrated) return; if (!user) router.replace('/onboarding') }, [user, router, hasHydrated])

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/food-logs?userId=${user.id}&date=${selectedDate}`)
    setLogs(await res.json())
    setLoading(false)
  }, [user, selectedDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const fetchMonthCalories = useCallback(async () => {
    if (!user) return
    const year = currentMonth.getFullYear()
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const start = `${year}-${month}-01`
    const end = `${year}-${month}-31`
    const res = await fetch(`/api/nutrition-trends?userId=${user.id}&days=60`)
    const data = await res.json()
    const map: Record<string, number> = {}
    data.nutrition.forEach((d: any) => { map[d.date] = Math.round(d.calories) })
    setDailyCalories(map)
  }, [user, currentMonth])

  useEffect(() => { fetchMonthCalories() }, [fetchMonthCalories])

  const deleteLog = async (id: string) => {
    await fetch(`/api/food-logs?id=${id}`, { method: 'DELETE' })
    fetchLogs()
  }

  if (!user) return null

  const byMeal = ['breakfast', 'lunch', 'dinner', 'snack'].map(mt => ({
    type: mt,
    logs: logs.filter(l => l.mealType === mt),
    total: logs.filter(l => l.mealType === mt).reduce((s, l) => s + l.calories, 0)
  }))

  const totalCalories = logs.reduce((s, l) => s + l.calories, 0)

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthStr = currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })

  const getDateStr = (day: number) => {
    const y = currentMonth.getFullYear()
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return (
    <AppShell>
      <div className="bg-emerald-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold mb-4">食事日記</h1>
      </div>

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="text-gray-500 p-1">◀</button>
            <span className="font-semibold text-gray-800">{monthStr}</span>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="text-gray-500 p-1">▶</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['日', '月', '火', '水', '木', '金', '土'].map(d => (
              <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const ds = getDateStr(day)
              const isSelected = ds === selectedDate
              const isToday = ds === new Date().toISOString().split('T')[0]
              const cal = dailyCalories[ds]
              return (
                <button key={day} onClick={() => setSelectedDate(ds)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-colors ${isSelected ? 'bg-emerald-500 text-white' : isToday ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'}`}>
                  <span className="text-xs font-medium">{day}</span>
                  {cal && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の食事
          </h2>
          <span className="text-sm text-emerald-600 font-medium">{Math.round(totalCalories)} kcal</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : byMeal.every(m => m.logs.length === 0) ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">この日の記録はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {byMeal.filter(m => m.logs.length > 0).map(({ type, logs: mLogs, total }) => (
              <div key={type} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="font-medium text-gray-700">{MEAL_ICONS[type]} {MEAL_LABELS[type]}</span>
                  <span className="text-sm text-gray-500">{Math.round(total)} kcal</span>
                </div>
                {mLogs.map(log => (
                  <div key={log.id} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{log.foodName}</div>
                      <div className="text-xs text-gray-400">{log.amountG}g • P:{Math.round(log.proteinG)}g C:{Math.round(log.carbsG)}g F:{Math.round(log.fatG)}g</div>
                    </div>
                    <div className="text-right mr-3">
                      <div className="text-sm font-semibold text-gray-800">{Math.round(log.calories)}</div>
                      <div className="text-xs text-gray-400">kcal</div>
                    </div>
                    <button onClick={() => deleteLog(log.id)} className="text-red-400 hover:text-red-600 text-sm">🗑</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
