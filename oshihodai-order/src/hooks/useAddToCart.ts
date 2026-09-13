import { useCallback } from 'react'
import type { CartLine, MenuItem } from '../types'
import { OPTION_GROUPS } from '../data/options'
import { useApp } from '../store/AppStore'
import { useCombo } from './useCombo'
import { emitFx } from '../lib/fx'
import { sfxCash, sfxPop, unlockAudio } from '../lib/audio'
import { haptic } from '../lib/haptics'

export type SelectedOptions = CartLine['selectedOptions']

/** 商品のデフォルトオプション（単一選択は先頭、複数選択はなし） */
export function defaultSelections(item: MenuItem): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const gid of item.options ?? []) {
    const g = OPTION_GROUPS[gid]
    out[gid] = g.multiple ? [] : [g.choices[0].id]
  }
  return out
}

export function selectionsToOptions(item: MenuItem, sel: Record<string, string[]>): SelectedOptions {
  const out: SelectedOptions = []
  for (const gid of item.options ?? []) {
    const g = OPTION_GROUPS[gid]
    for (const cid of sel[gid] ?? []) {
      const c = g.choices.find((x) => x.id === cid)
      if (c) out.push({ groupLabel: g.label, label: c.label, priceDelta: c.priceDelta })
    }
  }
  return out
}

/**
 * カート投入の共通処理：state更新＋飛ぶ演出＋効果音＋振動＋コンボ加算。
 */
export function useAddToCart() {
  const { dispatch } = useApp()
  const { hit } = useCombo()

  return useCallback(
    (item: MenuItem, quantity: number, selectedOptions: SelectedOptions, from?: DOMRect) => {
      unlockAudio()
      dispatch({
        type: 'ADD_LINE',
        line: {
          itemId: item.id,
          name: item.name,
          emoji: item.emoji,
          gradient: item.gradient,
          unitPrice: item.price,
          quantity,
          selectedOptions,
        },
      })
      const combo = hit()
      const luxury = item.category === 'luxury'
      if (luxury) {
        sfxCash()
        haptic.heavy()
      } else {
        sfxPop()
        haptic.medium()
      }
      if (from) {
        emitFx({ type: 'fly', emoji: item.emoji, from })
        emitFx({
          type: 'burst',
          x: from.left + from.width / 2,
          y: from.top,
          text: `+${quantity}`,
          color: luxury ? '#d97706' : combo >= 8 ? '#ec4899' : '#6a3dff',
        })
      }
      if (luxury && quantity >= 10) emitFx({ type: 'confetti', power: 1 })
    },
    [dispatch, hit],
  )
}
