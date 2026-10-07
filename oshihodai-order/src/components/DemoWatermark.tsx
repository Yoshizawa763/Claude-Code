/** 全画面の隅に常時表示する「デモモード」表示 */
export function DemoWatermark() {
  return (
    <div className="pointer-events-none fixed bottom-[calc(0.25rem+env(safe-area-inset-bottom,0px))] left-[calc(0.25rem+env(safe-area-inset-left,0px))] z-[200] rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-sm sm:text-xs">
      デモモード／注文は送信されません
    </div>
  )
}
