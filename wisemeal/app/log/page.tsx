'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

type Tab = 'photo' | 'search' | 'barcode' | 'manual'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<MealType, string> = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' }

interface FoodResult {
  foodName: string; totalCalories: number; totalWeight: number
  protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number
  cholesterol: number; saturatedFat: number; transFat: number
  vitaminA: number; vitaminC: number; vitaminD: number; calcium: number; iron: number; potassium: number
  allergens: string[]; ingredients: { name: string; amountG: number; calories: number }[]
  userAllergenWarnings?: string[]
}

interface SearchResult {
  id: string; name: string; category: string; per100g: { calories: number; protein: number; carbs: number; fat: number }; servingSizeG: number; servingUnit: string
}

export default function LogPage() {
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const selectedDate = useAppStore(s => s.selectedDate)
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<Tab>('photo')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FoodResult | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ dbResults: SearchResult[]; customFoods: any[] } | null>(null)
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null)
  const [amount, setAmount] = useState(100)
  const [editResult, setEditResult] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [customNote, setCustomNote] = useState('')
  const [manualForm, setManualForm] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, amount: 100 })

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) router.replace('/onboarding')
  }, [user, router, hasHydrated])

  if (!hasHydrated || !user) return null

  const analyzeImage = async (file: File) => {
    setLoading(true); setResult(null); setImagePreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('image', file)
    fd.append('allergies', JSON.stringify(user.allergies))
    try {
      const res = await fetch('/api/analyze-food', { method: 'POST', body: fd })
      const data = await res.json()
      setResult(data)
    } catch { alert('分析に失敗しました') }
    finally { setLoading(false) }
  }

  const analyzeText = async () => {
    if (!textInput.trim()) return
    setLoading(true); setResult(null)
    const fd = new FormData()
    fd.append('text', textInput)
    fd.append('allergies', JSON.stringify(user.allergies))
    try {
      const res = await fetch('/api/analyze-food', { method: 'POST', body: fd })
      setResult(await res.json())
    } catch { alert('分析に失敗しました') }
    finally { setLoading(false) }
  }

  const searchFoods = async (q: string) => {
    if (!q.trim()) { setSearchResults(null); return }
    const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}&userId=${user.id}`)
    setSearchResults(await res.json())
  }

  const selectSearchFood = (food: SearchResult) => {
    setSelectedFood(food)
    setAmount(food.servingSizeG)
    const r = food.per100g.calories * food.servingSizeG / 100
    setResult({
      foodName: food.name, totalCalories: r,
      totalWeight: food.servingSizeG,
      protein: food.per100g.protein * food.servingSizeG / 100,
      carbs: food.per100g.carbs * food.servingSizeG / 100,
      fat: food.per100g.fat * food.servingSizeG / 100,
      fiber: 0, sugar: 0, sodium: 0, cholesterol: 0, saturatedFat: 0,
      transFat: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 0, iron: 0, potassium: 0,
      allergens: [], ingredients: []
    })
  }

  const saveLog = async () => {
    if (!result) return
    setSaving(true)
    try {
      await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, date: selectedDate, mealType,
          foodName: result.foodName, amountG: result.totalWeight || amount,
          calories: result.totalCalories, proteinG: result.protein, carbsG: result.carbs,
          fatG: result.fat, fiberG: result.fiber || 0, sugarG: result.sugar || 0,
          sodiumMg: result.sodium || 0, cholesterolMg: result.cholesterol || 0,
          saturatedFatG: result.saturatedFat || 0, transFatG: result.transFat || 0,
          vitaminAMcg: result.vitaminA || 0, vitaminCMg: result.vitaminC || 0,
          vitaminDMcg: result.vitaminD || 0, calciumMg: result.calcium || 0,
          ironMg: result.iron || 0, potassiumMg: result.potassium || 0,
          allergens: result.allergens || [], ingredients: result.ingredients || [],
          source: tab === 'photo' ? 'photo' : tab === 'barcode' ? 'barcode' : 'search',
          notes: customNote,
        })
      })
      setSaved(true)
      setTimeout(() => { router.push('/dashboard') }, 1000)
    } catch { alert('保存に失敗しました') }
    finally { setSaving(false) }
  }

  const saveManual = async () => {
    if (!manualForm.name) return
    setSaving(true)
    try {
      await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, date: selectedDate, mealType,
          foodName: manualForm.name, amountG: manualForm.amount,
          calories: manualForm.calories, proteinG: manualForm.protein,
          carbsG: manualForm.carbs, fatG: manualForm.fat,
          fiberG: 0, sugarG: 0, sodiumMg: 0, cholesterolMg: 0,
          saturatedFatG: 0, transFatG: 0, vitaminAMcg: 0, vitaminCMg: 0,
          vitaminDMcg: 0, calciumMg: 0, ironMg: 0, potassiumMg: 0,
          allergens: [], ingredients: [], source: 'manual',
        })
      })
      router.push('/dashboard')
    } finally { setSaving(false) }
  }

  return (
    <AppShell>
      <div className="bg-emerald-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold mb-4">食事を記録</h1>
        <div className="flex gap-2 overflow-x-auto">
          {MEALS.map(m => (
            <button key={m} onClick={() => setMealType(m)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mealType === m ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'}`}>
              {MEAL_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {([['photo','📷 写真'], ['search','🔍 検索'], ['barcode','📱 バーコード'], ['manual','✏️ 手動']] as const).map(([t, l]) => (
            <button key={t} onClick={() => { setTab(t); setResult(null); setImagePreview(null) }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'photo' && !result && (
          <div className="space-y-4">
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-emerald-50 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full rounded-xl mb-3 max-h-48 object-cover" />
              ) : (
                <><div className="text-5xl mb-3">📷</div><p className="text-gray-600 font-medium">食事の写真を撮影・選択</p><p className="text-gray-400 text-sm mt-1">AIが自動で栄養素を分析します</p></>
              )}
              {loading && <div className="mt-3 text-emerald-600 font-medium animate-pulse">AIが分析中...</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => e.target.files?.[0] && analyzeImage(e.target.files[0])} />
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">写真がない場合はテキストで入力</p>
              <div className="flex gap-2">
                <input className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder="例：鮭定食、親子丼" onKeyDown={e => e.key === 'Enter' && analyzeText()} />
                <button onClick={analyzeText} disabled={loading || !textInput}
                  className="bg-emerald-500 text-white px-4 rounded-xl disabled:opacity-50">
                  {loading ? '...' : '分析'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div>
            <input className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
              value={searchQuery} onChange={e => { setSearchQuery(e.target.value); searchFoods(e.target.value) }}
              placeholder="食品名で検索（例：白米、鶏胸肉）" />
            {searchResults && (
              <div className="space-y-2">
                {searchResults.dbResults.map(food => (
                  <button key={food.id} onClick={() => selectSearchFood(food)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedFood?.id === food.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 text-sm">{food.name}</span>
                      <span className="text-xs text-emerald-600">{food.per100g.calories}kcal/100g</span>
                    </div>
                    <div className="text-xs text-gray-400">{food.category} • 標準 {food.servingSizeG}{food.servingUnit}</div>
                  </button>
                ))}
                {searchResults.dbResults.length === 0 && <p className="text-center text-gray-400 text-sm py-4">見つかりませんでした</p>}
              </div>
            )}
            {selectedFood && result && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">量</label>
                <div className="flex gap-2 items-center">
                  <input type="number" value={amount} onChange={e => {
                    const a = Number(e.target.value); setAmount(a)
                    if (selectedFood) {
                      const r = a / 100
                      setResult(prev => prev ? { ...prev,
                        totalCalories: selectedFood.per100g.calories * r,
                        protein: selectedFood.per100g.protein * r,
                        carbs: selectedFood.per100g.carbs * r,
                        fat: selectedFood.per100g.fat * r,
                        totalWeight: a
                      } : null)
                    }
                  }} className="w-24 border border-gray-300 rounded-xl px-3 py-2 text-center" />
                  <span className="text-gray-600">g</span>
                  <div className="ml-auto text-right">
                    <div className="text-lg font-bold text-gray-800">{Math.round(result.totalCalories)} kcal</div>
                    <div className="text-xs text-gray-400">P:{Math.round(result.protein)}g C:{Math.round(result.carbs)}g F:{Math.round(result.fat)}g</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'barcode' && !result && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-3">📱</div>
              <p className="text-gray-600 font-medium">バーコードを入力</p>
              <p className="text-gray-400 text-sm mt-1">商品のバーコード番号を入力してください</p>
            </div>
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)}
                placeholder="例：4901085xxxxxx" />
              <button onClick={async () => {
                if (!barcodeInput) return
                setLoading(true)
                const fd = new FormData()
                fd.append('text', `バーコード${barcodeInput}の商品`)
                fd.append('allergies', JSON.stringify(user.allergies))
                try {
                  const res = await fetch('/api/analyze-food', { method: 'POST', body: fd })
                  setResult(await res.json())
                } finally { setLoading(false) }
              }} disabled={loading || !barcodeInput}
                className="bg-emerald-500 text-white px-4 rounded-xl disabled:opacity-50">
                {loading ? '...' : '検索'}
              </button>
            </div>
          </div>
        )}

        {tab === 'manual' && (
          <div className="space-y-3">
            <input className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} placeholder="食品名" />
            <div className="grid grid-cols-2 gap-3">
              {([['calories', 'カロリー (kcal)'], ['protein', 'タンパク質 (g)'], ['carbs', '炭水化物 (g)'], ['fat', '脂質 (g)'], ['amount', '量 (g)']] as const).map(([k, l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input type="number" value={manualForm[k]} onChange={e => setManualForm(f => ({ ...f, [k]: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
            </div>
            <button onClick={saveManual} disabled={saving || !manualForm.name}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {saving ? '保存中...' : '記録する'}
            </button>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mt-4">
            {result.userAllergenWarnings && result.userAllergenWarnings.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 font-medium text-sm">⚠️ アレルゲン警告</p>
                <p className="text-red-600 text-xs mt-1">{result.userAllergenWarnings.join('、')} が含まれています</p>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{result.foodName}</h3>
                {result.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.allergens.map(a => (
                      <span key={a} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setEditResult(!editResult)} className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-lg">修正</button>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{Math.round(result.totalCalories)}</div>
              <div className="text-sm text-gray-500">kcal ({Math.round(result.totalWeight || 100)}g)</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['タンパク質', result.protein, 'g', 'blue'], ['炭水化物', result.carbs, 'g', 'yellow'], ['脂質', result.fat, 'g', 'red']].map(([l, v, u, c]) => (
                <div key={l as string} className={`text-center p-2 bg-${c}-50 rounded-xl`}>
                  <div className={`font-bold text-${c}-600`}>{Math.round(v as number)}{u}</div>
                  <div className="text-xs text-gray-500">{l}</div>
                </div>
              ))}
            </div>

            {(result.fiber > 0 || result.sodium > 0) && (
              <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
                {[['食物繊維', result.fiber, 'g'], ['糖質', result.sugar, 'g'], ['ナトリウム', result.sodium, 'mg'], ['コレステロール', result.cholesterol, 'mg']].map(([l, v, u]) => (
                  <div key={l as string} className="bg-gray-50 rounded-lg p-2">
                    <div className="font-semibold text-gray-700">{Math.round(v as number)}{u}</div>
                    <div className="text-gray-400">{l}</div>
                  </div>
                ))}
              </div>
            )}

            {result.ingredients.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">食材の内訳</p>
                <div className="space-y-1">
                  {result.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50">
                      <span>{ing.name} ({ing.amountG}g)</span>
                      <span>{Math.round(ing.calories)} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="メモ（任意）" />

            {saved ? (
              <div className="text-center text-emerald-600 font-semibold py-3">✅ 記録しました！</div>
            ) : (
              <button onClick={saveLog} disabled={saving}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-600 transition-colors">
                {saving ? '保存中...' : `${MEAL_LABELS[mealType]}として記録`}
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
