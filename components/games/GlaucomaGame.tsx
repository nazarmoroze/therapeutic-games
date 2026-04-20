'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameProps, GlaucomaRawData } from '@/lib/games/types'
import { GlaucomaEngine } from '@/lib/games/glaucoma/engine'
import type { GlaucomaListener } from '@/lib/games/glaucoma/engine'

function scoreGlaucoma(data: GlaucomaRawData): number {
  const totalShown = data.responseTimesMs.length + data.missedTargets
  if (totalShown === 0) return 0
  const hitRate = data.responseTimesMs.length / totalShown
  const avgRt = data.responseTimesMs.length
    ? data.responseTimesMs.reduce((a, b) => a + b, 0) / data.responseTimesMs.length
    : 600
  const rtScore = Math.max(0, 1 - (avgRt - 200) / 400)
  const fpPenalty = Math.min(1, data.falsePositives / 10) * 0.2
  return Math.round((hitRate * 0.6 + rtScore * 0.4 - fpPenalty) * 100)
}

export default function GlaucomaGame({ onResult }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GlaucomaEngine | null>(null)
  const startRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [hits, setHits] = useState(0)

  const handleResult = useCallback(
    (data: GlaucomaRawData) => {
      onResult({
        score: scoreGlaucoma(data),
        durationMs: Date.now() - startRef.current,
        rawData: data,
      })
    },
    [onResult]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    // Set initial canvas size
    canvas.width = wrapper.clientWidth || 800
    canvas.height = wrapper.clientHeight || 600

    // Keep canvas in sync with wrapper size
    const ro = new ResizeObserver(() => {
      canvas.width = wrapper.clientWidth
      canvas.height = wrapper.clientHeight
    })
    ro.observe(wrapper)

    startRef.current = Date.now()
    const engine = new GlaucomaEngine(canvas)
    engineRef.current = engine

    const listener: GlaucomaListener = (event) => {
      if (event.type === 'done') {
        handleResult(event.data)
      } else if (event.type === 'tick') {
        setProgress(Math.min(100, (event.elapsed / event.total) * 100))
      } else if (event.type === 'stimulus_hide') {
        setHits((h) => h + 1)
      }
    }

    engine.on(listener)
    engine.start()

    return () => {
      ro.disconnect()
      engine.off(listener)
      engine.stop()
    }
  }, [handleResult])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    engineRef.current?.handleClick(e.clientX, e.clientY)
  }, [])

  return (
    <div className="flex flex-col gap-3 h-full" style={{ minHeight: 520 }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-400 font-medium">
          Visual Field Test — click the white dots
        </span>
        <span className="text-sm text-indigo-400 font-semibold">{hits} detected</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Canvas wrapper */}
      <div
        ref={wrapperRef}
        className="flex-1 relative bg-black rounded-xl overflow-hidden cursor-crosshair"
        style={{ minHeight: 460 }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onClick={handleClick}
        />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-widest select-none pointer-events-none">
          KEEP EYES ON CENTER · CLICK DOTS IN PERIPHERY
        </div>
      </div>
    </div>
  )
}
