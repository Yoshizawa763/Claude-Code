import { useCombo } from '../hooks/useCombo'

export function ComboIndicator() {
  const { count } = useCombo()
  if (count < 3) return null
  const level = count >= 30 ? 3 : count >= 15 ? 2 : count >= 8 ? 1 : 0
  const label = ['COMBO', 'GREAT', 'AMAZING', 'LEGENDARY'][level]
  const color = ['text-d-yellow', 'text-d-orange', 'text-d-red', 'text-d-yellow'][level]
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[170] flex justify-center">
      <div key={count} className={`animate-combo select-none text-center drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] ${color}`}>
        <div className="text-5xl font-bold leading-none tracking-tighter sm:text-6xl">
          ×{count}
        </div>
        <div className="mt-1 text-sm font-bold tracking-[0.3em] text-d-text [text-shadow:0_2px_0_rgba(0,0,0,.4)]">{label}!</div>
      </div>
    </div>
  )
}
