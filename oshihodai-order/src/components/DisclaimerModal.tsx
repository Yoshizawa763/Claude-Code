import { Modal } from './Modal'
import { PressButton } from './PressButton'

export function DisclaimerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={() => {}} className="w-full max-w-md" zIndex={300}>
      <div className="p-6 text-center">
        <div className="text-5xl">🎮</div>
        <h2 className="mt-3 text-xl font-bold">これは練習用アプリです</h2>
        <p className="mt-2 text-sm font-bold text-d-sub">
          注文は送信されません。
          <br />
          いくら押しても料理は届かず、お金もかかりません。
        </p>
        <p className="mt-3 rounded-xl bg-d-raised px-3 py-2 text-xs font-bold text-d-yellow">
          実際のお店の端末とは無関係です。心ゆくまで押してください。
        </p>
        <PressButton sound="click" haptics="medium" onClick={onClose} className="mt-5 h-14 w-full rounded-xl bg-cta text-base font-bold text-d-text ">
          わかった、押しに行く
        </PressButton>
      </div>
    </Modal>
  )
}
