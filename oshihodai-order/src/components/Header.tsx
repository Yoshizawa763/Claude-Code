import { useEffect, useRef, useState } from 'react'
import { PressButton } from './PressButton'
import { RollingCounter } from './RollingCounter'
import { useApp } from '../store/AppStore'
import { yen } from '../lib/format'
import { setCartTarget } from '../lib/fx'
import { isMuted, setMuted } from '../lib/audio'
import type { Screen } from '../types'
import { Icon, type IconName } from './Icon'

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

  const nav = (s: Screen, label: string, icon: IconName) => (
    <PressButton
      sound="tap"
      onClick={() => onNavigate(s)}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold sm:text-sm ${
        screen === s ? 'bg-d-yellow text-d-ink' : 'bg-d-raised text-d-text'
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </PressButton>
  )

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-2 border-b border-d-line bg-d-surface px-3 text-d-text sm:h-16 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-sm font-bold tracking-wide">押し放題酒場</div>
          <div className="hidden truncate text-[10px] text-d-sub md:block">
            {state.table ? `${state.table.tableNo}番卓 ・ ${state.table.guests}名様` : '—'}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1.5">
        {nav('menu', 'メニュー', 'menu')}
        {nav('history', '履歴', 'history')}
        {nav('bill', '伝票', 'bill')}
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
        className="hidden rounded-full bg-d-raised p-2 text-d-text sm:block"
        aria-label="効果音の切り替え"
      >
        <Icon name={muted ? 'mute' : 'sound'} className="h-4 w-4" />
      </PressButton>

      <PressButton
        ref={cartRef}
        sound="tap"
        onClick={onOpenCart}
        className="relative flex items-center gap-1.5 rounded-full bg-d-yellow px-3 py-2 text-d-ink lg:pointer-events-none lg:bg-d-raised lg:text-d-text"
        aria-label="カートを開く"
      >
        <span key={bounce} className={`inline-flex ${bounce > 0 ? 'animate-cart-bounce' : ''}`}><Icon name="cart" /></span>
        <span className="text-sm font-bold tabular-nums">{cart.count}</span>
        {cart.count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-d-red px-1 text-[10px] font-bold text-d-text ring-2 ring-d-surface">
            {cart.count > 99 ? '99+' : cart.count}
          </span>
        )}
      </PressButton>
    </header>
  )
}
