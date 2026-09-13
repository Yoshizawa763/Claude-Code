import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** 下からのシート型にする（モバイル向け） */
  sheet?: boolean
  className?: string
  zIndex?: number
}

export function Modal({ open, onClose, children, sheet = false, className = '', zIndex = 100 }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className={`fixed inset-0 flex ${sheet ? 'items-end sm:items-center' : 'items-center'} justify-center bg-black/55 p-0 backdrop-blur-[2px] animate-fade-in sm:p-4`}
      style={{ zIndex }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`${sheet ? 'w-full rounded-t-3xl sm:rounded-3xl animate-slide-up' : 'rounded-3xl animate-pop-in'} max-h-[92dvh] overflow-hidden bg-white shadow-2xl ${className}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
