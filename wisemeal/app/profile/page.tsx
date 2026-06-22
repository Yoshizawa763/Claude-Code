'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'
import { calculateDailyCalories, calculateBMI } from '@/lib/utils'

const ALLERGENS = ['小麦', '乳', '卵', '大豆', '落花生', 'くるみ', 'えび', 'かに', '魚', 'そば']
const RESTRICTIONS = ['ベジタリアン', 'ヴィーガン', '糖質制限', '塩分制限', 'グルテンフリー']

export default function ProfilePage() {
  const user = useAppStore(s => s.user)
  const setUser = useAppStore(s => s.setUser)
  const clearUser = useAppStore(s => s.clearUser)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(user || {} as any)

  if (!user) { router.replace('/onboarding'); return null }

  const bmi = calculateBMI(user.weightKg, user.heightCm)
  const bmiLabel = bmi < 18.5 ? '低体重' : bmi < 25 ? '普通体重' : bmi < 30 ? '肥満(1度)' : '肥満(2度以上)'
  const bmiColor = bmi < 18.5 ? 'text-blue-500' : bmi < 25 ? 'text-emerald-500' : bmi < 30 ? 'text-yellow-500' : 'text-red-500'

  const save = async () => {
    setSaving(true)
    try {
      const goals = calculateDailyCalories(form.weightKg, form.heightCm, form.age, form.gender, form.activityLevel, form.goal)
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...form, ...goals, dailyCalorieGoal: goals.calories, proteinGoalG: goals.protein, carbGoalG: goals.carbs, fatGoalG: goals.fat })
      })
      const updated = await res.json()
      setUser({ ...user, ...form, dailyCalorieGoal: goals.calories, proteinGoalG: goals.protein, carbGoalG: goals.carbs, fatGoalG: goals.fat })
      setEditing(false)
    } finally { setSaving(false) }
  }

  const toggleArr = (key: 'allergies' | 'dietaryRestrictions', val: string) => {
    setForm((f: any) => ({
      ...f, [key]: f[key]?.includes(val) ? f[key].filter((x: string) => x !== val) : [...(f[key] || []), val]
    }))
  }

  return (
    <AppShell>
      <div className="bg-gray-800 pt-12 pb-8 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-4xl">
          {user.gender === 'male' ? '👨' : '👩'}
        </div>
        <h1 className="text-white text-xl font-bold">{user.name}</h1>
        <p className="text-gray-400 text-sm">{user.goal === 'lose_weight' ? '体重減量' : user.goal === 'gain_muscle' ? '筋肉増量' : '健康維持'}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">BMI & 体組成</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-gray-800">{user.heightCm}cm</div>
              <div className="text-xs text-gray-400">身長</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-gray-800">{user.weightKg}kg</div>
              <div className="text-xs text-gray-400">体重</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className={`text-lg font-bold ${bmiColor}`}>{bmi}</div>
              <div className="text-xs text-gray-400">BMI</div>
            </div>
          </div>
          <p className={`text-center text-sm mt-2 font-medium ${bmiColor}`}>{bmiLabel}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">1日の目標</h3>
          <div className="space-y-2">
            {[
              ['🔥 カロリー', `${user.dailyCalorieGoal} kcal`],
              ['💪 タンパク質', `${user.proteinGoalG}g`],
              ['⚡ 炭水化物', `${user.carbGoalG}g`],
              ['🥑 脂質', `${user.fatGoalG}g`],
              ['💧 水分', `${user.waterGoalMl}mL`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-600 text-sm">{l}</span>
                <span className="font-semibold text-gray-800 text-sm">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {user.allergies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-2">アレルゲン設定</h3>
            <div className="flex flex-wrap gap-2">
              {user.allergies.map(a => (
                <span key={a} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {editing ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">プロフィール編集</h3>
            <div className="space-y-3">
              {[['name', 'お名前', 'text'], ['age', '年齢', 'number'], ['heightCm', '身長 (cm)', 'number'], ['weightKg', '体重 (kg)', 'number'], ['goalWeightKg', '目標体重 (kg)', 'number']].map(([k, l, t]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm((f: any) => ({ ...f, [k]: t === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 mb-1">活動レベル</label>
                <select value={form.activityLevel} onChange={e => setForm((f: any) => ({ ...f, activityLevel: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="sedentary">ほぼ座っている</option>
                  <option value="light">軽い運動（週1〜3回）</option>
                  <option value="moderate">適度な運動（週3〜5回）</option>
                  <option value="active">激しい運動（週6〜7回）</option>
                  <option value="very_active">とても激しい運動</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">アレルギー</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map(a => (
                    <button key={a} onClick={() => toggleArr('allergies', a)}
                      className={`px-2 py-1 rounded-full text-xs border transition-colors ${form.allergies?.includes(a) ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600">キャンセル</button>
                <button onClick={save} disabled={saving} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={() => setEditing(true)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 text-gray-700 font-medium shadow-sm">
              ✏️ プロフィールを編集
            </button>
            <button onClick={() => { clearUser(); router.replace('/onboarding') }}
              className="w-full border border-red-200 rounded-2xl py-4 text-red-500 font-medium">
              ログアウト / リセット
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
