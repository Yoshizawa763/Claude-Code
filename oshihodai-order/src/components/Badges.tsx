import type { ItemBadge } from '../types'

const STYLE: Record<ItemBadge, { label: string; cls: string }> = {
  popular: { label: '人気', cls: 'bg-pink-500 text-white' },
  limited: { label: '期間限定', cls: 'bg-orange-500 text-white' },
  new: { label: 'NEW', cls: 'bg-accent-400 text-brand-950' },
}

export function ItemBadges({ badges, rank, size = 'sm' }: { badges?: ItemBadge[]; rank?: number; size?: 'sm' | 'md' }) {
  if (!badges?.length && rank === undefined) return null
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
  return (
    <div className="flex flex-wrap gap-1">
      {rank !== undefined && (
        <span className={`rounded-md bg-amber-400 font-black text-amber-950 ${pad}`}>👑 おすすめ{rank}位</span>
      )}
      {badges?.map((b) => (
        <span key={b} className={`rounded-md font-black ${STYLE[b].cls} ${pad}`}>
          {STYLE[b].label}
        </span>
      ))}
    </div>
  )
}
