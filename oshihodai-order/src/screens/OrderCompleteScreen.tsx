import { useEffect, useState } from 'react'
import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import { emitFx } from '../lib/fx'
import { sfxOrderComplete } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { yen } from '../lib/format'
import { Icon } from '../components/Icon'

const AUTO_RETURN_SEC = 8

export function OrderCompleteScreen({ onBack }: { onBack: () => void }) {
  const { state } = useApp()
  const order = state.orders[state.orders.length - 1]
  const [left, setLeft] = useState(AUTO_RETURN_SEC)

  useEffect(() => {
    sfxOrderComplete()
    haptic.success()
    const power = order && order.total >= 100_000 ? 3 : order && order.total >= 10_000 ? 2 : 1
    emitFx({ type: 'confetti', power })
    const t2 = window.setTimeout(() => emitFx({ type: 'confetti', power }), 600)
    return () => window.clearTimeout(t2)
  }, [order])

  useEffect(() => {
    const iv = window.setInterval(() => setLeft((l) => l - 1), 1000)
    return () => window.clearInterval(iv)
  }, [])
  useEffect(() => {
    if (left <= 0) onBack()
  }, [left, onBack])

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-d-bg px-6 text-center text-d-text">
      <div className="relative animate-zoom-big">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cta text-d-text"><Icon name="check" className="h-10 w-10" /></div>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">ご注文を承りました</h1>
        <p className="mt-2 text-sm font-bold text-d-sub">（送信はされていません。安心して次を押してください）</p>
      </div>

      {order && (
        <div className="relative mt-8 w-full max-w-md rounded-2xl bg-d-surface p-5 text-left animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-bold text-d-sub">伝票 No.{order.ticketNo}</div>
            <div className="text-xs font-bold text-d-sub">{order.itemCount}点</div>
          </div>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm font-bold">
            {order.lines.map((l) => (
              <li key={l.lineId} className="flex justify-between gap-2">
                <span className="truncate">
                  {l.name}
                </span>
                <span className="shrink-0 tabular-nums">×{l.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-d-line pt-3">
            <span className="text-sm font-bold">合計</span>
            <span className="text-3xl font-bold tabular-nums text-d-yellow">{yen(order.total)}</span>
          </div>
        </div>
      )}

      <PressButton sound="click" haptics="medium" onClick={onBack} className="relative mt-8 h-16 w-full max-w-md rounded-xl bg-d-yellow text-xl font-bold text-d-ink ">
        メニューに戻る（{left}）
      </PressButton>
    </div>
  )
}
