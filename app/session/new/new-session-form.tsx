'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  Zap,
  Navigation,
  Layers,
  HeartPulse,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { createSessionAction } from '@/app/actions/session'
import { useSessionStore } from '@/store/sessionStore'
import { GAME_ORDER, GAME_CONFIG } from '@/lib/games/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { GameType, Gender, PatientInfo } from '@/lib/games/types'

// ─── Icon map ──────────────��───────────────────────���────────────────────────

const GAME_ICONS: Record<GameType, React.ElementType> = {
  glaucoma: Eye,
  adhd: Zap,
  labyrinth: Navigation,
  'memory-cards': Layers,
  'med-coach': HeartPulse,
}

// ─── Component ─────────────────────────────���────────────────────────────────

export function NewSessionForm() {
  const router = useRouter()
  const initSession = useSessionStore((s) => s.initSession)

  // Onboarding state
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('prefer_not_to_say')
  const [hasGlasses, setHasGlasses] = useState(false)

  // Game selection
  const [selectedGames, setSelectedGames] = useState<GameType[]>([])

  // Submission
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleGame(game: GameType) {
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    )
  }

  // Keep selection order matching GAME_ORDER for consistent UX
  const orderedSelection = GAME_ORDER.filter((g) => selectedGames.includes(g))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Enter a valid age between 1 and 120.')
      return
    }
    if (selectedGames.length === 0) {
      setError('Select at least one game to continue.')
      return
    }

    setSubmitting(true)

    const patientInfo: PatientInfo = { age: ageNum, gender, hasGlasses }

    const result = await createSessionAction({ patientInfo, selectedGames: orderedSelection })

    if ('error' in result) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    initSession(result.sessionId, patientInfo, orderedSelection)
    router.push(`/session/${result.sessionId}/play`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Diagnostic Session</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in patient details and select the games to run.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* ── Section 1: Patient info ──────────────��──────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Patient Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Anonymous demographics for result calibration.
            </p>
          </div>

          {/* Age */}
          <Input
            label="Age"
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 34"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="max-w-[160px]"
          />

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Gender</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  ['male', 'Male'],
                  ['female', 'Female'],
                  ['other', 'Other'],
                  ['prefer_not_to_say', 'Prefer not to say'],
                ] as [Gender, string][]
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={[
                    'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors',
                    gender === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={gender === value}
                    onChange={() => setGender(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Glasses */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              className={[
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                hasGlasses
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-slate-300 hover:border-slate-400',
              ].join(' ')}
            >
              {hasGlasses && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={hasGlasses}
              onChange={(e) => setHasGlasses(e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-slate-700">Wears glasses or contacts</p>
              <p className="text-xs text-slate-400">Relevant for the glaucoma screening game.</p>
            </div>
          </label>
        </div>

        {/* ── Section 2: Game selection ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Select Games</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose one or more games for this session.
              </p>
            </div>
            <span
              className={[
                'text-xs font-medium px-2 py-1 rounded-full',
                selectedGames.length > 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {selectedGames.length} selected
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {GAME_ORDER.map((gameType) => {
              const config = GAME_CONFIG[gameType]
              const Icon = GAME_ICONS[gameType]
              const selected = selectedGames.includes(gameType)

              return (
                <button
                  key={gameType}
                  type="button"
                  onClick={() => toggleGame(gameType)}
                  className={[
                    'relative text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all',
                    selected
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {/* Selection indicator */}
                  <div className="absolute top-3 right-3">
                    {selected ? (
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                  >
                    <Icon className={`h-4 w-4 ${config.textColor}`} />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 pr-4">
                    <p
                      className={[
                        'text-sm font-semibold leading-tight',
                        selected ? 'text-indigo-900' : 'text-slate-900',
                      ].join(' ')}
                    >
                      {config.shortLabel}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 mt-4 glass-panel p-6 rounded-[2.5rem] border-white/80">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors tracking-wide px-4"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="lg"
            disabled={selectedGames.length === 0 || submitting}
            loading={submitting}
            className="min-w-[200px]"
          >
            {submitting
              ? 'Starting…'
              : `Start Session • ${orderedSelection.length} game${orderedSelection.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </form>
    </div>
  )
}
