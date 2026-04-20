'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameProps, AdhdRawData } from '@/lib/games/types'
import type { EegSample } from '@/lib/games/neiry/types'
import { AdhdEngine } from '@/lib/games/adhd/engine'
import type { AdhdListener } from '@/lib/games/adhd/engine'

const BAND_COLORS: Record<string, string> = {
  delta: '#6366f1',
  theta: '#8b5cf6',
  alpha: '#10b981',
  beta: '#f59e0b',
  gamma: '#ef4444',
}
const BANDS = ['delta', 'theta', 'alpha', 'beta', 'gamma'] as const

function scoreAdhd(data: AdhdRawData): number {
  const totalTargets = data.reactionTimesMs.length + data.omissionErrors
  if (totalTargets === 0) return 50
  const hitRate = data.reactionTimesMs.length / totalTargets
  const avgRt = data.reactionTimesMs.length
    ? data.reactionTimesMs.reduce((a, b) => a + b, 0) / data.reactionTimesMs.length
    : 500
  const rtScore = Math.max(0, 1 - (avgRt - 200) / 300)
  const commissionPenalty = Math.min(1, data.commissionErrors / 20) * 0.2
  const sustained = data.sustainedAttentionScore / 100
  return Math.max(
    0,
    Math.round((hitRate * 0.35 + rtScore * 0.25 + sustained * 0.4 - commissionPenalty) * 100)
  )
}

export default function AdhdGame({ onResult }: GameProps) {
  const engineRef = useRef<AdhdEngine | null>(null)
  const startRef = useRef(0)

  const [letter, setLetter] = useState<string | null>(null)
  const [isX, setIsX] = useState(false)
  const [eeg, setEeg] = useState<EegSample['bands'] | null>(null)
  const [progress, setProgress] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [score, setScore] = useState({ hits: 0, errors: 0 })

  const handleResult = useCallback(
    (data: AdhdRawData) => {
      onResult({
        score: scoreAdhd(data),
        durationMs: Date.now() - startRef.current,
        rawData: data,
      })
    },
    [onResult]
  )

  useEffect(() => {
    startRef.current = Date.now()
    const engine = new AdhdEngine()
    engineRef.current = engine

    const listener: AdhdListener = (event) => {
      switch (event.type) {
        case 'stimulus':
          setLetter(event.stimulus.char)
          setIsX(event.stimulus.isTarget)
          break
        case 'stimulus_hide':
          setLetter(null)
          setIsX(false)
          break
        case 'eeg':
          setEeg(event.sample.bands)
          break
        case 'tick':
          setProgress(Math.min(100, (event.elapsed / event.total) * 100))
          break
        case 'done':
          handleResult(event.data)
          break
      }
    }

    engine.on(listener)
    engine.start()

    return () => {
      engine.off(listener)
      engine.stop()
      engineRef.current = null
    }
  }, [handleResult])

  const tap = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const wasTarget = engine.hasActiveTarget()
    engine.handleKeyPress(' ')
    setFlash(wasTarget ? 'hit' : 'miss')
    setScore((s) => (wasTarget ? { ...s, hits: s.hits + 1 } : { ...s, errors: s.errors + 1 }))
    setTimeout(() => setFlash(null), 300)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        tap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tap])

  const boxStyle =
    flash === 'hit'
      ? 'border-emerald-400 bg-emerald-950 shadow-emerald-900/60'
      : flash === 'miss'
        ? 'border-rose-400    bg-rose-950    shadow-rose-900/60'
        : 'border-gray-700 bg-gray-900 shadow-black/40'

  return (
    <div
      className="flex flex-col bg-gray-950 rounded-xl overflow-hidden"
      style={{ minHeight: 560 }}
    >
      {/* Progress */}
      <div className="h-1.5 bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Score row */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
        <span className="text-emerald-400 text-sm font-semibold">✓ {score.hits} hits</span>
        <span className="text-gray-500 text-xs tracking-widest">
          PRESS SPACE / TAP when you see <strong className="text-white">X</strong>
        </span>
        <span className="text-rose-400 text-sm font-semibold">✗ {score.errors} errors</span>
      </div>

      {/* Main stimulus */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10">
        <div
          className={`w-72 h-72 flex items-center justify-center rounded-3xl border-4 shadow-2xl transition-all duration-100 ${boxStyle}`}
        >
          <span
            className={`font-bold font-mono leading-none transition-all duration-75 ${
              letter
                ? isX
                  ? 'text-white text-[9rem]'
                  : 'text-gray-300 text-[9rem]'
                : 'opacity-0 text-[9rem]'
            }`}
          >
            {letter ?? 'X'}
          </span>
        </div>

        {/* Flash label */}
        <div className="h-8 flex items-center justify-center">
          {flash === 'hit' && (
            <span className="text-emerald-400 text-lg font-bold tracking-wider">✓ CORRECT!</span>
          )}
          {flash === 'miss' && (
            <span className="text-rose-400 text-lg font-bold tracking-wider">✗ WRONG</span>
          )}
        </div>

        {/* Tap button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            tap()
          }}
          className="px-16 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xl font-bold transition-all shadow-xl select-none"
        >
          TAP / SPACE
        </button>
      </div>

      {/* EEG */}
      <div className="px-6 pb-5 border-t border-gray-800 pt-4">
        <p className="text-gray-600 text-xs mb-3 tracking-widest uppercase">Live EEG Signal</p>
        <div className="flex gap-3 items-end" style={{ height: 64 }}>
          {BANDS.map((band) => {
            const value = eeg ? eeg[band] : 0
            return (
              <div key={band} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gray-800 rounded overflow-hidden relative"
                  style={{ height: 48 }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded transition-all duration-200"
                    style={{
                      height: `${Math.round(value * 100)}%`,
                      backgroundColor: BAND_COLORS[band],
                    }}
                  />
                </div>
                <span className="text-gray-600 text-[9px] uppercase">{band}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
