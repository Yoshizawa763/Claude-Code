import { useEffect, useState } from 'react'
import { PressButton } from './PressButton'
import { Modal } from './Modal'
import { canPromptInstall, isIos, isStandalone, promptInstall, subscribeInstall } from '../lib/pwa'

/**
 * 待機画面に出す「ホーム画面に追加」ボタン。
 * - Android Chrome: ネイティブのインストールダイアログを表示
 * - iPhone / iPad やその他: 手順を案内するダイアログを表示
 * - すでにホーム画面から起動している場合は出さない
 */
export function InstallButton() {
  const [, force] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => subscribeInstall(() => force((n) => n + 1)), [])

  if (isStandalone()) return null

  const ios = isIos()

  const onClick = async () => {
    if (canPromptInstall()) {
      await promptInstall()
      return
    }
    setGuideOpen(true)
  }

  return (
    <>
      <PressButton
        sound="tap"
        onClick={onClick}
        className="flex items-center gap-2 rounded-2xl bg-d-raised px-4 py-2.5 text-sm font-bold text-d-text ring-1 ring-d-line"
      >
        <span className="text-lg">📲</span>
        ホーム画面に追加してアプリにする
      </PressButton>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} className="w-full max-w-md" zIndex={250}>
        <div className="p-6">
          <h2 className="text-center text-xl font-bold">ホーム画面に追加する方法</h2>
          {ios ? (
            <ol className="mt-4 space-y-3 text-sm font-bold text-d-text">
              <li className="flex gap-3">
                <Step n={1} />
                <span>
                  <b>Safari</b> で開いた状態で、画面下（iPad は右上）の<b>共有ボタン</b>
                  <span className="mx-1 inline-block rounded-md bg-d-raised px-1.5">⬆️</span>をタップ
                </span>
              </li>
              <li className="flex gap-3">
                <Step n={2} />
                <span>
                  メニューを下にスクロールして<b>「ホーム画面に追加」</b>をタップ
                </span>
              </li>
              <li className="flex gap-3">
                <Step n={3} />
                <span>
                  右上の<b>「追加」</b>をタップ。ホーム画面の 🍻 アイコンから起動できます
                </span>
              </li>
            </ol>
          ) : (
            <ol className="mt-4 space-y-3 text-sm font-bold text-d-text">
              <li className="flex gap-3">
                <Step n={1} />
                <span>
                  <b>Chrome</b> で開いた状態で、右上の<b>︙ メニュー</b>をタップ
                </span>
              </li>
              <li className="flex gap-3">
                <Step n={2} />
                <span>
                  <b>「ホーム画面に追加」</b>または<b>「アプリをインストール」</b>をタップ
                </span>
              </li>
              <li className="flex gap-3">
                <Step n={3} />
                <span>
                  <b>「インストール」</b>（または「追加」）をタップ。ホーム画面の 🍻 アイコンから起動できます
                </span>
              </li>
            </ol>
          )}
          <p className="mt-4 rounded-xl bg-d-raised px-3 py-2 text-xs font-bold text-d-yellow">
            一度開けば、電波がなくてもホーム画面から起動できます。注文はもちろん送信されません。
          </p>
          <PressButton sound="click" onClick={() => setGuideOpen(false)} className="mt-5 h-12 w-full rounded-xl bg-cta text-base font-bold text-d-text">
            わかった
          </PressButton>
        </div>
      </Modal>
    </>
  )
}

function Step({ n }: { n: number }) {
  return <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cta text-xs font-bold text-d-text">{n}</span>
}
