import { memo, useRef } from 'react'
import type { MenuItem } from '../types'
import { yen } from '../lib/format'
import { PressButton } from './PressButton'
import { ItemBadges } from './Badges'

interface Props {
  item: MenuItem
  soldOut: boolean
  onOpen: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem, from: DOMRect) => void
}

export const MenuCard = memo(function MenuCard({ item, soldOut, onOpen, onQuickAdd }: Props) {
  const emojiRef = useRef<HTMLDivElement>(null)
  const luxury = item.category === 'luxury'

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-transform ${
        soldOut ? 'opacity-50 grayscale' : ''
      } ${luxury ? 'ring-2 ring-amber-400/70 shadow-amber-200/60' : ''}`}
    >
      <PressButton
        sound="tap"
        haptics="light"
        onClick={() => onOpen(item)}
        className={`relative flex aspect-[4/3] w-full items-center justify-center ${item.gradient}`}
        aria-label={`${item.name}の詳細`}
      >
        <div ref={emojiRef} className="text-5xl drop-shadow-md transition-transform group-active:scale-90 sm:text-6xl">
          {item.emoji}
        </div>
        <div className="absolute left-2 top-2">
          <ItemBadges badges={item.badges} rank={item.rank} />
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-lg bg-white px-3 py-1 text-sm font-black text-stone-700">売り切れ</span>
          </div>
        )}
        {luxury && !soldOut && (
          <div className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-black text-amber-300">豪華</div>
        )}
      </PressButton>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="line-clamp-2 text-sm font-bold leading-tight">{item.name}</div>
        <div className="line-clamp-1 text-[11px] text-stone-500">{item.description}</div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className={`text-base font-black tabular-nums ${luxury ? 'text-amber-600' : 'text-brand-800'}`}>{yen(item.price)}</div>
          <PressButton
            sound="none"
            haptics="none"
            disabled={soldOut}
            onClick={(e) => {
              e.stopPropagation()
              const rect = emojiRef.current?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect()
              onQuickAdd(item, rect)
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-black text-white shadow-md ${
              luxury ? 'bg-amber-500 shadow-amber-500/40' : 'bg-brand-600 shadow-brand-600/30'
            }`}
            aria-label={`${item.name}をカートに追加`}
          >
            ＋
          </PressButton>
        </div>
      </div>
    </div>
  )
})
