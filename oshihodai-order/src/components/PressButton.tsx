import { forwardRef, useCallback, useState, type ButtonHTMLAttributes, type PointerEvent } from 'react'
import { sfxCancel, sfxClick, sfxPop, sfxTap, unlockAudio } from '../lib/audio'
import { haptic } from '../lib/haptics'

export type PressSound = 'click' | 'tap' | 'pop' | 'cancel' | 'none'
export type PressHaptic = 'light' | 'medium' | 'heavy' | 'none'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  sound?: PressSound
  haptics?: PressHaptic
}

const SOUNDS: Record<PressSound, () => void> = {
  click: sfxClick,
  tap: sfxTap,
  pop: sfxPop,
  cancel: sfxCancel,
  none: () => {},
}

/**
 * すべてのボタンの土台。押した瞬間に縮む＋色が変わる＋音＋振動。
 */
export const PressButton = forwardRef<HTMLButtonElement, Props>(function PressButton(
  { sound = 'click', haptics = 'light', className = '', onPointerDown, onPointerUp, onPointerCancel, onPointerLeave, disabled, children, ...rest },
  ref,
) {
  const [pressed, setPressed] = useState(false)

  const down = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e)
      if (disabled) return
      unlockAudio()
      setPressed(true)
      SOUNDS[sound]()
      if (haptics !== 'none') haptic[haptics]()
    },
    [disabled, haptics, onPointerDown, sound],
  )
  const up = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      onPointerUp?.(e)
      setPressed(false)
    },
    [onPointerUp],
  )
  const cancel = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      onPointerCancel?.(e)
      setPressed(false)
    },
    [onPointerCancel],
  )
  const leave = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(e)
      setPressed(false)
    },
    [onPointerLeave],
  )

  return (
    <button
      ref={ref}
      type="button"
      data-pressed={pressed}
      disabled={disabled}
      className={`pressable select-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={cancel}
      onPointerLeave={leave}
      {...rest}
    >
      {children}
    </button>
  )
})
