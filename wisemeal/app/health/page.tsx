'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'
import { EXERCISES, calculateExerciseCalories } from '@/lib/utils'

interface ExerciseLog {
  id: string
  name: string
  durationMin: number
  caloriesBurned: number
}

export default function HealthPage() {
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const selectedDate = useAppStore(s => s.selectedDate)
  const router = useRouter()

  const [waterTotal, setWaterTotal] = useState(0)
  const [steps, setSteps] = useState(0)
  const [weight, setWeight] = useState<number | null>(null)
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
  const [waterInput, setWaterInput] = useState(250)
  const [stepsInput, setStepsInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0])
  const [durationInput, setDurationInput] = useState('')
  const [saving, setSaving] = useState('')

  useEffect(() => { if (!hasHydrated) return; if (!user) router.replace('/onboarding') }, [user, router, hasHydrated])

  const fetchData = useCallback(async () => {
    if (!user) return
    const [waterRes, stepsRes, weightRes, exerciseRes] = await Promise.all([
      fetch(`/api/water?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/steps?userId=${user.id}&date=${selectedDate}`),
      fetch(`/api/weight?userId=${user.id}`),
      fetch(`/api/exercises?userId=${user.id}&date=${selectedDate}`),
    ])
    const waterData = await waterRes.json()
    setWaterTotal(waterData.total || 0)
    const stepsData = await stepsRes.json()
    setSteps(stepsData[0]?.steps || 0)
    const weightData = await weightRes.json()
    const todayWeight = weightData.find((w: any) => w.date === selectedDate)
    setWeight(todayWeight?.weightKg || null)
    setExerciseLogs(await exerciseRes.json())
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

  const addExercise = async () => {
    if (!durationInput || Number(durationInput) <= 0) return
    setSaving('exercise')
    const dur = Number(durationInput)
    const kcal = calculateExerciseCalories(selectedExercise.met, user.weightKg, dur)
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        date: selectedDate,
        name: selectedExercise.name,
        durationMin: dur,
        metValue: selectedExercise.met,
        caloriesBurned: kcal,
      })
    })
    setDurationInput('')
    await fetchData()
    setSaving('')
  }

  const deleteExercise = async (id: string) => {
    await fetch(`/api/exercises?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const previewCalories = durationInput && Number(durationInput) > 0
    ? calculateExerciseCalories(selectedExercise.met, user.weightKg, Number(durationInput))
    : 0

  const totalExerciseCalories = exerciseLogs.reduce((s, e) => s + e.caloriesBurned, 0)

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
        {/* 運動 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              <h3 className="font-semibold text-gray-800">運動</h3>
            </div>
            {totalExerciseCalories > 0 && (
              <span className="text-sm font-bold text-orange-500">+{Math.round(totalExerciseCalories)} kcal 消費</span>
            )}
          </div>

          {/* 競技選択 */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
            {EXERCISES.map(ex => (
              <button key={ex.name} onClick={() => setSelectedExercise(ex)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-colors ${
                  selectedExercise.name === ex.name
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600'
                }`}>
                <span className="text-xl">{ex.icon}</span>
                <span className="text-xs mt-0.5 whitespace-nowrap">{ex.name}</span>
              </button>
            ))}
          </div>

          {/* 時間入力 */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input
                type="number"
                value={durationInput}
                onChange={e => setDurationInput(e.target.value === '' ? '' : e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="時間（分）"
              />
            </div>
            <button onClick={addExercise} disabled={saving === 'exercise' || !durationInput}
              className="bg-orange-500 text-white px-5 rounded-xl font-medium disabled:opacity-50">
              {saving === 'exercise' ? '...' : '記録'}
            </button>
          </div>

          {/* カロリープレビュー */}
          {previewCalories > 0 && (
            <div className="bg-orange-50 rounded-xl p-3 mb-3 text-center">
              <span className="text-sm text-orange-600">
                {selectedExercise.icon} {selectedExercise.name} {durationInput}分 →
                <span className="font-bold text-orange-700 ml-1">約 {previewCalories} kcal 消費</span>
              </span>
            </div>
          )}

          {/* 記録済みリスト */}
          {exerciseLogs.length > 0 && (
            <div className="space-y-2">
              {exerciseLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{log.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{log.durationMin}分</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-orange-500">-{Math.round(log.caloriesBurned)} kcal</span>
                    <button onClick={() => deleteExercise(log.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 水分補給 */}
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

        {/* 歩数 */}
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

        {/* 体重 */}
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
