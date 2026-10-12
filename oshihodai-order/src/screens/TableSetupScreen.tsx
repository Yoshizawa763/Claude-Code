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
      className={`h-14 rounded-2xl text-xl font-bold sm:h-16 ${k === 'C' || k === '⌫' ? 'bg-d-raised text-d-sub' : 'bg-d-raised text-d-text'}`}
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
    <div className="flex h-full flex-col overflow-y-auto bg-d-bg">
      <div className="m-auto flex w-full flex-col items-center px-4 py-6">
      <h1 className="text-2xl font-bold text-d-text">卓番号・人数を入力してください</h1>
      <p className="mt-1 text-xs font-bold text-d-sub">（形式だけです。どう入れても進めます）</p>

      <div className="mt-6 grid w-full max-w-3xl gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-d-surface p-4">
          <div className="text-sm font-bold text-d-sub">卓番号</div>
          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-d-bg text-4xl font-bold tabular-nums text-d-yellow">
            {tableNo || <span className="text-d-muted">—</span>}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(key)}
          </div>
        </section>

        <section className="rounded-2xl bg-d-surface p-4">
          <div className="text-sm font-bold text-d-sub">人数</div>
          <div className="mt-2 flex h-16 items-center justify-center rounded-xl bg-d-bg text-4xl font-bold tabular-nums text-d-yellow">
            {guests}
            <span className="ml-1 text-base text-d-sub">名様</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <PressButton
                key={n}
                sound="tap"
                onClick={() => setGuests(n)}
                className={`h-12 rounded-2xl text-lg font-bold sm:h-14 ${guests === n ? 'bg-d-yellow text-d-ink' : 'bg-d-raised text-d-text'}`}
              >
                {n}
              </PressButton>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <PressButton sound="tap" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-12 rounded-2xl bg-d-raised text-xl font-bold text-d-text">
              −
            </PressButton>
            <PressButton sound="tap" onClick={() => setGuests((g) => Math.min(99, g + 1))} className="h-12 rounded-2xl bg-d-raised text-xl font-bold text-d-text">
              ＋
            </PressButton>
          </div>
        </section>
      </div>

      <PressButton
        sound="click"
        haptics="medium"
        onClick={submit}
        className="mt-6 h-16 w-full max-w-md rounded-xl bg-cta text-xl font-bold text-d-text"
      >
        決定してメニューへ
      </PressButton>
      </div>
    </div>
  )
}
