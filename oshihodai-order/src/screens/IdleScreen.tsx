import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import { sfxStart } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { yen } from '../lib/format'
import { InstallButton } from '../components/InstallButton'

export function IdleScreen({ onStart }: { onStart: () => void }) {
  const { totals } = useApp()
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-d-bg px-6 text-d-text">

      <div className="relative flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">押し放題酒場</h1>
        <p className="mt-2 text-sm text-d-sub">スマートフォン・タブレットでご注文いただけます</p>

        <PressButton
          sound="none"
          haptics="none"
          onClick={() => {
            sfxStart()
            haptic.heavy()
            onStart()
          }}
          className="mt-10 flex h-36 w-72 flex-col items-center justify-center rounded-xl bg-cta text-d-text sm:h-44 sm:w-96"
        >
          <span className="text-3xl font-bold sm:text-4xl">ご注文はこちら</span>
          <span className="mt-2 text-sm opacity-80">画面をタッチしてください</span>
        </PressButton>

        {totals.totalItems > 0 && (
          <div className="mt-8 rounded-2xl bg-d-raised px-5 py-3 text-xs font-bold text-d-sub">
            本日の累計：{totals.totalItems.toLocaleString()}点 ／ {yen(totals.totalYen)}
          </div>
        )}

        <div className="mt-6">
          <InstallButton />
        </div>
      </div>
    </div>
  )
}
