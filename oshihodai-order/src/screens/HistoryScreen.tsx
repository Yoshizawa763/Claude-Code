import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import { useToast } from '../hooks/useToast'
import { formatTime, yen } from '../lib/format'
import { sfxPop } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { emitFx } from '../lib/fx'

export function HistoryScreen({ onGoMenu }: { onGoMenu: () => void }) {
  const { state, dispatch } = useApp()
  const { push } = useToast()
  const orders = state.orders.slice().reverse()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-d-line bg-d-surface px-4 py-3">
        <h1 className="text-lg font-bold">注文履歴</h1>
        <div className="text-xs font-bold text-d-sub">{state.orders.length}件</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {orders.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-d-muted">
            <div className="text-sm font-bold">まだ注文がありません</div>
            <PressButton sound="click" onClick={onGoMenu} className="rounded-xl bg-cta px-5 py-3 text-sm font-bold text-d-text">
              メニューへ
            </PressButton>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-col rounded-2xl bg-d-surface p-4 shadow-sm ring-1 ring-d-line">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-bold">伝票 No.{o.ticketNo}</div>
                  <div className="text-xs font-bold text-d-sub">{formatTime(o.placedAt)}</div>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {o.lines.map((l) => (
                    <li key={l.lineId} className="flex justify-between gap-2">
                      <span className="truncate">
                        {l.emoji} {l.name}
                        {l.selectedOptions.length > 0 && <span className="ml-1 text-[11px] text-d-muted">({l.selectedOptions.map((x) => x.label).join('・')})</span>}
                      </span>
                      <span className="shrink-0 font-bold tabular-nums">×{l.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-d-line pt-3">
                  <div>
                    <span className="text-xs font-bold text-d-sub">{o.itemCount}点 </span>
                    <span className="text-lg font-bold tabular-nums text-d-text">{yen(o.total)}</span>
                  </div>
                  <PressButton
                    sound="none"
                    haptics="medium"
                    onClick={(e) => {
                      sfxPop()
                      haptic.medium()
                      dispatch({ type: 'REORDER', order: o })
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      emitFx({ type: 'fly', emoji: '🧾', from: r })
                      push({ kind: 'success', emoji: '🔁', title: `${o.itemCount}点をカートに追加しました`, body: 'メニュー画面のカートから確定できます' })
                    }}
                    className="rounded-xl bg-cta px-4 py-2.5 text-sm font-bold text-d-text "
                  >
                    もう一度同じものを注文
                  </PressButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
