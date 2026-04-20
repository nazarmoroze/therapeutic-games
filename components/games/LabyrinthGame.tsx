'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameProps, LabyrinthRawData } from '@/lib/games/types'
import { generateMaze, shortestPath, type Maze } from '@/lib/games/labyrinth/maze'

// ─── Config ──────────────────────────────────────────────────────────────────

const LEVELS = [
  { rows: 8, cols: 8 },
  { rows: 10, cols: 10 },
  { rows: 12, cols: 12 },
]

const WALL_COLOR = '#334155'
const BG_COLOR = '#0f172a'
const PLAYER_CLR = '#6366f1'
const EXIT_CLR = '#10b981'
const HINT_CLR = 'rgba(251,191,36,0.35)'
const PATH_CLR = 'rgba(99,102,241,0.12)'

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreLabyrinth(data: LabyrinthRawData): number {
  const { rows, cols } = LEVELS[Math.min(data.levelReached - 1, LEVELS.length - 1)]
  const optimalMs = rows * cols * 1200 // 1.2s per cell = ideal
  const timeScore = Math.max(0, 1 - data.completionTimeMs / (optimalMs * 3))
  const wrongPenalty = Math.min(0.4, data.wrongTurns * 0.02)
  const hintPenalty = Math.min(0.2, data.hintsUsed * 0.05)
  const levelBonus = (data.levelReached - 1) * 0.12
  return Math.round(
    Math.min(100, Math.max(0, (timeScore * 0.6 - wrongPenalty - hintPenalty + levelBonus) * 100))
  )
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function drawMaze(
  canvas: HTMLCanvasElement,
  maze: Maze,
  player: [number, number],
  hintPath: [number, number][],
  visited: Set<string>
) {
  const rows = maze.length,
    cols = maze[0].length
  const cw = canvas.width / cols
  const ch = canvas.height / rows
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Visited cells
  ctx.fillStyle = PATH_CLR
  for (const key of Array.from(visited)) {
    const [r, c] = key.split(',').map(Number)
    ctx.fillRect(c * cw + 1, r * ch + 1, cw - 1, ch - 1)
  }

  // Hint path
  if (hintPath.length > 1) {
    ctx.fillStyle = HINT_CLR
    for (const [r, c] of hintPath.slice(1)) {
      ctx.fillRect(c * cw + 1, r * ch + 1, cw - 1, ch - 1)
    }
  }

  // Exit cell
  const er = rows - 1,
    ec = cols - 1
  ctx.fillStyle = EXIT_CLR + '44'
  ctx.fillRect(ec * cw + 1, er * ch + 1, cw - 1, ch - 1)

  // Exit marker
  ctx.fillStyle = EXIT_CLR
  const ex = (ec + 0.5) * cw,
    ey = (er + 0.5) * ch
  ctx.beginPath()
  ctx.arc(ex, ey, Math.min(cw, ch) * 0.22, 0, Math.PI * 2)
  ctx.fill()

  // Walls
  ctx.strokeStyle = WALL_COLOR
  ctx.lineWidth = 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw,
        y = r * ch
      const cell = maze[r][c]
      ctx.beginPath()
      if (cell.top) {
        ctx.moveTo(x, y)
        ctx.lineTo(x + cw, y)
      }
      if (cell.right) {
        ctx.moveTo(x + cw, y)
        ctx.lineTo(x + cw, y + ch)
      }
      if (cell.bottom) {
        ctx.moveTo(x, y + ch)
        ctx.lineTo(x + cw, y + ch)
      }
      if (cell.left) {
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + ch)
      }
      ctx.stroke()
    }
  }

  // Player
  const [pr, pc] = player
  const px = (pc + 0.5) * cw,
    py = (pr + 0.5) * ch
  const radius = Math.min(cw, ch) * 0.28
  ctx.fillStyle = PLAYER_CLR
  ctx.shadowColor = PLAYER_CLR
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(px, py, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}

// ─── Component ───────────────────────────────────────────────────────────────

interface LevelState {
  maze: Maze
  player: [number, number]
  visited: Set<string>
  hintPath: [number, number][]
  startMs: number
}

function buildLevel(levelIdx: number): LevelState {
  const { rows, cols } = LEVELS[levelIdx]
  const maze = generateMaze(rows, cols)
  return {
    maze,
    player: [0, 0],
    visited: new Set(['0,0']),
    hintPath: [],
    startMs: Date.now(),
  }
}

