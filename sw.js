/* 押し放題酒場 Service Worker
 * ビルド時に vite.config.ts のプラグインがキャッシュ対象一覧とバージョンを埋め込む。
 * 同一オリジンのアプリ本体ファイルだけをキャッシュし、外部への通信は一切行わない。
 */
const VERSION = "db77d6279016"
const CACHE = 'oshihodai-' + VERSION
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./assets/index-Dr6agH8y.js",
  "./assets/index-9ntkQNsp.css"
]
// 写真はアプリ更新のたびに取り直さないよう、別のキャッシュに保存する
// 写真を差し替えたら末尾の番号を上げる（古い写真のキャッシュが消える）
const PHOTO_CACHE = 'oshihodai-photos-v4'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('oshihodai-') && k !== CACHE && k !== PHOTO_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // 画面遷移はキャッシュ済みの index.html を返す（オフラインでも起動できる）
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req)),
    )
    return
  }

  // メニュー写真は初回表示時に保存し、以後はオフラインでも表示する
  if (url.pathname.includes('/photos/')) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(PHOTO_CACHE).then((cache) => cache.put(req, copy))
            }
            return res
          }),
      ),
    )
    return
  }

  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)))
})
