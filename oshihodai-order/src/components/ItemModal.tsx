import { useMemo, useRef, useState } from 'react'
import type { MenuItem } from '../types'
import { OPTION_GROUPS } from '../data/options'
import { yen } from '../lib/format'
import { sfxTap } from '../lib/audio'
import { Modal } from './Modal'
import { PressButton } from './PressButton'
import { QuantityStepper } from './QuantityStepper'
import { ItemBadges } from './Badges'
import { ItemImage } from './ItemImage'
import { defaultSelections, selectionsToOptions, type SelectedOptions } from '../hooks/useAddToCart'

interface Props {
  item: MenuItem | null
  soldOut: boolean
  onClose: () => void
  onAdd: (item: MenuItem, quantity: number, options: SelectedOptions, from?: DOMRect) => void
}

export function ItemModal({ item, soldOut, onClose, onAdd }: Props) {
  return (
    <Modal open={item !== null} onClose={onClose} sheet className="sm:max-w-2xl">
      {item && <Body key={item.id} item={item} soldOut={soldOut} onClose={onClose} onAdd={onAdd} />}
    </Modal>
  )
}

function Body({ item, soldOut, onClose, onAdd }: Props & { item: MenuItem }) {
  const [qty, setQty] = useState(1)
  const [sel, setSel] = useState<Record<string, string[]>>(() => defaultSelections(item))
  const emojiRef = useRef<HTMLDivElement>(null)
  const luxury = item.category === 'luxury'

  const options = useMemo(() => selectionsToOptions(item, sel), [item, sel])
  const unit = item.price + options.reduce((s, o) => s + o.priceDelta, 0)
  const total = unit * qty

  const toggle = (gid: string, cid: string, multiple: boolean) => {
    sfxTap()
    setSel((s) => {
      const cur = s[gid] ?? []
      if (multiple) {
        return { ...s, [gid]: cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid] }
      }
      return { ...s, [gid]: [cid] }
    })
  }

  return (
    <div className="flex max-h-[92dvh] flex-col">
      <div className="relative">
        <ItemImage
          ref={emojiRef}
          name={item.name}
          emoji={item.emoji}
          gradient={item.gradient}
          emojiClassName="text-7xl sm:text-8xl"
          className="relative h-48 max-h-[34dvh] sm:h-64"
        />
        <div className="absolute left-3 top-3">
          <ItemBadges badges={item.badges} rank={item.rank} size="md" />
        </div>
        <PressButton
          sound="cancel"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-lg font-black text-white"
          aria-label="閉じる"
        >
          ✕
        </PressButton>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="rounded-xl bg-white px-5 py-2 text-xl font-black text-stone-700">本日は売り切れです</span>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black leading-tight sm:text-2xl">{item.name}</h2>
          <div className={`shrink-0 text-2xl font-black tabular-nums ${luxury ? 'text-amber-600' : 'text-brand-800'}`}>{yen(item.price)}</div>
        </div>
        <p className="mt-1 text-sm text-stone-600">{item.description}</p>

        {(item.options ?? []).map((gid) => {
          const g = OPTION_GROUPS[gid]
          const cur = sel[gid] ?? []
          return (
            <div key={gid} className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black">
                {g.label}
                <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">{g.multiple ? '複数選択可' : '1つ選択'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.choices.map((c) => {
                  const on = cur.includes(c.id)
                  return (
                    <PressButton
                      key={c.id}
                      sound="none"
                      onClick={() => toggle(gid, c.id, g.multiple)}
                      className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                        on ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      {c.label}
                      {c.priceDelta > 0 && <span className={`ml-1 text-xs ${on ? 'text-accent-300' : 'text-stone-400'}`}>+{c.priceDelta}</span>}
                    </PressButton>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="safe-bottom flex flex-col gap-3 border-t border-stone-100 bg-stone-50 px-5 pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-4 sm:justify-start">
          <div className="text-xs font-bold text-stone-500">数量</div>
          <QuantityStepper value={qty} onChange={setQty} />
        </div>
        <div className="flex-1" />
        <PressButton
          sound="none"
          haptics="none"
          disabled={soldOut}
          onClick={() => {
            onAdd(item, qty, options, emojiRef.current?.getBoundingClientRect())
            onClose()
          }}
          className={`flex h-14 items-center justify-between gap-3 rounded-2xl px-5 text-white shadow-lg ${
            luxury ? 'bg-amber-500 shadow-amber-500/40' : 'bg-brand-600 shadow-brand-600/40'
          } sm:min-w-64`}
        >
          <span className="text-base font-black">🛒 カートに入れる</span>
          <span className="font-mono text-lg font-black tabular-nums">{yen(total)}</span>
        </PressButton>
      </div>
    </div>
  )
}
