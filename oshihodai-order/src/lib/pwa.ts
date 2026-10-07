/**
 * ホーム画面アプリ（PWA）対応。
 * - 本番ビルドのときだけ Service Worker を登録し、オフラインでも起動できるようにする
 * - Android Chrome の「インストール」プロンプトを捕まえて、好きなタイミングで出せるようにする
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export function initPwa() {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notify()
  })

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* 登録できなくてもアプリはそのまま動く */
      })
    })
  }
}

export function subscribeInstall(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** すでにホーム画面アプリとして起動しているか */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/** iPhone / iPad（iPadOS はデスクトップ扱いの UA になるのでタッチ点数でも判定） */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null
}

/** Android 等でネイティブのインストールダイアログを出す */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  const p = deferredPrompt
  deferredPrompt = null
  notify()
  await p.prompt()
  const choice = await p.userChoice
  return choice.outcome === 'accepted'
}
