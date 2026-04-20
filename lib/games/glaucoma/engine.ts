import type { GlaucomaRawData } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────

const GRID_SIZE = 8 // 8×8 visual field map
const TEST_DURATION_MS = 90_000 // 1.5 minutes
const STIMULUS_VISIBLE_MS = 1000 // dot stays visible for 1 second
const MIN_ISI_MS = 600 // inter-stimulus interval
const MAX_ISI_MS = 1800
const FALSE_POS_INTERVAL_MS = 8000 // blank period every ~8s to catch false positives

// Sectors: 8 cardinal + intercardinal positions mapped to grid regions
const SECTOR_CELLS: [number, number][][] = buildSectorCells()

function buildSectorCells(): [number, number][][] {
  // Divide 8×8 grid into 8 sectors (wedges from center)
  const sectors: [number, number][][] = Array.from({ length: 8 }, () => [])
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dr = r - 3.5
      const dc = c - 3.5
      if (Math.abs(dr) < 0.5 && Math.abs(dc) < 0.5) continue // skip center
      const angle = Math.atan2(dr, dc)
      const sector = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 8) % 8
      sectors[sector].push([r, c])
    }
  }
  return sectors
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GlaucomaStimulus {
  id: number
  sector: number
  row: number
  col: number
  x: number // canvas px
  y: number // canvas px
  radius: number
  visibleUntil: number // performance.now() timestamp
}

export type GlaucomaEvent =
  | { type: 'stimulus'; stimulus: GlaucomaStimulus }
  | { type: 'stimulus_hide'; id: number }
  | { type: 'tick'; elapsed: number; total: number }
  | { type: 'done'; data: GlaucomaRawData }

export type GlaucomaListener = (event: GlaucomaEvent) => void

// ─── Engine ──────────────────────────────────────────────────────────────────

export class GlaucomaEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private listeners: Set<GlaucomaListener> = new Set()
  private rafId: number | null = null
  private running = false

  private startTime = 0
  private nextStimulusAt = 0
  private nextFalsePosCheckAt = 0
  private stimulusCounter = 0
  private activeStimulus: GlaucomaStimulus | null = null

  // Raw data accumulators
  private responseTimes: number[] = []
  private missedTargets = 0
  private falsePositives = 0
  private hitMap: number[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0))
  private missMap: number[][] = Array.from({ length: GRID_SIZE }, () =>
    new Array(GRID_SIZE).fill(0)
  )

  // State for current stimulus response tracking
  private currentStimulusShownAt = 0
  private waitingForResponse = false
  private inFalsePosWindow = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  on(fn: GlaucomaListener): void {
    this.listeners.add(fn)
  }
  off(fn: GlaucomaListener): void {
    this.listeners.delete(fn)
  }

  private emit(event: GlaucomaEvent): void {
    this.listeners.forEach((fn) => fn(event))
  }

  start(): void {
    this.running = true
    this.startTime = performance.now()
    this.nextStimulusAt = this.startTime + 500
    this.nextFalsePosCheckAt = this.startTime + FALSE_POS_INTERVAL_MS
    this.rafId = requestAnimationFrame(this.loop)
  }

  stop(): void {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  handleClick(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (clientY - rect.top) * (this.canvas.height / rect.height)

    const now = performance.now()

    if (this.inFalsePosWindow) {
      this.falsePositives++
      this.inFalsePosWindow = false
      return
    }

    if (this.waitingForResponse && this.activeStimulus) {
      const s = this.activeStimulus
      const dist = Math.hypot(x - s.x, y - s.y)
      if (dist <= s.radius * 3.5) {
        const rt = now - this.currentStimulusShownAt
        this.responseTimes.push(rt)
        this.hitMap[s.row][s.col]++
        this.waitingForResponse = false
        this.activeStimulus = null
        this.emit({ type: 'stimulus_hide', id: s.id })
      } else {
        // Clicked wrong place during stimulus = false positive
        this.falsePositives++
      }
    } else if (!this.waitingForResponse) {
      // Click outside any stimulus window = false positive
      this.falsePositives++
    }
  }

  private loop = (now: number): void => {
    if (!this.running) return

    const elapsed = now - this.startTime
    if (elapsed >= TEST_DURATION_MS) {
      this.running = false
      this.clearCanvas()
      this.finalize()
      return
    }

    this.emit({ type: 'tick', elapsed, total: TEST_DURATION_MS })

    // Hide expired stimulus
    if (this.activeStimulus && now >= this.activeStimulus.visibleUntil) {
      if (this.waitingForResponse) {
        this.missedTargets++
        this.missMap[this.activeStimulus.row][this.activeStimulus.col]++
        this.waitingForResponse = false
      }
      this.emit({ type: 'stimulus_hide', id: this.activeStimulus.id })
      this.activeStimulus = null
      this.clearCanvas()
    }

    // Show next stimulus
    if (!this.activeStimulus && !this.inFalsePosWindow && now >= this.nextStimulusAt) {
      const stimulus = this.createStimulus(now)
      this.activeStimulus = stimulus
      this.currentStimulusShownAt = now
      this.waitingForResponse = true
      this.drawStimulus(stimulus)
      this.emit({ type: 'stimulus', stimulus })
      this.nextStimulusAt =
        now + STIMULUS_VISIBLE_MS + MIN_ISI_MS + Math.random() * (MAX_ISI_MS - MIN_ISI_MS)
    }

    // False positive check window
    if (!this.activeStimulus && now >= this.nextFalsePosCheckAt) {
      this.inFalsePosWindow = true
      setTimeout(() => {
        this.inFalsePosWindow = false
        this.nextFalsePosCheckAt = performance.now() + FALSE_POS_INTERVAL_MS
      }, 500)
    }

    this.rafId = requestAnimationFrame(this.loop)
  }

  private createStimulus(now: number): GlaucomaStimulus {
    const sector = Math.floor(Math.random() * 8)
    const cells = SECTOR_CELLS[sector]
    const [row, col] = cells[Math.floor(Math.random() * cells.length)]

    const cellW = this.canvas.width / GRID_SIZE
    const cellH = this.canvas.height / GRID_SIZE
    const x = (col + 0.5) * cellW
    const y = (row + 0.5) * cellH
    const radius = Math.min(cellW, cellH) * 0.48

    return {
      id: ++this.stimulusCounter,
      sector,
      row,
      col,
      x,
      y,
      radius,
      visibleUntil: now + STIMULUS_VISIBLE_MS,
    }
  }

  private drawStimulus(s: GlaucomaStimulus): void {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawFixation()
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fill()
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawFixation()
  }

  private drawFixation(): void {
    const cx = this.canvas.width / 2
    const cy = this.canvas.height / 2
    const ctx = this.ctx
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - 8, cy)
    ctx.lineTo(cx + 8, cy)
    ctx.moveTo(cx, cy - 8)
    ctx.lineTo(cx, cy + 8)
    ctx.stroke()
  }

  private finalize(): void {
    // Build sensitivity map: 0 = never shown, 1–4 based on hit rate
    const sensitivityMap: number[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (__, c) => {
        const hits = this.hitMap[r][c]
        const misses = this.missMap[r][c]
        const total = hits + misses
        if (total === 0) return 0
        const rate = hits / total
        if (rate >= 0.8) return 4
        if (rate >= 0.6) return 3
        if (rate >= 0.4) return 2
        return 1
      })
    )

    const data: GlaucomaRawData = {
      responseTimesMs: this.responseTimes,
      missedTargets: this.missedTargets,
      falsePositives: this.falsePositives,
      visualFieldMap: sensitivityMap,
    }
    this.emit({ type: 'done', data })
  }
}
