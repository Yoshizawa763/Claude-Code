import { useEffect, useState } from 'react'
import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import { emitFx } from '../lib/fx'
import { sfxOrderComplete } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { yen } from '../lib/format'

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
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-brand-950 px-6 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,245,43,0.25),transparent_60%)]" />
      <div className="relative animate-zoom-big">
        <div className="text-7xl sm:text-8xl">🎉</div>
        <h1 className="mt-3 text-4xl font-black tracking-wide sm:text-6xl">ご注文を承りました</h1>
        <p className="mt-2 text-sm font-bold text-white/60">（送信はされていません。安心して次を押してください）</p>
      </div>

      {order && (
        <div className="relative mt-8 w-full max-w-md rounded-3xl bg-white/10 p-5 text-left animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-bold text-white/60">伝票 No.{order.ticketNo}</div>
            <div className="text-xs font-bold text-white/60">{order.itemCount}点</div>
          </div>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm font-bold">
            {order.lines.map((l) => (
              <li key={l.lineId} className="flex justify-between gap-2">
                <span className="truncate">
                  {l.emoji} {l.name}
                </span>
                <span className="shrink-0 tabular-nums">×{l.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-sm font-black">合計</span>
            <span className="font-mono text-3xl font-black tabular-nums text-accent-300">{yen(order.total)}</span>
          </div>
        </div>
      )}

      <PressButton sound="click" haptics="medium" onClick={onBack} className="relative mt-8 h-16 w-full max-w-md rounded-2xl bg-accent-400 text-xl font-black text-brand-950 shadow-lg shadow-accent-500/40">
        メニューに戻る（{left}）
      </PressButton>
    </div>
  )
}
