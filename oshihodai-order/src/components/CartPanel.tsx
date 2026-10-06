import { useApp, lineUnitPrice } from '../store/AppStore'
import { yen } from '../lib/format'
import { sfxCancel } from '../lib/audio'
import { PressButton } from './PressButton'
import { QuantityStepper } from './QuantityStepper'
import { ItemImage } from './ItemImage'

interface Props {
  onCheckout: () => void
  onClose?: () => void
}

export function CartPanel({ onCheckout, onClose }: Props) {
  const { state, cart, dispatch } = useApp()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-black">🛒 カート</h2>
          <span className="text-xs font-bold text-stone-500">{cart.count}点</span>
        </div>
        <div className="flex items-center gap-2">
          {state.cart.length > 0 && (
            <PressButton
              sound="cancel"
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="rounded-lg px-2 py-1 text-xs font-bold text-stone-500 hover:bg-stone-100"
            >
              全て削除
            </PressButton>
          )}
          {onClose && (
            <PressButton sound="tap" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 font-black" aria-label="閉じる">
              ✕
            </PressButton>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {state.cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center text-stone-400">
            <div className="text-5xl">🍽️</div>
            <div className="text-sm font-bold">カートは空です</div>
            <div className="text-xs">気になる料理をどんどん押してください</div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.cart.map((l) => (
              <li key={l.lineId} className="flex gap-2 rounded-xl border border-stone-100 p-2 animate-pop-in">
                <ItemImage name={l.name} emoji={l.emoji} gradient={l.gradient} emojiClassName="text-2xl" className="relative h-12 w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{l.name}</div>
                  {l.selectedOptions.length > 0 && (
                    <div className="truncate text-[11px] text-stone-500">{l.selectedOptions.map((o) => o.label).join('・')}</div>
                  )}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <QuantityStepper size="sm" value={l.quantity} onChange={(q) => dispatch({ type: 'SET_QTY', lineId: l.lineId, quantity: q })} min={0} />
                    <div className="text-sm font-black tabular-nums text-brand-800">{yen(lineUnitPrice(l) * l.quantity)}</div>
                  </div>
                </div>
                <PressButton
                  sound="none"
                  onClick={() => {
                    sfxCancel()
                    dispatch({ type: 'REMOVE_LINE', lineId: l.lineId })
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg text-stone-400 hover:bg-stone-100"
                  aria-label="削除"
                >
                  🗑️
                </PressButton>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="safe-bottom border-t border-stone-100 bg-stone-50 px-4 pt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-bold text-stone-500">小計（{cart.count}点）</span>
          <span key={cart.subtotal} className="animate-bump font-mono text-2xl font-black tabular-nums text-brand-900">
            {yen(cart.subtotal)}
          </span>
        </div>
        <PressButton
          sound="click"
          haptics="medium"
          disabled={state.cart.length === 0}
          onClick={onCheckout}
          className="h-14 w-full rounded-2xl bg-accent-400 text-lg font-black text-brand-950 shadow-lg shadow-accent-500/40"
        >
          注文を確定する
        </PressButton>
      </div>
    </div>
  )
}
