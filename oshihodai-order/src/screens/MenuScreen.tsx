import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CategoryId, MenuItem } from '../types'
import { CATEGORIES, MENU_ITEMS, RANKED_ITEMS } from '../data/menu'
import { useApp } from '../store/AppStore'
import { useAddToCart, defaultSelections, selectionsToOptions } from '../hooks/useAddToCart'
import { MenuCard } from '../components/MenuCard'
import { ItemModal } from '../components/ItemModal'
import { CartPanel } from '../components/CartPanel'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Modal } from '../components/Modal'
import { PressButton } from '../components/PressButton'
import { sfxTap } from '../lib/audio'
import { yen } from '../lib/format'

type Tab = 'recommend' | CategoryId

interface Props {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  onOrderPlaced: () => void
}

export function MenuScreen({ cartOpen, setCartOpen, onOrderPlaced }: Props) {
  const { state, cart, dispatch, isSoldOut } = useApp()
  const addToCart = useAddToCart()
  const [tab, setTab] = useState<Tab>('recommend')
  const [subCat, setSubCat] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const category = tab === 'recommend' ? null : CATEGORIES.find((c) => c.id === tab)!

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      return MENU_ITEMS.filter((m) => m.name.toLowerCase().includes(q) || (m.kana ?? '').includes(q) || m.description.includes(q) || m.subCategory.includes(q))
    }
    if (tab === 'recommend') return RANKED_ITEMS
    return MENU_ITEMS.filter((m) => m.category === tab && (subCat === 'all' || m.subCategory === subCat))
  }, [query, tab, subCat])

  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 })
  }, [tab, subCat, query])

  const selectTab = (t: Tab) => {
    sfxTap()
    setTab(t)
    setSubCat('all')
    setQuery('')
  }

  const quickAdd = useCallback(
    (item: MenuItem, from: DOMRect) => {
      addToCart(item, 1, selectionsToOptions(item, defaultSelections(item)), from)
    },
    [addToCart],
  )

  const placeOrder = () => {
    setConfirmOpen(false)
    setCartOpen(false)
    dispatch({ type: 'PLACE_ORDER' })
    onOrderPlaced()
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* カテゴリレール */}
      <aside className="no-scrollbar flex w-20 shrink-0 flex-col gap-0.5 overflow-y-auto bg-brand-900 p-1.5 pb-24 sm:w-28 sm:pb-24 lg:pb-7">
        <PressButton
          sound="none"
          onClick={() => selectTab('recommend')}
          className={`flex flex-col items-center rounded-xl px-1 py-1.5 text-[10px] font-black leading-tight lg:py-1 ${
            tab === 'recommend' && !query ? 'bg-accent-400 text-brand-950' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <span className="text-xl lg:text-lg">🏆</span>
          おすすめ
        </PressButton>
        {CATEGORIES.map((c) => (
          <PressButton
            key={c.id}
            sound="none"
            onClick={() => selectTab(c.id)}
            className={`flex flex-col items-center rounded-xl px-1 py-1.5 text-[10px] font-black leading-tight lg:py-1 ${
              tab === c.id && !query
                ? c.id === 'luxury'
                  ? 'shimmer-gold text-amber-950'
                  : 'bg-accent-400 text-brand-950'
                : c.id === 'luxury'
                  ? 'text-amber-300 hover:bg-white/10'
                  : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="text-xl lg:text-lg">{c.emoji}</span>
            <span className="text-center">{c.name}</span>
          </PressButton>
        ))}
      </aside>

      {/* メイン */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 border-b border-black/5 bg-white/80 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワード検索（例：レモン、唐揚げ、うに）"
                className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-9 text-sm font-bold outline-none focus:border-brand-500"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
              {query && (
                <PressButton sound="cancel" onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-stone-100 text-xs font-black text-stone-500">
                  ✕
                </PressButton>
              )}
            </div>
            <div className="hidden text-xs font-bold text-stone-500 md:block">{items.length}品</div>
          </div>

          {!query && category && (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {['all', ...category.subCategories].map((s) => (
                <PressButton
                  key={s}
                  sound="tap"
                  onClick={() => setSubCat(s)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${
                    subCat === s ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {s === 'all' ? 'すべて' : s}
                </PressButton>
              ))}
            </div>
          )}
          {!query && tab === 'recommend' && (
            <div className="text-xs font-bold text-stone-500">👑 本日のおすすめランキング — 押せば押すほど気持ちいい</div>
          )}
          {!query && tab === 'luxury' && (
            <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800">👑 押しごたえ枠。ここを連打すると累計金額が派手に伸びます</div>
          )}
        </div>

        <div ref={gridRef} className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 lg:pb-3">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
              <div className="text-5xl">🤔</div>
              <div className="text-sm font-bold">該当する商品がありません</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
              {items.map((m) => (
                <MenuCard key={m.id} item={m} soldOut={isSoldOut(m.id)} onOpen={setSelected} onQuickAdd={quickAdd} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* カート（横幅が広い端末では常時表示） */}
      <aside className="hidden w-80 shrink-0 border-l border-black/5 lg:block xl:w-96">
        <CartPanel onCheckout={() => setConfirmOpen(true)} />
      </aside>

      {/* モバイル用のカートバー */}
      {state.cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
          <PressButton
            sound="tap"
            haptics="medium"
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center justify-between rounded-2xl bg-brand-950 px-4 text-white shadow-2xl"
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent-400 px-1.5 text-xs text-brand-950">{cart.count}</span>
              カートを見る
            </span>
            <span className="font-mono text-lg font-black tabular-nums">{yen(cart.subtotal)}</span>
          </PressButton>
        </div>
      )}
      <Modal open={cartOpen} onClose={() => setCartOpen(false)} sheet className="h-[85dvh] w-full sm:max-w-lg">
        <CartPanel onCheckout={() => setConfirmOpen(true)} onClose={() => setCartOpen(false)} />
      </Modal>

      <ItemModal item={selected} soldOut={selected ? isSoldOut(selected.id) : false} onClose={() => setSelected(null)} onAdd={addToCart} />

      <ConfirmDialog open={confirmOpen} title="この内容で注文しますか？" confirmLabel="注文する" cancelLabel="戻る" onConfirm={placeOrder} onCancel={() => setConfirmOpen(false)}>
        <div className="rounded-xl bg-stone-50 p-3 text-center">
          <div className="text-xs font-bold text-stone-500">{cart.count}点</div>
          <div className="font-mono text-2xl font-black tabular-nums text-brand-900">{yen(cart.subtotal)}</div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
