/**
 * 画面演出の簡易イベントバス。
 * 「カードがカートへ飛ぶ」「紙吹雪」などを、どのコンポーネントからでも発火できる。
 */

export interface FlyEvent {
  type: 'fly'
  emoji: string
  /** 写真がある商品は写真を飛ばす */
  image?: string
  from: DOMRect
}
export interface ConfettiEvent {
  type: 'confetti'
  /** 強さ 1〜3 */
  power?: number
}
export interface BurstEvent {
  type: 'burst'
  x: number
  y: number
  text: string
  color?: string
}
export type FxEvent = FlyEvent | ConfettiEvent | BurstEvent

type Listener = (e: FxEvent) => void
const listeners = new Set<Listener>()

export function onFx(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emitFx(e: FxEvent) {
  listeners.forEach((l) => l(e))
}

/** カートアイコンの位置を登録しておく（飛ばし先） */
let cartTarget: HTMLElement | null = null
export function setCartTarget(el: HTMLElement | null) {
  cartTarget = el
}
export function getCartTargetRect(): DOMRect | null {
  if (!cartTarget) return null
  return cartTarget.getBoundingClientRect()
}
