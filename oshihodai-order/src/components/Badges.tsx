import type { ItemBadge } from '../types'

const STYLE: Record<ItemBadge, { label: string; cls: string }> = {
  popular: { label: '人気', cls: 'bg-d-orange text-d-text' },
  limited: { label: '期間限定', cls: 'bg-d-red text-d-text' },
  new: { label: 'NEW', cls: 'bg-d-yellow text-d-ink' },
}

export function ItemBadges({ badges, rank, size = 'sm' }: { badges?: ItemBadge[]; rank?: number; size?: 'sm' | 'md' }) {
  if (!badges?.length && rank === undefined) return null
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
  return (
    <div className="flex flex-wrap gap-1">
      {rank !== undefined && (
        <span className={`rounded bg-d-yellow font-bold text-d-ink ${pad}`}>おすすめ{rank}位</span>
      )}
      {badges?.map((b) => (
        <span key={b} className={`rounded font-bold ${STYLE[b].cls} ${pad}`}>
          {STYLE[b].label}
        </span>
      ))}
    </div>
  )
}
