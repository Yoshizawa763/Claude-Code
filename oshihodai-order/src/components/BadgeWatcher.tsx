import { useEffect } from 'react'
import { useApp } from '../store/AppStore'
import { useToast } from '../hooks/useToast'
import { sfxBadge } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { emitFx } from '../lib/fx'

/** バッジ解放キューを監視してトースト・音・紙吹雪を出す */
export function BadgeWatcher() {
  const { state, dispatch } = useApp()
  const { push } = useToast()
  const next = state.pendingBadges[0]

  useEffect(() => {
    if (!next) return
    const t = window.setTimeout(() => {
      sfxBadge()
      haptic.badge()
      emitFx({ type: 'confetti', power: 1 })
      push({ kind: 'badge', emoji: next.emoji, title: `称号解放：${next.name}`, body: next.description }, 4200)
      dispatch({ type: 'SHIFT_BADGE' })
    }, 900)
    return () => window.clearTimeout(t)
  }, [next, push, dispatch])

  return null
}
