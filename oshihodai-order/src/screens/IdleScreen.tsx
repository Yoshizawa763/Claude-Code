import { PressButton } from '../components/PressButton'
import { useApp } from '../store/AppStore'
import { sfxStart } from '../lib/audio'
import { haptic } from '../lib/haptics'
import { yen } from '../lib/format'

export function IdleScreen({ onStart }: { onStart: () => void }) {
  const { totals } = useApp()
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-brand-950 px-6 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-500/25 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="text-7xl sm:text-8xl">🍻</div>
        <h1 className="mt-4 text-3xl font-black tracking-wide sm:text-4xl">押し放題酒場</h1>
        <p className="mt-2 text-sm font-bold text-white/60">タッチパネルでご注文いただけます</p>

        <PressButton
          sound="none"
          haptics="none"
          onClick={() => {
            sfxStart()
            haptic.heavy()
            onStart()
          }}
          className="mt-10 flex h-40 w-72 flex-col items-center justify-center rounded-[2rem] bg-accent-400 text-brand-950 shadow-2xl shadow-accent-500/40 animate-pulse-ring sm:h-48 sm:w-96"
        >
          <span className="text-3xl font-black sm:text-4xl">ご注文はこちら</span>
          <span className="mt-2 text-sm font-bold opacity-70">画面をタッチしてください</span>
        </PressButton>

        {totals.totalItems > 0 && (
          <div className="mt-8 rounded-2xl bg-white/10 px-5 py-3 text-xs font-bold text-white/80">
            本日の累計：{totals.totalItems.toLocaleString()}点 ／ {yen(totals.totalYen)}
          </div>
        )}
      </div>
    </div>
  )
}
