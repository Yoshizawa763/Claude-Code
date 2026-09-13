import { useMemo, useState } from 'react'
import { PressButton } from '../components/PressButton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useApp, lineUnitPrice } from '../store/AppStore'
import { BADGES } from '../data/badges'
import { yen } from '../lib/format'

export function BillScreen() {
  const { state, totals, dispatch } = useApp()
  const [resetOpen, setResetOpen] = useState(false)

  const aggregated = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; qty: number; amount: number }>()
    for (const o of state.orders) {
      for (const l of o.lines) {
        const key = `${l.itemId}|${l.selectedOptions.map((x) => x.label).join(',')}`
        const cur = map.get(key) ?? { name: l.name + (l.selectedOptions.length ? `（${l.selectedOptions.map((x) => x.label).join('・')}）` : ''), emoji: l.emoji, qty: 0, amount: 0 }
        cur.qty += l.quantity
        cur.amount += lineUnitPrice(l) * l.quantity
        map.set(key, cur)
      }
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [state.orders])

  const unlocked = BADGES.filter((b) => state.unlockedBadgeIds.includes(b.id))
  const nextBadge = BADGES.find((b) => !state.unlockedBadgeIds.includes(b.id))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3">
        <h1 className="text-lg font-black">💴 伝票確認</h1>
        <div className="text-xs font-bold text-stone-500">{state.table ? `${state.table.tableNo}番卓 ・ ${state.table.guests}名様` : ''}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mx-auto grid max-w-5xl gap-3 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="rounded-2xl bg-brand-950 p-4 text-white">
              <div className="text-xs font-bold text-white/60">累計金額（{totals.totalItems.toLocaleString()}点）</div>
              <div className="mt-1 font-mono text-4xl font-black tabular-nums text-accent-300 sm:text-5xl">{yen(totals.totalYen)}</div>
              <div className="mt-2 text-[11px] font-bold text-white/60">デモのため会計はありません。0円です。</div>
            </div>
            {aggregated.length === 0 ? (
              <div className="py-10 text-center text-sm font-bold text-stone-400">まだ注文がありません</div>
            ) : (
              <ul className="mt-3 divide-y divide-stone-100 text-sm">
                {aggregated.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 py-2">
                    <span className="text-lg">{a.emoji}</span>
                    <span className="min-w-0 flex-1 truncate font-bold">{a.name}</span>
                    <span className="w-12 text-right tabular-nums text-stone-500">×{a.qty}</span>
                    <span className="w-24 text-right font-black tabular-nums">{yen(a.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="text-sm font-black">🏅 解放した称号</div>
              {unlocked.length === 0 ? (
                <div className="mt-2 text-xs font-bold text-stone-400">まだありません。まずは10点注文で「注文見習い」。</div>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {unlocked.map((b) => (
                    <li key={b.id} className="flex items-center gap-2 rounded-xl bg-amber-50 px-2 py-1.5 text-sm">
                      <span className="text-xl">{b.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-black text-amber-900">{b.name}</div>
                        <div className="text-[11px] text-amber-700">{b.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {nextBadge && (
                <div className="mt-3 rounded-xl bg-stone-50 px-2 py-1.5 text-[11px] font-bold text-stone-500">
                  次の称号：{nextBadge.emoji} {nextBadge.name}（{nextBadge.description}）
                </div>
              )}
            </div>
            <PressButton sound="cancel" onClick={() => setResetOpen(true)} className="rounded-2xl bg-stone-200 px-4 py-3 text-xs font-black text-stone-600">
              履歴と称号をリセット
            </PressButton>
          </div>
        </div>
      </div>
      <ConfirmDialog open={resetOpen} title="履歴と称号をすべて消しますか？" confirmLabel="消す" cancelLabel="やめる" onConfirm={() => { dispatch({ type: 'RESET_ALL' }); setResetOpen(false) }} onCancel={() => setResetOpen(false)}>
        <p className="text-center">この端末に保存されている注文履歴・累計・称号が消えます。</p>
      </ConfirmDialog>
    </div>
  )
}
