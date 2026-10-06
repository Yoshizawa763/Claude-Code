import { useEffect, useRef, useState } from 'react'
import { getCartTargetRect, onFx, type FxEvent } from '../lib/fx'

interface Flyer {
  id: number
  emoji: string
  image?: string
  from: DOMRect
  to: DOMRect
}
interface Burst {
  id: number
  x: number
  y: number
  text: string
  color: string
}

let seq = 0

/**
 * 画面全体にかぶせる演出レイヤー。
 * - 商品がカートへ飛ぶ
 * - 紙吹雪（canvas）
 * - 「+1」などの浮き上がる文字
 */
export function FxLayer() {
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<{ particles: Particle[]; raf: number | null }>({ particles: [], raf: null })

  useEffect(() => {
    return onFx((e: FxEvent) => {
      if (e.type === 'fly') {
        const to = getCartTargetRect()
        if (!to) return
        const id = ++seq
        setFlyers((f) => [...f, { id, emoji: e.emoji, image: e.image, from: e.from, to }])
      } else if (e.type === 'burst') {
        const id = ++seq
        setBursts((b) => [...b, { id, x: e.x, y: e.y, text: e.text, color: e.color ?? '#6a3dff' }])
        window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900)
      } else if (e.type === 'confetti') {
        launchConfetti(canvasRef.current, confettiRef.current, e.power ?? 2)
      }
    })
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[150] h-full w-full" />
      <div className="pointer-events-none fixed inset-0 z-[160] overflow-hidden">
        {flyers.map((f) => (
          <FlyingEmoji key={f.id} flyer={f} onDone={() => setFlyers((fs) => fs.filter((x) => x.id !== f.id))} />
        ))}
        {bursts.map((b) => (
          <div
            key={b.id}
            className="absolute animate-float-up text-2xl font-black drop-shadow-md"
            style={{ left: b.x, top: b.y, color: b.color }}
          >
            {b.text}
          </div>
        ))}
      </div>
    </>
  )
}

function FlyingEmoji({ flyer, onDone }: { flyer: Flyer; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sx = flyer.from.left + flyer.from.width / 2
    const sy = flyer.from.top + flyer.from.height / 2
    const tx = flyer.to.left + flyer.to.width / 2
    const ty = flyer.to.top + flyer.to.height / 2
    const dx = tx - sx
    const dy = ty - sy
    const anim = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.45 - 90}px)) scale(1.25)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`, opacity: 0.6, offset: 1 },
      ],
      { duration: 620, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'forwards' },
    )
    anim.onfinish = onDone
    return () => anim.cancel()
  }, [flyer, onDone])
  return (
    <div
      ref={ref}
      className="absolute text-5xl drop-shadow-lg"
      style={{ left: flyer.from.left + flyer.from.width / 2, top: flyer.from.top + flyer.from.height / 2 }}
    >
      {flyer.image ? (
        <img src={flyer.image} alt="" className="h-20 w-20 rounded-full object-cover shadow-xl ring-4 ring-white" />
      ) : (
        flyer.emoji
      )}
    </div>
  )
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
}

const COLORS = ['#6a3dff', '#c6f52b', '#ff5c8a', '#ffd166', '#06d6a0', '#4cc9f0', '#ffffff']

function launchConfetti(canvas: HTMLCanvasElement | null, state: { particles: Particle[]; raf: number | null }, power: number) {
  if (!canvas) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const W = window.innerWidth
  const H = window.innerHeight
  const count = 80 * power
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1
    state.particles.push({
      x: W / 2 + side * W * 0.35,
      y: H * 0.7,
      vx: -side * (4 + Math.random() * 6) + (Math.random() - 0.5) * 4,
      vy: -(9 + Math.random() * 8) * (0.7 + power * 0.15),
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    })
  }
  if (state.raf !== null) return
  const step = () => {
    ctx.clearRect(0, 0, W, H)
    state.particles = state.particles.filter((p) => p.life > 0 && p.y < H + 40)
    for (const p of state.particles) {
      p.vy += 0.28
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 0.004
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5))
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (state.particles.length > 0) {
      state.raf = requestAnimationFrame(step)
    } else {
      ctx.clearRect(0, 0, W, H)
      state.raf = null
    }
  }
  state.raf = requestAnimationFrame(step)
}
