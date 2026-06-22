'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

export default function InsightsPage() {
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const router = useRouter()
  const [trends, setTrends] = useState<{ nutrition: any[]; weight: any[] }>({ nutrition: [], weight: [] })
  const [period, setPeriod] = useState(30)
  const [tab, setTab] = useState<'calories' | 'macros' | 'weight'>('calories')

  useEffect(() => { if (!hasHydrated) return; if (!user) router.replace('/onboarding') }, [user, router, hasHydrated])

  const fetchTrends = useCallback(async () => {
    if (!user) return
    const res = await fetch(`/api/nutrition-trends?userId=${user.id}&days=${period}`)
    setTrends(await res.json())
  }, [user, period])

  useEffect(() => { fetchTrends() }, [fetchTrends])

  if (!user) return null

  const avgCalories = trends.nutrition.length > 0
    ? Math.round(trends.nutrition.reduce((s, d) => s + d.calories, 0) / trends.nutrition.length) : 0
  const avgProtein = trends.nutrition.length > 0
    ? Math.round(trends.nutrition.reduce((s, d) => s + d.protein, 0) / trends.nutrition.length) : 0

  const formatDate = (d: any) => {
    if (typeof d !== 'string') return String(d ?? '')
    const parts = d.split('-')
    return `${parts[1]}/${parts[2]}`
  }

  return (
    <AppShell>
      <div className="bg-purple-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold mb-4">AI分析 & トレンド</h1>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${period === d ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
              {d}日
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{avgCalories}</div>
            <div className="text-xs text-gray-400">kcal/日 平均</div>
            <div className="text-xs text-gray-500 mt-1">目標 {user.dailyCalorieGoal} kcal</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{avgProtein}g</div>
            <div className="text-xs text-gray-400">タンパク質/日 平均</div>
            <div className="text-xs text-gray-500 mt-1">目標 {user.proteinGoalG}g</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            {([['calories', 'カロリー'], ['macros', 'マクロ'], ['weight', '体重']] as const).map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
                {l}
              </button>
            ))}
          </div>

          {trends.nutrition.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">食事を記録するとグラフが表示されます</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              {tab === 'calories' ? (
                <LineChart data={trends.nutrition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [`${Math.round(v)} kcal`, 'カロリー']} labelFormatter={formatDate} />
                  <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              ) : tab === 'macros' ? (
                <BarChart data={trends.nutrition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Bar dataKey="protein" name="タンパク質" fill="#60a5fa" stackId="a" />
                  <Bar dataKey="carbs" name="炭水化物" fill="#facc15" stackId="a" />
                  <Bar dataKey="fat" name="脂質" fill="#f87171" stackId="a" />
                </BarChart>
              ) : (
                <LineChart data={trends.weight}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [`${v} kg`, '体重']} labelFormatter={formatDate} />
                  <Line type="monotone" dataKey="weightKg" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {trends.weight.length >= 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">体重推移</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">{trends.weight[0]?.weightKg}kg</div>
                <div className="text-xs text-gray-400">開始時</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{trends.weight[trends.weight.length - 1]?.weightKg}kg</div>
                <div className="text-xs text-gray-400">現在</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  (trends.weight[trends.weight.length - 1]?.weightKg - trends.weight[0]?.weightKg) < 0
                    ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {((trends.weight[trends.weight.length - 1]?.weightKg - trends.weight[0]?.weightKg) > 0 ? '+' : '')}
                  {(trends.weight[trends.weight.length - 1]?.weightKg - trends.weight[0]?.weightKg).toFixed(1)}kg
                </div>
                <div className="text-xs text-gray-400">変化</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">目標体重 {user.goalWeightKg}kg まで </span>
              <span className="font-semibold text-emerald-600">
                {Math.abs((trends.weight[trends.weight.length - 1]?.weightKg || user.weightKg) - user.goalWeightKg).toFixed(1)}kg
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📈 目標達成率</h3>
          {[
            { label: 'カロリー目標', val: avgCalories, goal: user.dailyCalorieGoal, color: 'emerald' },
            { label: 'タンパク質', val: avgProtein, goal: user.proteinGoalG, color: 'blue' },
          ].map(({ label, val, goal, color }) => {
            const p = Math.min(Math.round((val / goal) * 100), 100)
            return (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{label}</span>
                  <span className="text-gray-500">{p}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 bg-${color}-500 rounded-full`} style={{ width: `${p}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
