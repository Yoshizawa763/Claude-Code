import { memo, useRef } from 'react'
import type { MenuItem } from '../types'
import { yen } from '../lib/format'
import { PressButton } from './PressButton'
import { ItemBadges } from './Badges'
import { ItemImage } from './ItemImage'

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
      className={`group relative flex flex-col ${soldOut ? 'opacity-50 grayscale' : ''}`}
    >
      <PressButton
        sound="tap"
        haptics="light"
        onClick={() => onOpen(item)}
        className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl ${item.gradient}`}
        aria-label={`${item.name}の詳細`}
      >
        <ItemImage
          ref={emojiRef}
          name={item.name}
          emoji={item.emoji}
          gradient={item.gradient}
          emojiClassName="text-5xl transition-transform group-active:scale-90 sm:text-6xl"
          className="absolute inset-0"
        />
        <div className="absolute left-2 top-2">
          <ItemBadges badges={item.badges} rank={item.rank} />
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-lg bg-d-surface px-3 py-1 text-sm font-bold text-d-text">売り切れ</span>
          </div>
        )}
        {luxury && !soldOut && (
          <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-d-yellow">豪華</div>
        )}
      </PressButton>

      <div className="flex flex-1 flex-col gap-0.5 px-0.5 pt-1.5">
        <div className="line-clamp-2 text-sm font-bold leading-tight text-d-text">{item.name}</div>
        <div className="line-clamp-1 text-[11px] text-d-sub">{item.description}</div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className={`text-base font-bold tabular-nums ${luxury ? 'text-d-yellow' : 'text-d-text'}`}>{yen(item.price)}</div>
          <PressButton
            sound="none"
            haptics="none"
            disabled={soldOut}
            onClick={(e) => {
              e.stopPropagation()
              const rect = emojiRef.current?.getBoundingClientRect() ?? (e.currentTarget as HTMLElement).getBoundingClientRect()
              onQuickAdd(item, rect)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-xl font-bold text-d-text"
            aria-label={`${item.name}をカートに追加`}
          >
            ＋
          </PressButton>
        </div>
      </div>
    </div>
  )
})
