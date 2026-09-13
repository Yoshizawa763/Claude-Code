/** 全画面の隅に常時表示する「デモモード」表示 */
export function DemoWatermark() {
  return (
    <div className="pointer-events-none fixed bottom-1 left-1 z-[200] rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-sm sm:text-xs">
      デモモード／注文は送信されません
    </div>
  )
}
