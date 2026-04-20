'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameProps, MemoryCardsRawData } from '@/lib/games/types'

// ─── Config ──────────────────────────────────────────────────────────────────

const SYMBOLS = ['🌟', '🎯', '🎸', '🌈', '🦋', '🎭', '🏆', '🎪']
const FLIP_BACK_DELAY = 900 // ms before non-matching pair flips back

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreMemory(data: MemoryCardsRawData): number {
  const minAttempts = data.totalPairs
  const efficiency = Math.min(1, minAttempts / Math.max(minAttempts, data.attempts))
  const timeScore = Math.max(0, 1 - data.completionTimeMs / 120_000)
  const streakBonus = Math.min(0.15, data.longestMatchStreak * 0.03)
  return Math.round(Math.min(100, (efficiency * 0.55 + timeScore * 0.3 + streakBonus) * 100 + 15))
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Card {
  id: number
  symbol: string
  faceUp: boolean
  matched: boolean
}

function buildDeck(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((symbol, id) => ({ id, symbol, faceUp: false, matched: false }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MemoryCardsGame({ onResult }: GameProps) {
  const [cards, setCards] = useState<Card[]>(() => buildDeck())
  const [flipped, setFlipped] = useState<number[]>([]) // ids of face-up unmatched cards
  const [disabled, setDisabled] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [matched, setMatched] = useState(0)
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  const handleClick = useCallback(
    (id: number) => {
      if (disabled) return
      const card = cards.find((c) => c.id === id)
      if (!card || card.faceUp || card.matched) return
      if (flipped.length >= 2) return

      const newFlipped = [...flipped, id]
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, faceUp: true } : c)))
      setFlipped(newFlipped)

      if (newFlipped.length === 2) {
        setAttempts((a) => a + 1)
        setDisabled(true)

        const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!)
        const isMatch = a.symbol === b.symbol

        setTimeout(() => {
          if (isMatch) {
            setCards((prev) =>
              prev.map((c) => (newFlipped.includes(c.id) ? { ...c, matched: true } : c))
            )
            setMatched((m) => m + 1)
            setStreak((s) => {
              const next = s + 1
              setBestStreak((bs) => Math.max(bs, next))
              return next
            })
          } else {
            setCards((prev) =>
              prev.map((c) => (newFlipped.includes(c.id) ? { ...c, faceUp: false } : c))
            )
            setStreak(0)
          }
          setFlipped([])
          setDisabled(false)
        }, FLIP_BACK_DELAY)
      }
    },
    [cards, disabled, flipped]
  )

  // Check completion
  useEffect(() => {
    if (matched < SYMBOLS.length || doneRef.current) return
    doneRef.current = true
    const durationMs = Date.now() - startRef.current
    const rawData: MemoryCardsRawData = {
      totalPairs: SYMBOLS.length,
      attempts,
      completionTimeMs: durationMs,
      longestMatchStreak: bestStreak,
    }
    onResult({ score: scoreMemory(rawData), durationMs, rawData })
  }, [matched, attempts, bestStreak, onResult])

  const totalPairs = SYMBOLS.length
  const progress = Math.round((matched / totalPairs) * 100)

  return (
    <div className="flex flex-col items-center gap-4 py-4 select-none">
      {/* Stats bar */}
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <span className="text-sm text-slate-500">
          Pairs:{' '}
          <b className="text-slate-800">
            {matched}/{totalPairs}
          </b>
        </span>
        <span className="text-sm text-slate-500">
          Attempts: <b className="text-slate-800">{attempts}</b>
        </span>
        <span className="text-sm text-slate-500">
          Streak: <b className="text-amber-600">{streak}</b>
        </span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-[480px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-[480px]">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            className="aspect-square"
            style={{ perspective: '600px' }}
            aria-label={card.faceUp || card.matched ? card.symbol : 'Hidden card'}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.4s ease',
                transform: card.faceUp || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Back face */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center"
              >
                <span className="text-slate-400 text-xl font-bold">?</span>
              </div>

              {/* Front face */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className={[
                  'absolute inset-0 rounded-xl border-2 flex items-center justify-center text-2xl transition-colors',
                  card.matched
                    ? 'border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100'
                    : 'border-violet-400 bg-violet-50',
                ].join(' ')}
              >
                {card.symbol}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