export default function LabyrinthGame({ onResult }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startRef = useRef(Date.now())

  const [levelIdx, setLevelIdx] = useState(0)
  const [level, setLevel] = useState<LevelState>(() => buildLevel(0))
  const [wrongTurns, setWrongTurns] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [levelTimes, setLevelTimes] = useState<number[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [finished, setFinished] = useState(false)

  // Redraw whenever level state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawMaze(canvas, level.maze, level.player, level.hintPath, level.visited)
  }, [level])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const size = Math.min(canvas.parentElement!.clientWidth, 480)
      canvas.width = size
      canvas.height = size
      drawMaze(canvas, level.maze, level.player, level.hintPath, level.visited)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx])

  const advance = useCallback((dr: number, dc: number) => {
    setLevel((prev) => {
      const maze = prev.maze
      const [r, c] = prev.player
      const rows = maze.length,
        cols = maze[0].length

      const dirMap: Record<string, keyof import('@/lib/games/labyrinth/maze').Cell> = {
        '-1,0': 'top',
        '0,1': 'right',
        '1,0': 'bottom',
        '0,-1': 'left',
      }
      const dir = dirMap[`${dr},${dc}`]
      if (!dir || maze[r][c][dir]) return prev // wall

      const nr = r + dr,
        nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return prev

      const key = `${nr},${nc}`
      const isBacktrack = prev.visited.has(key)
      if (isBacktrack) setWrongTurns((w) => w + 1)

      const newVisited = new Set(prev.visited)
      newVisited.add(key)

      return {
        ...prev,
        player: [nr, nc],
        visited: newVisited,
        hintPath: [], // clear hint on move
      }
    })
  }, [])

  // Check if player reached exit
  useEffect(() => {
    const { rows, cols } = LEVELS[levelIdx]
    const [pr, pc] = level.player
    if (pr !== rows - 1 || pc !== cols - 1) return
    if (showSuccess || finished) return

    const elapsed = Date.now() - level.startMs
    const newTimes = [...levelTimes, elapsed]

    if (levelIdx < LEVELS.length - 1) {
      setLevelTimes(newTimes)
      setShowSuccess(true)
    } else {
      // All levels done
      const totalMs = newTimes.reduce((a, b) => a + b, 0)
      const rawData: LabyrinthRawData = {
        completionTimeMs: totalMs,
        wrongTurns,
        hintsUsed,
        levelReached: LEVELS.length,
      }
      setFinished(true)
      onResult({
        score: scoreLabyrinth(rawData),
        durationMs: Date.now() - startRef.current,
        rawData,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.player])

  const nextLevel = useCallback(() => {
    const next = levelIdx + 1
    setLevelIdx(next)
    setLevel(buildLevel(next))
    setShowSuccess(false)
  }, [levelIdx])

  const showHint = useCallback(() => {
    setHintsUsed((h) => h + 1)
    setLevel((prev) => {
      const { rows, cols } = LEVELS[levelIdx]
      const [pr, pc] = prev.player
      const path = shortestPath(prev.maze, pr, pc, rows - 1, cols - 1)
      return { ...prev, hintPath: path }
    })
  }, [levelIdx])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        w: [-1, 0],
        W: [-1, 0],
        ArrowRight: [0, 1],
        d: [0, 1],
        D: [0, 1],
        ArrowDown: [1, 0],
        s: [1, 0],
        S: [1, 0],
        ArrowLeft: [0, -1],
        a: [0, -1],
        A: [0, -1],
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        advance(dir[0], dir[1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  // Touch swipe
  const touchStart = useRef<[number, number] | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = [e.touches[0].clientX, e.touches[0].clientY]
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current[0]
    const dy = e.changedTouches[0].clientY - touchStart.current[1]
    touchStart.current = null
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
    if (Math.abs(dx) > Math.abs(dy)) {
      advance(0, dx > 0 ? 1 : -1)
    } else {
      advance(dy > 0 ? 1 : -1, 0)
    }
  }

  if (finished) return null

  const { rows, cols } = LEVELS[levelIdx]

  return (
    <div className="flex flex-col items-center gap-4 py-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <div className="text-sm text-slate-500">
          Level <span className="font-bold text-slate-800">{levelIdx + 1}</span>/{LEVELS.length}
          <span className="ml-3 text-xs text-slate-400">
            {rows}×{cols}
          </span>
        </div>
        <div className="flex gap-3 text-xs text-slate-500">
          <span>
            Wrong turns: <b className="text-slate-700">{wrongTurns}</b>
          </span>
          <button
            onClick={showHint}
            className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium"
          >
            Hint ({hintsUsed})
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-slate-700 touch-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />

        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="bg-white rounded-2xl p-6 text-center shadow-2xl">
              <p className="text-2xl mb-1">🎉</p>
              <p className="font-bold text-slate-900 text-lg">Level {levelIdx + 1} Complete!</p>
              <p className="text-slate-500 text-sm mt-1 mb-4">Ready for the next challenge?</p>
              <button
                onClick={nextLevel}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Next Level →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* D-pad for mobile */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        {[
          [null, [-1, 0, '↑'], null],
          [[0, -1, '←'], null, [0, 1, '→']],
          [null, [1, 0, '↓'], null],
        ].map((row, ri) => (
          <div key={ri} className="contents">
            {row.map((cell, ci) =>
              cell ? (
                <button
                  key={ci}
                  onPointerDown={() => advance(cell[0] as number, cell[1] as number)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-lg transition-colors"
                >
                  {cell[2]}
                </button>
              ) : (
                <div key={ci} className="w-11 h-11" />
              )
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-1">Arrow keys / WASD / swipe / D-pad</p>
    </div>
  )
}
