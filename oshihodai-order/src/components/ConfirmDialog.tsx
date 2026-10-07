import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { PressButton } from './PressButton'

interface Props {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'はい', cancelLabel = 'いいえ', onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} className="w-full max-w-md" zIndex={120}>
      <div className="p-6">
        <h3 className="text-center text-xl font-black">{title}</h3>
        {children && <div className="mt-3 text-sm text-stone-600">{children}</div>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <PressButton sound="cancel" onClick={onCancel} className="h-14 rounded-2xl bg-stone-100 text-base font-black text-stone-700">
            {cancelLabel}
          </PressButton>
          <PressButton sound="click" haptics="medium" onClick={onConfirm} className="h-14 rounded-2xl bg-brand-600 text-base font-black text-white shadow-lg shadow-brand-600/40">
            {confirmLabel}
          </PressButton>
        </div>
      </div>
    </Modal>
  )
}
