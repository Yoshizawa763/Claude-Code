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
import { Icon } from '../components/Icon'

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
      {/* カテゴリレール（ダイニーと同じく、選択中は地色を落として右端に黄色のバー） */}
      <aside className="no-scrollbar flex w-20 shrink-0 flex-col overflow-y-auto bg-d-surface pb-24 sm:w-28 sm:pb-24 lg:pb-7">
        {[{ id: 'recommend' as Tab, name: 'おすすめ' }, ...CATEGORIES.map((c) => ({ id: c.id as Tab, name: c.name }))].map((c) => {
          const on = tab === c.id && !query
          return (
            <PressButton
              key={c.id}
              sound="none"
              onClick={() => selectTab(c.id)}
              className={`relative px-2 py-3.5 text-left text-[11px] leading-snug sm:text-xs ${
                on ? 'bg-d-bg font-bold text-d-text' : c.id === 'luxury' ? 'text-d-yellow' : 'text-d-muted'
              }`}
            >
              {c.name}
              {on && <span className="absolute inset-y-2 right-0 w-1 rounded-l bg-d-yellow" />}
            </PressButton>
          )
        })}
      </aside>

      {/* メイン */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 border-b border-d-line bg-d-surface px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワード検索（例：レモン、唐揚げ、うに）"
                className="h-10 w-full rounded-full border border-d-line bg-d-bg pl-9 pr-9 text-sm text-d-text outline-none placeholder:text-d-muted focus:border-d-yellow"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-d-muted"><Icon name="search" className="h-4 w-4" /></span>
              {query && (
                <PressButton sound="cancel" onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-d-raised text-xs font-bold text-d-sub">
                  ✕
                </PressButton>
              )}
            </div>
            <div className="hidden text-xs font-bold text-d-sub md:block">{items.length}品</div>
          </div>

          {!query && category && (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {['all', ...category.subCategories].map((s) => (
                <PressButton
                  key={s}
                  sound="tap"
                  onClick={() => setSubCat(s)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    subCat === s ? 'bg-d-yellow text-d-ink' : 'bg-d-raised text-d-text'
                  }`}
                >
                  {s === 'all' ? 'すべて' : s}
                </PressButton>
              ))}
            </div>
          )}
          {!query && tab === 'recommend' && (
            <div className="text-base font-bold text-d-text">当店のおすすめ</div>
          )}
          {!query && tab === 'luxury' && (
            <div className="text-xs text-d-sub">押しごたえ枠。連打すると累計金額が大きく伸びます</div>
          )}
        </div>

        <div ref={gridRef} className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 lg:pb-3">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-d-muted">
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
      <aside className="hidden w-80 shrink-0 border-l border-d-line lg:block xl:w-96">
        <CartPanel onCheckout={() => setConfirmOpen(true)} />
      </aside>

      {/* モバイル用のカートバー */}
      {state.cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
          <PressButton
            sound="tap"
            haptics="medium"
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center justify-between rounded-xl bg-cta px-4 text-d-text shadow-2xl"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-d-text px-1.5 text-xs text-d-ink">{cart.count}</span>
              カートを見る
            </span>
            <span className="text-lg font-bold tabular-nums">{yen(cart.subtotal)}</span>
          </PressButton>
        </div>
      )}
      <Modal open={cartOpen} onClose={() => setCartOpen(false)} sheet className="h-[85dvh] w-full sm:max-w-lg">
        <CartPanel onCheckout={() => setConfirmOpen(true)} onClose={() => setCartOpen(false)} />
      </Modal>

      <ItemModal item={selected} soldOut={selected ? isSoldOut(selected.id) : false} onClose={() => setSelected(null)} onAdd={addToCart} />

      <ConfirmDialog open={confirmOpen} title="この内容で注文しますか？" confirmLabel="注文する" cancelLabel="戻る" onConfirm={placeOrder} onCancel={() => setConfirmOpen(false)}>
        <div className="rounded-xl bg-d-sheet p-3 text-center">
          <div className="text-xs font-bold text-d-sub">{cart.count}点</div>
          <div className="text-2xl font-bold tabular-nums text-d-text">{yen(cart.subtotal)}</div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
