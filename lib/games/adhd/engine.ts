import type { AdhdRawData } from '../types'
import type { EegSample } from '../neiry/types'
import { NeiryFakeAdapter } from '../neiry/fake-adapter'

// ─── Constants ───────────────────────────────────────────────────────────────

const TEST_DURATION_MS = 120_000 // 2 minutes CPT
const STIMULUS_INTERVAL_MS = 1000 // one letter per second
const RESPONSE_WINDOW_MS = 900 // valid press must come within 900ms of onset
const TARGET_CHAR = 'X'
const TARGET_PROBABILITY = 0.3 // 30% of stimuli are targets
const LETTER_POOL = 'ABCDEFGHIJKLMNOPRSTUVWYZ'.split('')

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CptStimulus {
  id: number
  char: string
  isTarget: boolean
  shownAt: number // performance.now()
}

export type AdhdEvent =
  | { type: 'stimulus'; stimulus: CptStimulus }
  | { type: 'stimulus_hide' }
  | { type: 'tick'; elapsed: number; total: number }
  | { type: 'eeg'; sample: EegSample }
  | { type: 'done'; data: AdhdRawData }

export type AdhdListener = (event: AdhdEvent) => void

// ─── Engine ──────────────────────────────────────────────────────────────────

export class AdhdEngine {
  private listeners: Set<AdhdListener> = new Set()
  private rafId: number | null = null
  private stimulusTimer: ReturnType<typeof setTimeout> | null = null
  private running = false

  private startTime = 0
  private stimulusCounter = 0
  private currentStimulus: CptStimulus | null = null
  private nextStimulusAt = 0

  // Accumulate raw data
  private reactionTimes: number[] = []
  private omissionErrors = 0
  private commissionErrors = 0
  private eegStream: EegSample[] = []

  // Sustained attention tracking (split into 5 windows)
  private windowDuration = TEST_DURATION_MS / 5
  private windowHits: number[] = [0, 0, 0, 0, 0]
  private windowTargets: number[] = [0, 0, 0, 0, 0]

  private neiry = new NeiryFakeAdapter()

  on(fn: AdhdListener): void {
    this.listeners.add(fn)
  }
  off(fn: AdhdListener): void {
    this.listeners.delete(fn)
  }

  hasActiveTarget(): boolean {
    return this.currentStimulus?.isTarget ?? false
  }

  private emit(event: AdhdEvent): void {
    this.listeners.forEach((fn) => fn(event))
  }

  start(): void {
    this.running = true
    this.startTime = performance.now()
    this.nextStimulusAt = this.startTime

    this.neiry.connect().then(() => {
      if (!this.running) return
      this.neiry.onData((sample) => {
        this.eegStream.push(sample)
        this.emit({ type: 'eeg', sample })
      })
    })

    this.rafId = requestAnimationFrame(this.loop)
  }

  stop(): void {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.stimulusTimer !== null) {
      clearTimeout(this.stimulusTimer)
      this.stimulusTimer = null
    }
    this.neiry.disconnect()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleKeyPress(_key: string): void {
    if (!this.running) return
    const now = performance.now()
    const s = this.currentStimulus

    if (s) {
      const rt = now - s.shownAt
      if (rt <= RESPONSE_WINDOW_MS) {
        if (s.isTarget) {
          this.reactionTimes.push(rt)
          const window = this.getWindow(s.shownAt - this.startTime)
          this.windowHits[window]++
        } else {
          this.commissionErrors++
        }
        this.currentStimulus = null
        this.emit({ type: 'stimulus_hide' })
      } else {
        // response after window = commission
        if (!s.isTarget) this.commissionErrors++
      }
    } else {
      // no active stimulus = commission error
      this.commissionErrors++
    }
  }

  private loop = (now: number): void => {
    if (!this.running) return

    const elapsed = now - this.startTime
    if (elapsed >= TEST_DURATION_MS) {
      this.running = false
      this.finalize()
      return
    }

    this.emit({ type: 'tick', elapsed, total: TEST_DURATION_MS })

    // Hide stimulus after its visible window
    if (this.currentStimulus && now - this.currentStimulus.shownAt >= RESPONSE_WINDOW_MS) {
      if (this.currentStimulus.isTarget) {
        // Missed target
        this.omissionErrors++
        const window = this.getWindow(this.currentStimulus.shownAt - this.startTime)
        this.windowTargets[window]++
      }
      this.currentStimulus = null
      this.emit({ type: 'stimulus_hide' })
    }

    // Show next stimulus
    if (!this.currentStimulus && now >= this.nextStimulusAt) {
      const isTarget = Math.random() < TARGET_PROBABILITY
      const char = isTarget
        ? TARGET_CHAR
        : LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)]

      const stimulus: CptStimulus = {
        id: ++this.stimulusCounter,
        char,
        isTarget,
        shownAt: now,
      }

      if (isTarget) {
        const window = this.getWindow(now - this.startTime)
        this.windowTargets[window]++
      }

      this.currentStimulus = stimulus
      this.emit({ type: 'stimulus', stimulus })
      this.nextStimulusAt = now + STIMULUS_INTERVAL_MS
    }

    this.rafId = requestAnimationFrame(this.loop)
  }

  private getWindow(elapsedMs: number): number {
    return Math.min(4, Math.floor(elapsedMs / this.windowDuration))
  }

  private finalize(): void {
    // Sustained attention: hit rate per window averaged → 0–100
    const windowRates = this.windowTargets.map((targets, i) =>
      targets === 0 ? 1 : this.windowHits[i] / targets
    )
    const sustainedAttentionScore = Math.round(
      (windowRates.reduce((a, b) => a + b, 0) / windowRates.length) * 100
    )

    const data: AdhdRawData = {
      reactionTimesMs: this.reactionTimes,
      omissionErrors: this.omissionErrors,
      commissionErrors: this.commissionErrors,
      sustainedAttentionScore,
      eegStream: this.eegStream,
    }
    this.emit({ type: 'done', data })
  }
}
