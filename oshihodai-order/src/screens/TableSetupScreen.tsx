import { useState } from 'react'
import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import type { TableInfo } from '../types'

export function TableSetupScreen({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useApp()
  const [tableNo, setTableNo] = useState(state.table?.tableNo ?? '')
  const [guests, setGuests] = useState(state.table?.guests ?? 2)

  const key = (k: string) => (
    <PressButton
      key={k}
      sound="tap"
      onClick={() => {
        if (k === 'C') setTableNo('')
        else if (k === '⌫') setTableNo((t) => t.slice(0, -1))
        else setTableNo((t) => (t.length >= 3 ? t : t + k))
      }}
      className={`h-14 rounded-2xl text-xl font-black sm:h-16 ${k === 'C' || k === '⌫' ? 'bg-stone-200 text-stone-600' : 'bg-white text-brand-900 shadow-sm ring-1 ring-black/5'}`}
    >
      {k}
    </PressButton>
  )

  const submit = () => {
    const info: TableInfo = { tableNo: tableNo || '1', guests }
    dispatch({ type: 'SET_TABLE', table: info })
    onDone()
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-brand-50">
      <div className="m-auto flex w-full flex-col items-center px-4 py-6">
      <h1 className="text-2xl font-black text-brand-950">卓番号・人数を入力してください</h1>
      <p className="mt-1 text-xs font-bold text-stone-500">（形式だけです。どう入れても進めます）</p>

      <div className="mt-6 grid w-full max-w-3xl gap-6 md:grid-cols-2">
        <section className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
          <div className="text-sm font-black text-stone-600">卓番号</div>
          <div className="mt-2 flex h-16 items-center justify-center rounded-2xl bg-brand-950 font-mono text-4xl font-black tabular-nums text-accent-300">
            {tableNo || <span className="text-white/30">—</span>}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(key)}
          </div>
        </section>

        <section className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
          <div className="text-sm font-black text-stone-600">人数</div>
          <div className="mt-2 flex h-16 items-center justify-center rounded-2xl bg-brand-950 font-mono text-4xl font-black tabular-nums text-accent-300">
            {guests}
            <span className="ml-1 text-base text-white/60">名様</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <PressButton
                key={n}
                sound="tap"
                onClick={() => setGuests(n)}
                className={`h-12 rounded-2xl text-lg font-black sm:h-14 ${guests === n ? 'bg-brand-600 text-white' : 'bg-white text-brand-900 shadow-sm ring-1 ring-black/5'}`}
              >
                {n}
              </PressButton>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <PressButton sound="tap" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-12 rounded-2xl bg-stone-200 text-xl font-black text-stone-700">
              −
            </PressButton>
            <PressButton sound="tap" onClick={() => setGuests((g) => Math.min(99, g + 1))} className="h-12 rounded-2xl bg-stone-200 text-xl font-black text-stone-700">
              ＋
            </PressButton>
          </div>
        </section>
      </div>

      <PressButton
        sound="click"
        haptics="medium"
        onClick={submit}
        className="mt-6 h-16 w-full max-w-md rounded-2xl bg-accent-400 text-xl font-black text-brand-950 shadow-lg shadow-accent-500/40"
      >
        決定してメニューへ
      </PressButton>
      </div>
    </div>
  )
}
