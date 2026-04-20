'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import {
  ArrowLeft,
  Trophy,
  FileText,
  Download,
  Loader2,
  Eye,
  Zap,
  Navigation,
  Layers,
  HeartPulse,
  BarChart3,
  Lightbulb,
} from 'lucide-react'
import type { DbSession, GameResult, GameType } from '@/lib/games/types'
import { GAME_CONFIG } from '@/lib/games/config'
import { generateTipsFromResults } from '@/lib/games/med-coach/tips'
import { Button } from '@/components/ui/button'

// ─── Dynamic radar chart (recharts needs DOM) ─────────────────────────────────

const RadarWidget = dynamic(() => import('./RadarWidget'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
    </div>
  ),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GAME_ICONS: Record<GameType, React.ElementType> = {
  glaucoma: Eye,
  adhd: Zap,
  labyrinth: Navigation,
  'memory-cards': Layers,
  'med-coach': HeartPulse,
}

function scoreColor(s: number) {
  if (s >= 80) return 'text-emerald-600'
  if (s >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function scoreBg(s: number) {
  if (s >= 80) return 'bg-emerald-500'
  if (s >= 60) return 'bg-amber-500'
  return 'bg-red-400'
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResultsContent({ session }: { session: DbSession }) {
  const results = session.game_results as GameResult[]
  const tips = generateTipsFromResults(results)

  const overallScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : null

  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const handlePdf = useCallback(async () => {
    setPdfLoading(true)
    setPdfError(null)
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Unknown error')
      setPdfUrl(json.url)
      window.open(json.url, '_blank')
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF generation failed')
    } finally {
      setPdfLoading(false)
    }
  }, [session.id])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-16">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Hero score */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center mb-6 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 mb-4">
          <Trophy className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Session Complete</h1>
        <p className="text-slate-500 text-sm mb-6">
          {new Date(session.started_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {overallScore !== null ? (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">
              Overall Score
            </p>
            <p className={`text-7xl font-extrabold ${scoreColor(overallScore)}`}>{overallScore}</p>
            <p className="text-slate-400 text-sm mt-1">out of 100</p>
          </>
        ) : (
          <p className="text-slate-400">No results recorded yet.</p>
        )}
      </div>

      {/* Radar chart */}
      {results.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Cognitive Domain Profile</h2>
          </div>
          <RadarWidget results={results} />
        </div>
      )}

      {/* Per-game score cards */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Game Breakdown</h2>
          </div>
          <div className="flex flex-col gap-4">
            {results.map((result) => {
              const config = GAME_CONFIG[result.gameType]
              const Icon = GAME_ICONS[result.gameType]
              if (!config) return null
              return (
                <div key={result.gameType} className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border ${config.bgColor} ${config.borderColor}`}
                  >
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-800">
                        {config.shortLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDuration(result.durationMs)}
                        </span>
                        <span className={`text-sm font-bold ${scoreColor(result.score)}`}>
                          {result.score}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${scoreBg(result.score)}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Med-Coach tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-slate-900 text-sm">
              Personalised Health Recommendations
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
              >
                <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">💡</span>
                <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm">Full PDF Report</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          5-page detailed report with visual field maps, domain analysis, and personalised coaching.
        </p>

        {pdfError && <p className="text-xs text-red-500 mb-3">{pdfError}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handlePdf} disabled={pdfLoading} className="gap-2">
            {pdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : pdfUrl ? (
              <>
                <Download className="h-4 w-4" />
                Download Again
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Download PDF Report
              </>
            )}
          </Button>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Open in new tab
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
