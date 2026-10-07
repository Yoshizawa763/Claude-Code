import { useState } from 'react'
import { PHOTOS } from '../data/photos'
import { Modal } from './Modal'
import { PressButton } from './PressButton'

/** 写真の作者・ライセンス・出典の一覧（自由ライセンス写真の表示義務を満たすため） */
export function PhotoCreditsButton() {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(PHOTOS)
  if (entries.length === 0) return null

  return (
    <>
      <PressButton sound="tap" onClick={() => setOpen(true)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-stone-600 shadow-sm ring-1 ring-black/5">
        📷 写真クレジット（{entries.length}点）
      </PressButton>
      <Modal open={open} onClose={() => setOpen(false)} className="flex w-full max-w-lg flex-col" zIndex={130}>
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
          <h2 className="text-base font-black">📷 写真クレジット</h2>
          <PressButton sound="tap" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 font-black" aria-label="閉じる">
            ✕
          </PressButton>
        </div>
        <ul className="max-h-[70dvh] divide-y divide-stone-100 overflow-y-auto px-5 py-2 text-xs select-text">
          {entries.map(([name, p]) => (
            <li key={name} className="py-2">
              <div className="font-black text-stone-800">{name}</div>
              <div className="text-stone-500">
                {p.author} ／ {p.license} ／{' '}
                <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">
                  出典
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
