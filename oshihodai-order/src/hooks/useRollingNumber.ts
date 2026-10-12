import { useEffect, useRef, useState } from 'react'

/**
 * 数値が変わったとき、前の値から新しい値へ「転がって」増える表示用の値を返す。
 */
export function useRollingNumber(target: number, duration = 700): { value: number; rolling: boolean } {
  const [value, setValue] = useState(target)
  const [rolling, setRolling] = useState(false)
  const from = useRef(target)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (from.current === target) return
    const start = performance.now()
    const startVal = from.current
    const delta = target - startVal
    setRolling(true)
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = startVal + delta * eased
      setValue(t >= 1 ? target : v)
      if (t < 1) {
        raf.current = requestAnimationFrame(step)
      } else {
        from.current = target
        setRolling(false)
      }
    }
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      from.current = target
    }
  }, [target, duration])

  return { value, rolling }
}
