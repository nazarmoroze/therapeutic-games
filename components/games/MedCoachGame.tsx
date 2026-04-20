'use client'

import { useState, useCallback } from 'react'
import type { GameProps, MedCoachRawData, GameResult, GameType } from '@/lib/games/types'
import { QUESTIONS } from '@/lib/games/med-coach/questions'
import { useSessionStore } from '@/store/sessionStore'

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreMedCoach(correct: number, total: number): number {
  return Math.round((correct / total) * 100)
}

// ─── Tips engine ─────────────────────────────────────────────────────────────

function buildTopicScores(answers: boolean[]): Record<string, number> {
  const totals: Record<string, number> = {}
  const correct: Record<string, number> = {}
  QUESTIONS.forEach((q, i) => {
    totals[q.topic] = (totals[q.topic] ?? 0) + 1
    if (answers[i]) correct[q.topic] = (correct[q.topic] ?? 0) + 1
  })
  return Object.fromEntries(
    Object.keys(totals).map((t) => [t, Math.round(((correct[t] ?? 0) / totals[t]) * 100)])
  )
}

function generateTips(
  gameResults: Partial<Record<GameType, GameResult>>,
  quizAnswers: boolean[]
): string[] {
  const tips: string[] = []

  const g = gameResults['glaucoma']
  if (g && g.score < 70) {
    tips.push(
      'Your visual field test showed some irregularities. Schedule a comprehensive eye exam — early glaucoma has no symptoms.'
    )
  } else if (!g) {
    tips.push(
      "Regular eye check-ups (every 1–2 years after 40) are key for catching glaucoma early, when it's most treatable."
    )
  }

  const a = gameResults['adhd']
  if (a && a.score < 65) {
    tips.push(
      'Your attention scores suggest difficulty with sustained focus. Aerobic exercise, sleep hygiene, and mindfulness have the strongest evidence for improving attention.'
    )
  }

  const l = gameResults['labyrinth']
  if (l && l.score < 60) {
    tips.push(
      'Spatial reasoning can be strengthened through regular puzzles, navigation tasks, and learning new skills that challenge the brain.'
    )
  }

  const m = gameResults['memory-cards']
  if (m && m.score < 65) {
    tips.push(
      'Working memory is highly sensitive to sleep quality. 7–9 hours of sleep, especially REM sleep, is when memories are consolidated.'
    )
  }

  // Quiz-based tips
  const wrongVision =
    quizAnswers.slice(4, 5).includes(false) || quizAnswers.slice(8, 9).includes(false)
  if (wrongVision) {
    tips.push(
      'Vision health tip: Peripheral vision loss is an early glaucoma sign, and eye exams every 1–2 years are recommended after age 40.'
    )
  }

  const wrongSleep = quizAnswers[0] === false || quizAnswers[7] === false
  if (wrongSleep) {
    tips.push(
      'Sleep tip: Adults need 7–9 hours. REM sleep is critical for memory consolidation — poor sleep accelerates cognitive decline.'
    )
  }

  if (tips.length === 0) {
    tips.push(
      'Great results across the board! Keep up regular exercise, quality sleep, and mental stimulation to maintain cognitive health.'
    )
  }

  return tips
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MedCoachGame({ onResult }: GameProps) {
  const gameResults = useSessionStore((s) => s.gameResults)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [phase, setPhase] = useState<'quiz' | 'results'>('quiz')
  const [startMs] = useState(Date.now)

  const question = QUESTIONS[qIndex]
  const isLast = qIndex === QUESTIONS.length - 1

  const handleSelect = useCallback(
    (optIdx: number) => {
      if (confirmed) return
      setSelected(optIdx)
    },
    [confirmed]
  )

  const handleConfirm = useCallback(() => {
    if (selected === null) return
    const correct = selected === question.correct
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)
    setConfirmed(true)

    if (isLast) {
      setTimeout(() => setPhase('results'), 1000)
    }
  }, [selected, question, answers, isLast])

  const handleNext = useCallback(() => {
    setQIndex((i) => i + 1)
    setSelected(null)
    setConfirmed(false)
  }, [])

  const handleFinish = useCallback(() => {
    const correctCount = answers.filter(Boolean).length
    const topicScores = buildTopicScores(answers)
    const durationMs = Date.now() - startMs
    const rawData: MedCoachRawData = {
      questionsAnswered: QUESTIONS.length,
      correctAnswers: correctCount,
      timePerQuestionMs: [],
      topicScores,
    }
    onResult({ score: scoreMedCoach(correctCount, QUESTIONS.length), durationMs, rawData })
  }, [answers, startMs, onResult])

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === 'results') {
    const correctCount = answers.filter(Boolean).length
    const pct = Math.round((correctCount / QUESTIONS.length) * 100)
    const tips = generateTips(gameResults, answers)

    return (
      <div className="flex flex-col gap-5 max-w-lg mx-auto py-4 px-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">
            Quiz Complete
          </p>
          <p className="text-4xl font-extrabold text-slate-900 mb-1">
            {pct}
            <span className="text-xl text-slate-400">/100</span>
          </p>
          <p className="text-slate-500 text-sm">
            {correctCount} of {QUESTIONS.length} correct
          </p>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-slate-900 text-sm tracking-wide uppercase">
            Personalised Health Tips
          </h3>
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4">
              <span className="text-rose-500 text-lg flex-shrink-0">💡</span>
              <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
        >
          Finish Session
        </button>
      </div>
    )
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto py-4 px-2">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${(qIndex / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">
          {qIndex + 1}/{QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-rose-400 mb-3">
          {question.topic}
        </p>
        <p className="text-slate-900 font-medium text-base leading-snug">{question.text}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          let style =
            'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
          if (selected === i && !confirmed)
            style = 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
          if (confirmed && i === question.correct)
            style = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
          if (confirmed && selected === i && i !== question.correct)
            style = 'border-red-400 bg-red-50 text-red-700'

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${style}`}
            >
              <span className="font-mono text-xs mr-2 text-slate-400">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Action */}
      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={selected === null}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold transition-colors"
        >
          Confirm Answer
        </button>
      ) : (
        <button
          onClick={isLast ? undefined : handleNext}
          disabled={isLast}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          {isLast ? 'Calculating results…' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}
