import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sfxCombo } from '../lib/audio'
import { haptic } from '../lib/haptics'

interface ComboCtx {
  count: number
  /** コンボを1つ進める（連続タップ判定） */
  hit: () => number
}

const Ctx = createContext<ComboCtx | null>(null)
const WINDOW_MS = 1400

export function ComboProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const timer = useRef<number | null>(null)

  const hit = useCallback(() => {
    const next = countRef.current + 1
    countRef.current = next
    setCount(next)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      countRef.current = 0
      setCount(0)
    }, WINDOW_MS)
    if (next >= 3 && next % 5 === 0) {
      sfxCombo(next / 5)
      haptic.medium()
    }
    return next
  }, [])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const value = useMemo(() => ({ count, hit }), [count, hit])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCombo(): ComboCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCombo must be used inside ComboProvider')
  return c
}
