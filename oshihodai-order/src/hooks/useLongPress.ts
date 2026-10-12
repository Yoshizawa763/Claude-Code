import { useCallback, useEffect, useRef } from 'react'

interface Options {
  /** 1回目の発火（タップ時） */
  onTrigger: (step: number, tick: number) => void
  /** 連打開始までの待ち時間 */
  initialDelay?: number
  /** 最小間隔 */
  minInterval?: number
}

/**
 * 長押しで加速しながら連続発火するハンドラ群を返す。
 * tick が増えるほど間隔が短くなり、ステップ幅も大きくなる。
 */
export function useLongPress({ onTrigger, initialDelay = 380, minInterval = 45 }: Options) {
  const timer = useRef<number | null>(null)
  const tick = useRef(0)
  const active = useRef(false)

  const stop = useCallback(() => {
    active.current = false
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    tick.current = 0
  }, [])

  const stepFor = (t: number) => (t < 25 ? 1 : t < 50 ? 5 : t < 90 ? 10 : 50)

  const onTriggerRef = useRef(onTrigger)
  useEffect(() => {
    onTriggerRef.current = onTrigger
  }, [onTrigger])

  const loop = useCallback(
    (interval: number) => {
      const run = (iv: number) => {
        timer.current = window.setTimeout(() => {
          if (!active.current) return
          tick.current += 1
          onTriggerRef.current(stepFor(tick.current), tick.current)
          run(Math.max(minInterval, iv * 0.86))
        }, iv)
      }
      run(interval)
    },
    [minInterval],
  )

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      stop()
      active.current = true
      tick.current = 0
      onTriggerRef.current(1, 0)
      loop(initialDelay)
    },
    [initialDelay, loop, stop],
  )

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
