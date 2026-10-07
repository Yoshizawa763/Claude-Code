import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/** public/ 配下でオフライン用にキャッシュするファイル */
const PUBLIC_PRECACHE = [
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
]

/**
 * ビルド成果物の一覧から sw.js を生成する小さなプラグイン。
 * 追加の依存パッケージなしでオフライン起動（ホーム画面アプリ）に対応する。
 */
function serviceWorker(): Plugin {
  return {
    name: 'oshihodai-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = ['./', 'index.html', ...PUBLIC_PRECACHE, ...Object.keys(bundle).filter((f) => !f.endsWith('.map'))]
      const unique = [...new Set(files)].map((f) => (f === './' ? f : './' + f))
      const version = createHash('sha256').update(unique.join('\n')).digest('hex').slice(0, 12)
      const template = readFileSync(fileURLToPath(new URL('./sw-template.js', import.meta.url)), 'utf8')
      const source = template.replace("'__VERSION__'", JSON.stringify(version)).replace('= __PRECACHE__', '= ' + JSON.stringify(unique, null, 2))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // 相対パスで出力し、GitHub Pages のサブパスでもローカルでも動くようにする
  base: './',
  plugins: [react(), tailwindcss(), serviceWorker()],
})
