import { useToast } from '../hooks/useToast'

export function Toasts() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[180] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl animate-slide-up ${
            t.kind === 'badge'
              ? 'shimmer-gold text-amber-950 ring-4 ring-amber-300/60'
              : t.kind === 'success'
                ? 'bg-accent-400 text-brand-950'
                : 'bg-brand-900 text-white'
          }`}
        >
          {t.emoji && <div className="text-3xl">{t.emoji}</div>}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black">{t.title}</div>
            {t.body && <div className="truncate text-xs opacity-80">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
