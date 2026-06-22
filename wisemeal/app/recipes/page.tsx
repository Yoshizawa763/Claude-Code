'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import AppShell from '@/components/layout/AppShell'

interface Recipe {
  id?: string; name: string; description?: string; servings: number; prepTimeMin?: number; cookTimeMin?: number
  calories: number; protein: number; carbs: number; fat: number; fiber: number
  ingredients: { name: string; amount: string; note?: string }[]
  instructions: string[]
  tags: string[]
  tips?: string
  sourceUrl?: string
}

export default function RecipesPage() {
  const user = useAppStore(s => s.user)
  const hasHydrated = useAppStore(s => s._hasHydrated)
  const router = useRouter()
  const [tab, setTab] = useState<'generate' | 'saved' | 'import'>('generate')
  const [ingredients, setIngredients] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<Recipe | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [importUrl, setImportUrl] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!hasHydrated) return; if (!user) router.replace('/onboarding') }, [user, router, hasHydrated])

  const fetchSaved = useCallback(async () => {
    if (!user) return
    const res = await fetch(`/api/recipes?userId=${user.id}`)
    setSavedRecipes(await res.json())
  }, [user])

  useEffect(() => { if (tab === 'saved') fetchSaved() }, [tab, fetchSaved])

  if (!user) return null

  const generateRecipe = async () => {
    if (!ingredients.trim()) return
    setLoading(true); setGenerated(null)
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.split(/[,、]+/).map(s => s.trim()).filter(Boolean),
          goal: user.goal, calories: user.dailyCalorieGoal / 3,
          restrictions: user.dietaryRestrictions, servings: 1
        })
      })
      setGenerated(await res.json())
    } catch { alert('生成に失敗しました') }
    finally { setLoading(false) }
  }

  const importRecipe = async () => {
    if (!importUrl.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      })
      setGenerated(await res.json())
    } catch { alert('インポートに失敗しました') }
    finally { setLoading(false) }
  }

  const saveRecipe = async (recipe: Recipe) => {
    setSaving(true)
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, userId: user.id, proteinG: recipe.protein, carbsG: recipe.carbs, fatG: recipe.fat, fiberG: recipe.fiber || 0 })
      })
      alert('保存しました！')
      fetchSaved()
    } finally { setSaving(false) }
  }

  const deleteRecipe = async (id: string) => {
    await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' })
    fetchSaved()
  }

  const RecipeCard = ({ recipe, onSave }: { recipe: Recipe; onSave?: () => void }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{recipe.name}</h3>
            {recipe.description && <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>}
          </div>
          {onSave && (
            <button onClick={onSave} disabled={saving}
              className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg ml-2 flex-shrink-0">
              保存
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-3">
          {recipe.prepTimeMin && <span className="text-xs text-gray-400">⏱ 準備 {recipe.prepTimeMin}分</span>}
          {recipe.cookTimeMin && <span className="text-xs text-gray-400">🍳 調理 {recipe.cookTimeMin}分</span>}
          <span className="text-xs text-gray-400">🍽 {recipe.servings}人前</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[['🔥', Math.round(recipe.calories), 'kcal'], ['💪', Math.round(recipe.protein), 'g P'], ['⚡', Math.round(recipe.carbs), 'g C'], ['🥑', Math.round(recipe.fat), 'g F']].map(([icon, v, u]) => (
            <div key={u as string} className="text-center bg-gray-50 rounded-xl p-2">
              <div className="text-lg">{icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{v}</div>
              <div className="text-xs text-gray-400">{u}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap mb-3">
          {recipe.tags?.map(t => (
            <span key={t} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
        <button onClick={() => setSelectedRecipe(selectedRecipe?.name === recipe.name ? null : recipe)}
          className="text-sm text-emerald-600 font-medium">
          {selectedRecipe?.name === recipe.name ? '▲ 閉じる' : '▼ 詳細を見る'}
        </button>
      </div>

      {selectedRecipe?.name === recipe.name && (
        <div className="border-t border-gray-100 p-4">
          <h4 className="font-semibold text-gray-700 mb-2">材料</h4>
          <div className="space-y-1 mb-4">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{ing.name}</span>
                <span className="text-gray-400">{ing.amount} {ing.note && `(${ing.note})`}</span>
              </div>
            ))}
          </div>
          <h4 className="font-semibold text-gray-700 mb-2">作り方</h4>
          <div className="space-y-2">
            {recipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="text-gray-600">{step}</span>
              </div>
            ))}
          </div>
          {recipe.tips && (
            <div className="mt-3 bg-yellow-50 rounded-xl p-3">
              <p className="text-sm text-yellow-800">💡 {recipe.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <AppShell>
      <div className="bg-orange-500 pt-12 pb-6 px-4">
        <h1 className="text-white text-xl font-bold mb-4">AIレシピ</h1>
        <div className="flex bg-white/20 rounded-xl p-1 gap-1">
          {([['generate', '✨ 生成'], ['import', '📥 インポート'], ['saved', '⭐ 保存済み']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-orange-600' : 'text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {tab === 'generate' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">手元の食材からレシピを作成</h3>
              <p className="text-sm text-gray-500 mb-3">使いたい食材をカンマ区切りで入力してください</p>
              <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows={3} value={ingredients} onChange={e => setIngredients(e.target.value)}
                placeholder="例：鶏胸肉、ブロッコリー、玉ねぎ、にんにく" />
              <button onClick={generateRecipe} disabled={loading || !ingredients.trim()}
                className="w-full mt-3 bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'AIがレシピを考え中...' : '🤖 レシピを生成'}
              </button>
            </div>
            {generated && <RecipeCard recipe={generated} onSave={() => saveRecipe(generated)} />}
          </div>
        )}

        {tab === 'import' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">SNSからレシピをインポート</h3>
              <p className="text-sm text-gray-500 mb-3">Instagram、YouTube、TikTokなどのURLを入力</p>
              <input className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-3"
                value={importUrl} onChange={e => setImportUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..." />
              <button onClick={importRecipe} disabled={loading || !importUrl.trim()}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'インポート中...' : '📥 インポート'}
              </button>
            </div>
            {generated && <RecipeCard recipe={generated} onSave={() => saveRecipe(generated)} />}
          </div>
        )}

        {tab === 'saved' && (
          <div>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">👨‍🍳</div>
                <p>保存したレシピがありません</p>
                <button onClick={() => setTab('generate')} className="mt-3 text-orange-500 font-medium text-sm">レシピを生成する</button>
              </div>
            ) : savedRecipes.map((recipe: any) => (
              <div key={recipe.id} className="relative">
                <RecipeCard recipe={{ ...recipe, protein: recipe.proteinG, carbs: recipe.carbsG, fat: recipe.fatG }} />
                <button onClick={() => deleteRecipe(recipe.id)} className="absolute top-4 right-4 text-red-400 text-sm">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
