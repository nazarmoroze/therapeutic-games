// ─── EEG frequency bands ────────────────────────────────────────────────────

export interface EegBands {
  delta: number // 1–4 Hz   — deep sleep, unconscious
  theta: number // 4–8 Hz   — drowsy, memory encoding
  alpha: number // 8–13 Hz  — relaxed, eyes-closed baseline
  beta: number // 13–30 Hz — focused, alert, anxious
  gamma: number // 30–100 Hz — high-level cognition
}

export interface EegSample {
  timestamp: number // ms since game start
  bands: EegBands
  quality: number // 0–1 signal quality
}

// ─── Adapter interface ───────────────────────────────────────────────────────

export type EegCallback = (sample: EegSample) => void

export interface NeiryAdapter {
  connect(): Promise<void>
  disconnect(): void
  onData(cb: EegCallback): void
  offData(cb: EegCallback): void
  isConnected(): boolean
}
