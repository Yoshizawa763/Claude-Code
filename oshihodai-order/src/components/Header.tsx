import { useEffect, useRef, useState } from 'react'
import { PressButton } from './PressButton'
import { RollingCounter } from './RollingCounter'
import { useApp } from '../store/AppStore'
import { yen } from '../lib/format'
import { setCartTarget } from '../lib/fx'
import { isMuted, setMuted } from '../lib/audio'
import type { Screen } from '../types'

interface Props {
  screen: Screen
  onNavigate: (s: Screen) => void
  onOpenCart: () => void
}

export function Header({ screen, onNavigate, onOpenCart }: Props) {
  const { state, totals, cart } = useApp()
  const cartRef = useRef<HTMLButtonElement>(null)
  const [muted, setMutedState] = useState(isMuted())
  const [bounce, setBounce] = useState(0)
  const prevCount = useRef(cart.count)

  useEffect(() => {
    setCartTarget(cartRef.current)
    return () => setCartTarget(null)
  }, [])

  useEffect(() => {
    if (cart.count > prevCount.current) setBounce((b) => b + 1)
    prevCount.current = cart.count
  }, [cart.count])

  const nav = (s: Screen, label: string, emoji: string) => (
    <PressButton
      sound="tap"
      onClick={() => onNavigate(s)}
      className={`rounded-xl px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm ${
        screen === s ? 'bg-accent-400 text-brand-950' : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      <span className="mr-1">{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
    </PressButton>
  )

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-2 bg-brand-950 px-3 text-white shadow-lg sm:h-16 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="text-2xl">🍻</div>
        <div className="hidden min-w-0 md:block">
          <div className="truncate text-sm font-black tracking-wide">押し放題酒場</div>
          <div className="truncate text-[10px] text-white/60">
            {state.table ? `${state.table.tableNo}番卓 ・ ${state.table.guests}名様` : '—'}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1.5">
        {nav('menu', 'メニュー', '📖')}
        {nav('history', '履歴', '🧾')}
        {nav('bill', '伝票', '💴')}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-5">
        <RollingCounter value={totals.totalItems} format={(n) => `${Math.round(n).toLocaleString()}点`} label="本日の注文点数" shortLabel="点数" />
        <RollingCounter value={totals.totalYen} format={yen} label="累計金額" shortLabel="累計" className="min-w-[72px] sm:min-w-[88px]" />
      </div>

      <PressButton
        sound="tap"
        haptics="none"
        onClick={() => {
          setMuted(!muted)
          setMutedState(!muted)
        }}
        className="hidden rounded-xl bg-white/10 px-2 py-1.5 text-base sm:block"
        aria-label="効果音の切り替え"
      >
        {muted ? '🔇' : '🔊'}
      </PressButton>

      <PressButton
        ref={cartRef}
        sound="tap"
        onClick={onOpenCart}
        className="relative flex items-center gap-1.5 rounded-xl bg-accent-400 px-3 py-2 text-brand-950 lg:pointer-events-none lg:bg-white/10 lg:text-white"
        aria-label="カートを開く"
      >
        <span key={bounce} className={`text-xl ${bounce > 0 ? 'animate-cart-bounce' : ''}`}>🛒</span>
        <span className="text-sm font-black tabular-nums">{cart.count}</span>
        {cart.count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-black text-white ring-2 ring-brand-950">
            {cart.count > 99 ? '99+' : cart.count}
          </span>
        )}
      </PressButton>
    </header>
  )
}
