/**
 * Web Audio API による効果音合成。外部ファイルは一切使わない。
 * AudioContext はユーザー操作後に生成・resume する。
 */

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** 最初のユーザー操作で呼び、AudioContext を起こす */
export function unlockAudio() {
  getCtx()
}

export function setMuted(m: boolean) {
  muted = m
}
export function isMuted() {
  return muted
}

interface ToneOpts {
  freq: number
  /** 終了周波数（指定時はスイープ） */
  freqTo?: number
  type?: OscillatorType
  duration: number
  gain?: number
  /** 開始オフセット秒 */
  at?: number
  attack?: number
}

function tone(c: AudioContext, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.freqTo !== undefined) osc.frequency.exponentialRampToValueAtTime(o.freqTo, t0 + o.duration)
  const peak = o.gain ?? 0.2
  const attack = o.attack ?? 0.005
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + o.duration + 0.02)
}

function noise(c: AudioContext, duration: number, gain = 0.15, at = 0, hp = 2000) {
  const t0 = c.currentTime + at
  const len = Math.floor(c.sampleRate * duration)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = hp
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(t0)
}

function play(fn: (c: AudioContext) => void) {
  if (muted) return
  const c = getCtx()
  if (!c) return
  try {
    fn(c)
  } catch {
    /* 音が鳴らなくても操作は続行 */
  }
}

/** 一般的なボタンのクリック音（短いカチッ） */
export function sfxClick() {
  play((c) => {
    tone(c, { freq: 1800, freqTo: 900, type: 'square', duration: 0.05, gain: 0.08 })
    noise(c, 0.02, 0.05, 0, 4000)
  })
}

/** 軽いタップ音（タブ切替など） */
export function sfxTap() {
  play((c) => tone(c, { freq: 1200, freqTo: 800, type: 'triangle', duration: 0.06, gain: 0.1 }))
}

/** 数量＋（コンボ段階で音程が上がる） */
export function sfxPlus(step = 0) {
  play((c) => {
    const base = 660 * Math.pow(2, Math.min(step, 24) / 12)
    tone(c, { freq: base, freqTo: base * 1.5, type: 'triangle', duration: 0.09, gain: 0.14 })
  })
}

/** 数量−（低めの音） */
export function sfxMinus() {
  play((c) => tone(c, { freq: 500, freqTo: 300, type: 'triangle', duration: 0.1, gain: 0.12 }))
}

/** カート投入音（ポンッ） */
export function sfxPop() {
  play((c) => {
    tone(c, { freq: 300, freqTo: 1100, type: 'sine', duration: 0.13, gain: 0.25 })
    tone(c, { freq: 1500, freqTo: 2400, type: 'sine', duration: 0.08, gain: 0.08, at: 0.05 })
  })
}

/** 高額商品投入時のカ・チーン */
export function sfxCash() {
  play((c) => {
    noise(c, 0.05, 0.2, 0, 3000)
    tone(c, { freq: 2200, type: 'sine', duration: 0.5, gain: 0.18, at: 0.04 })
    tone(c, { freq: 3300, type: 'sine', duration: 0.6, gain: 0.12, at: 0.06 })
    tone(c, { freq: 4400, type: 'sine', duration: 0.4, gain: 0.06, at: 0.08 })
  })
}

/** 削除・キャンセル */
export function sfxCancel() {
  play((c) => tone(c, { freq: 400, freqTo: 180, type: 'sawtooth', duration: 0.15, gain: 0.08 }))
}

/** 注文確定のファンファーレ（やや大げさ） */
export function sfxOrderComplete() {
  play((c) => {
    const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    seq.forEach((f, i) => {
      tone(c, { freq: f, type: 'triangle', duration: 0.35, gain: 0.18, at: i * 0.09 })
      tone(c, { freq: f * 2, type: 'sine', duration: 0.3, gain: 0.06, at: i * 0.09 })
    })
    // 最後のジャーン
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f) => {
      tone(c, { freq: f, type: 'sawtooth', duration: 1.2, gain: 0.07, at: 0.5, attack: 0.02 })
    })
    tone(c, { freq: 2093, type: 'sine', duration: 1.0, gain: 0.1, at: 0.5 })
    noise(c, 0.3, 0.1, 0.5, 5000)
  })
}

/** バッジ解放のキラキラ */
export function sfxBadge() {
  play((c) => {
    const seq = [1046.5, 1318.5, 1568, 2093, 2637, 3136]
    seq.forEach((f, i) => tone(c, { freq: f, type: 'sine', duration: 0.4, gain: 0.12, at: i * 0.06 }))
    tone(c, { freq: 4186, type: 'sine', duration: 0.8, gain: 0.05, at: 0.36 })
  })
}

/** コンボ達成の効果音 */
export function sfxCombo(level: number) {
  play((c) => {
    const base = 880 * Math.pow(2, Math.min(level, 12) / 12)
    tone(c, { freq: base, freqTo: base * 2, type: 'square', duration: 0.12, gain: 0.06 })
    tone(c, { freq: base * 1.5, type: 'sine', duration: 0.2, gain: 0.08, at: 0.05 })
  })
}

/** 待機画面から開始 */
export function sfxStart() {
  play((c) => {
    tone(c, { freq: 440, freqTo: 880, type: 'triangle', duration: 0.25, gain: 0.15 })
    tone(c, { freq: 880, freqTo: 1760, type: 'sine', duration: 0.3, gain: 0.1, at: 0.15 })
  })
}
