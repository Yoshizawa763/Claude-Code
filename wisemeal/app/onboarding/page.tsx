'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'

const STEPS = ['基本情報', '体型・体重', '目標設定', 'アレルギー']

const ALLERGENS = ['小麦', '乳', '卵', '大豆', '落花生', 'くるみ', 'えび', 'かに', '魚', 'そば']
const RESTRICTIONS = ['ベジタリアン', 'ヴィーガン', '糖質制限', '塩分制限', 'グルテンフリー']

export default function OnboardingPage() {
  const router = useRouter()
  const setUser = useAppStore(s => s.setUser)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', age: 25, gender: 'female',
    heightCm: 160, weightKg: 55, goalWeightKg: 52,
    activityLevel: 'moderate', goal: 'maintain',
    allergies: [] as string[], dietaryRestrictions: [] as string[]
  })

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleArr = (key: 'allergies' | 'dietaryRestrictions', val: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`サーバーエラー (${res.status}): ${err}`)
      }
      const user = await res.json()
      setUser({
        id: user.id, name: user.name, age: user.age, gender: user.gender,
        heightCm: user.heightCm, weightKg: user.weightKg, goalWeightKg: user.goalWeightKg,
        activityLevel: user.activityLevel, goal: user.goal,
        allergies: JSON.parse(user.allergies), dietaryRestrictions: JSON.parse(user.dietaryRestrictions),
        dailyCalorieGoal: user.dailyCalorieGoal, proteinGoalG: user.proteinGoalG,
        carbGoalG: user.carbGoalG, fatGoalG: user.fatGoalG, waterGoalMl: user.waterGoalMl
      })
      router.replace('/dashboard')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-emerald-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🥗</div>
          <h1 className="text-2xl font-bold text-gray-800">WiseMeal へようこそ</h1>
          <p className="text-gray-500 text-sm mt-1">AIがあなたの食事管理をサポートします</p>
        </div>

        <div className="flex gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.name} onChange={e => update('name', e.target.value)} placeholder="田中 花子" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
              <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.age || ''} onChange={e => update('age', e.target.value === '' ? 0 : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
              <div className="flex gap-3">
                {[['female', '女性'], ['male', '男性']].map(([v, l]) => (
                  <button key={v} onClick={() => update('gender', v)}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${form.gender === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label>
              <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.heightCm || ''} onChange={e => update('heightCm', e.target.value === '' ? 0 : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">現在の体重 (kg)</label>
              <input type="number" step="0.1" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.weightKg || ''} onChange={e => update('weightKg', e.target.value === '' ? 0 : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目標体重 (kg)</label>
              <input type="number" step="0.1" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.goalWeightKg || ''} onChange={e => update('goalWeightKg', e.target.value === '' ? 0 : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活動レベル</label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.activityLevel} onChange={e => update('activityLevel', e.target.value)}>
                <option value="sedentary">ほぼ座っている</option>
                <option value="light">軽い運動（週1〜3回）</option>
                <option value="moderate">適度な運動（週3〜5回）</option>
                <option value="active">激しい運動（週6〜7回）</option>
                <option value="very_active">とても激しい運動</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">あなたの主な目標を選んでください</p>
            {[
              { v: 'lose_weight', icon: '⬇️', t: '体重を減らす', d: '健康的に痩せたい' },
              { v: 'maintain', icon: '⚖️', t: '体重を維持する', d: '健康的な食生活を送りたい' },
              { v: 'gain_muscle', icon: '💪', t: '筋肉をつける', d: 'バルクアップしたい' },
            ].map(({ v, icon, t, d }) => (
              <button key={v} onClick={() => update('goal', v)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${form.goal === v ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{t}</div>
                    <div className="text-sm text-gray-500">{d}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">アレルギー（複数選択可）</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map(a => (
                  <button key={a} onClick={() => toggleArr('allergies', a)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.allergies.includes(a) ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">食事制限（複数選択可）</p>
              <div className="flex flex-wrap gap-2">
                {RESTRICTIONS.map(r => (
                  <button key={r} onClick={() => toggleArr('dietaryRestrictions', r)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      form.dietaryRestrictions.includes(r) ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
              戻る
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.name}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
              次へ
            </button>
          ) : (
            <button onClick={submit} disabled={loading}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
              {loading ? '設定中...' : '始める 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
