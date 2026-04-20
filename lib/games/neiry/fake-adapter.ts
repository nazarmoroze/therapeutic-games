import type { NeiryAdapter, EegCallback, EegSample, EegBands } from './types'

// ─── Realistic random-walk EEG simulator ────────────────────────────────────
// Generates plausible band-power values that drift over time with mean-reversion
// and add cross-band correlations (alpha ↔ beta are anticorrelated, etc.)

const BAND_DEFAULTS: EegBands = {
  delta: 0.55,
  theta: 0.35,
  alpha: 0.45,
  beta: 0.3,
  gamma: 0.2,
}

const BAND_NOISE = {
  delta: 0.04,
  theta: 0.06,
  alpha: 0.07,
  beta: 0.08,
  gamma: 0.05,
}

const MEAN_REVERSION = 0.04 // pull strength toward baseline each tick

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function gaussianNoise(std: number): number {
  // Box-Muller
  const u1 = Math.random()
  const u2 = Math.random()
  return std * Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(2 * Math.PI * u2)
}

export class NeiryFakeAdapter implements NeiryAdapter {
  private callbacks: Set<EegCallback> = new Set()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private connected = false
  private startTime = 0
  private state: EegBands = { ...BAND_DEFAULTS }

  async connect(): Promise<void> {
    this.connected = true
    this.startTime = Date.now()
    this.state = { ...BAND_DEFAULTS }

    this.intervalId = setInterval(() => {
      const sample = this.generateSample()
      this.callbacks.forEach((cb) => cb(sample))
    }, 250) // 4 Hz update rate
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.connected = false
  }

  onData(cb: EegCallback): void {
    this.callbacks.add(cb)
  }

  offData(cb: EegCallback): void {
    this.callbacks.delete(cb)
  }

  isConnected(): boolean {
    return this.connected
  }

  private generateSample(): EegSample {
    const bands = this.state
    const keys = Object.keys(BAND_DEFAULTS) as (keyof EegBands)[]

    // Random walk each band with mean reversion
    for (const key of keys) {
      const noise = gaussianNoise(BAND_NOISE[key])
      const reversion = MEAN_REVERSION * (BAND_DEFAULTS[key] - bands[key])
      bands[key] = clamp(bands[key] + noise + reversion, 0.05, 0.95)
    }

    // Alpha-beta anticorrelation (attention effect)
    const alphaBetaDiff = bands.alpha - BAND_DEFAULTS.alpha
    bands.beta = clamp(bands.beta - alphaBetaDiff * 0.3, 0.05, 0.95)

    // Theta inversely correlated with beta (drowsy vs focused)
    const betaDiff = bands.beta - BAND_DEFAULTS.beta
    bands.theta = clamp(bands.theta - betaDiff * 0.2, 0.05, 0.95)

    // Signal quality: mostly good with occasional dips
    const quality = Math.random() > 0.05 ? 0.9 + Math.random() * 0.1 : 0.6 + Math.random() * 0.3

    return {
      timestamp: Date.now() - this.startTime,
      bands: { ...bands },
      quality,
    }
  }
}
