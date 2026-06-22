'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

export default function HealthPage() {
  const user = useAppStore(s => s.user)
  const selectedDate = useAppStore(s => s.selectedDate)
  const router = useRouter()

  const [waterTotal, setWaterTotal] = useState(0)
  const [steps, setSteps] = useState(0)
  const [weight, setWeight] = useState<number | null>(null)
  const [waterInput, setWaterInput] = useState(250)
  const [stepsInput, setStepsInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState('')

  useEffect(() => { if (!user) router.replace('/onboarding') }, [user, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    const [waterRes, stepsRes, weightRes] = await Promise.all([
      fetch(`/api/water?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/steps?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/weight?userId=${user.id}`),
    ])
    const waterData = await waterRes.json()
    setWaterTotal(waterData.total || 0)
    const stepsData = await stepsRes.json()
    setSteps(stepsData[0]?.steps || 0)
    const weightData = await weightRes.json()
    const todayWeight = weightData.find((w: any) => w.date === selectedDate)
    setWeight(todayWeight?.weightKg || null)
  }, [user, selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  if (!user) return null

  const addWater = async () => {
    setSaving('water')
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, date: selectedDate, amountMl: waterInput })
    })
    fetchData()
    setSaving('')
  }

  const saveSteps = async () => {
    if (!stepsInput) return
    setSaving('steps')
    await fetch('/api/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, date: selectedDate, steps: Number(stepsInput) })
    })
    setSteps(Number(stepsInput))
    setSaving('')
  }

  const saveWeight = async () => {
    if (!weightInput) return
    setSaving('weight')
    await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, date: selectedDate, weightKg: Number(weightInput), heightCm: user.heightCm })
    })
    setWeight(Number(weightInput))
    setSaving('')
  }

  const waterPct = Math.min((waterTotal / user.waterGoalMl) * 100, 100)
  const stepPct = Math.min((steps / 8000) * 100, 100)

  const WATER_PRESETS = [150, 200, 250, 350, 500]

  return (
    <AppShell>
      <div className="bg-blue-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold">健康ハブ</h1>
        <p className="text-blue-100 text-sm">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💧</span>
            <h3 className="font-semibold text-gray-800">水分補給</h3>
          </div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-500">{waterTotal}</div>
            <div className="text-gray-400">/ {user.waterGoalMl} mL</div>
          </div>
          <div className="flex justify-center gap-2 mb-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`w-6 h-10 rounded-full border-2 transition-all ${i < Math.floor((waterTotal / user.waterGoalMl) * 8) ? 'bg-blue-400 border-blue-400' : 'border-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {WATER_PRESETS.map(ml => (
              <button key={ml} onClick={() => setWaterInput(ml)}
                className={`flex-1 min-w-[60px] py-2 rounded-xl text-sm border transition-colors ${waterInput === ml ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                {ml}mL
              </button>
            ))}
          </div>
          <button onClick={addWater} disabled={saving === 'water'}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
            {saving === 'water' ? '記録中...' : `+${waterInput}mL 追加`}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👟</span>
            <h3 className="font-semibold text-gray-800">歩数</h3>
          </div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-emerald-500">{steps.toLocaleString()}</div>
            <div className="text-gray-400">/ 8,000 歩</div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full mb-4">
            <div className="h-4 bg-emerald-400 rounded-full transition-all" style={{ width: `${stepPct}%` }} />
          </div>
          <p className="text-sm text-gray-500 mb-3 text-center">
            {steps >= 8000 ? '🎉 目標達成！' : `あと ${(8000 - steps).toLocaleString()} 歩`}
          </p>
          <div className="flex gap-2">
            <input type="number" value={stepsInput} onChange={e => setStepsInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="歩数を入力" />
            <button onClick={saveSteps} disabled={saving === 'steps' || !stepsInput}
              className="bg-emerald-500 text-white px-5 rounded-xl font-medium disabled:opacity-50">
              {saving === 'steps' ? '...' : '記録'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚖️</span>
            <h3 className="font-semibold text-gray-800">体重</h3>
          </div>
          {weight && (
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-800">{weight} <span className="text-lg text-gray-400">kg</span></div>
              <div className="text-sm text-gray-500 mt-1">
                目標まで {Math.abs(weight - user.goalWeightKg).toFixed(1)}kg
                {weight > user.goalWeightKg ? ' 減量' : weight < user.goalWeightKg ? ' 増量' : '（達成！🎉）'}
              </div>
              <div className="text-sm text-gray-500">BMI: {(weight / ((user.heightCm / 100) ** 2)).toFixed(1)}</div>
            </div>
          )}
          <div className="flex gap-2">
            <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={weight ? `現在 ${weight}kg` : '体重を入力 (kg)'} />
            <button onClick={saveWeight} disabled={saving === 'weight' || !weightInput}
              className="bg-gray-800 text-white px-5 rounded-xl font-medium disabled:opacity-50">
              {saving === 'weight' ? '...' : '記録'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
