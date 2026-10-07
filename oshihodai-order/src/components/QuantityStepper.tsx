import { useCallback } from 'react'
import { useLongPress } from '../hooks/useLongPress'
import { sfxMinus, sfxPlus, unlockAudio } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { useCombo } from '../hooks/useCombo'
import { PressButton } from './PressButton'

interface Props {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'lg'
}

/** ＋−ボタン。＋は長押しで加速する連続増加に対応。 */
export function QuantityStepper({ value, onChange, min = 1, max = 999, size = 'lg' }: Props) {
  const { hit } = useCombo()

  const inc = useCallback(
    (step: number, tick: number) => {
      unlockAudio()
      const combo = hit()
      sfxPlus(Math.min(24, Math.floor(tick / 2) + Math.floor(combo / 4)))
      haptic.light()
      onChange(Math.min(max, value + step))
    },
    [hit, max, onChange, value],
  )

  const plusHandlers = useLongPress({ onTrigger: inc })

  const dec = () => {
    sfxMinus()
    onChange(Math.max(min, value - 1))
  }

  const big = size === 'lg'
  const btn = big ? 'h-14 w-14 text-3xl rounded-2xl' : 'h-9 w-9 text-xl rounded-xl'

  return (
    <div className="flex items-center gap-2">
      <PressButton
        sound="none"
        haptics="none"
        onClick={dec}
        disabled={value <= min}
        className={`${btn} flex items-center justify-center bg-brand-100 font-black text-brand-800 active:bg-brand-200`}
        aria-label="減らす"
      >
        −
      </PressButton>
      <div className={`${big ? 'w-16 text-3xl' : 'w-10 text-lg'} text-center font-black tabular-nums`} key={value}>
        <span className="inline-block animate-bump">{value}</span>
      </div>
      <button
        type="button"
        {...plusHandlers}
        className={`${btn} pressable flex items-center justify-center bg-brand-600 font-black text-white shadow-md shadow-brand-600/30`}
        aria-label="増やす（長押しで連続）"
      >
        ＋
      </button>
    </div>
  )
}
