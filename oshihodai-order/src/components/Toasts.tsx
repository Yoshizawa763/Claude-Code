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
              ? 'bg-d-yellow text-d-ink'
              : t.kind === 'success'
                ? 'bg-d-yellow text-d-ink'
                : 'bg-d-surface text-d-text'
          }`}
        >
          {t.emoji && <div className="text-3xl">{t.emoji}</div>}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{t.title}</div>
            {t.body && <div className="truncate text-xs opacity-80">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
