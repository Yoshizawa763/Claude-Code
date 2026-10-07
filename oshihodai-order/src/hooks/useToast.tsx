import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { uid } from '../lib/format'

export interface Toast {
  id: string
  title: string
  body?: string
  emoji?: string
  kind?: 'info' | 'badge' | 'success'
}

interface ToastCtx {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>, ttl?: number) => void
  dismiss: (id: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (t: Omit<Toast, 'id'>, ttl = 3200) => {
      const id = uid('toast')
      setToasts((ts) => [...ts.slice(-3), { ...t, id }])
      window.setTimeout(() => dismiss(id), ttl)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useToast(): ToastCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used inside ToastProvider')
  return c
}
