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

const RadarWidget = dynamic(() => import('./RadarWidget'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
    </div>
  ),
})

const GAME_ICONS: Record<GameType, React.ElementType> = {
  glaucoma: Eye,
  adhd: Zap,
  labyrinth: Navigation,
  'memory-cards': Layers,
  'med-coach': HeartPulse,
}

function scoreColor(s: number) {
  if (s >= 80) return 'text-[#34d399]'
  if (s >= 60) return 'text-[#fbbf24]'
  return 'text-[#f87171]'
}

function scoreBg(s: number) {
  if (s >= 80) return 'bg-[#34d399]'
  if (s >= 60) return 'bg-[#fbbf24]'
  return 'bg-[#f87171]'
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

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
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24 relative">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[var(--primary)]/5 blur-[120px] pointer-events-none -z-10" />

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-10 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>

      {/* Hero score */}
      <div className="glass-panel p-10 text-center mb-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6 shadow-[0_0_30px_var(--primary)]/20 group-hover:scale-110 transition-transform duration-500">
          <Trophy className="h-10 w-10 text-[var(--primary)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-[var(--foreground)] mb-2">
          Diagnostic Complete
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm font-medium mb-10">
          {new Date(session.started_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {overallScore !== null ? (
          <div className="relative inline-block">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[var(--muted-foreground)] mb-2">
              System Wide Score
            </p>
            <p
              className={`text-[8rem] leading-none font-black tracking-tighter ${scoreColor(overallScore)} drop-shadow-2xl`}
            >
              {overallScore}
            </p>
            <p className="text-[var(--muted-foreground)] font-medium text-sm mt-2 tracking-widest uppercase">
              / 100
            </p>
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)] font-medium">
            Processing sequence incomplete.
          </p>
        )}
      </div>

      {/* Radar chart */}
      {results.length >= 2 && (
        <div className="glass-panel p-8 mb-8 backdrop-blur-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-[var(--foreground)]" />
            </div>
            <h2 className="font-extrabold tracking-tight text-[var(--foreground)] text-xl">
              Cognitive Profile Mapping
            </h2>
          </div>
          <div className="bg-[var(--foreground)]/[0.02] rounded-3xl p-4 border border-[var(--foreground)]/5 shadow-inner">
            <RadarWidget results={results} />
          </div>
        </div>
      )}

      {/* Per-game score cards */}
      {results.length > 0 && (
        <div className="glass-panel p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <h2 className="font-extrabold tracking-tight text-[var(--foreground)] text-xl">
              Sub-System Breakdown
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            {results.map((result) => {
              const config = GAME_CONFIG[result.gameType]
              const Icon = GAME_ICONS[result.gameType]
              if (!config) return null
              return (
                <div key={result.gameType} className="flex gap-5 group items-center">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-6 w-6 text-[var(--foreground)]`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-extrabold tracking-tight text-[var(--foreground)]">
                        {config.shortLabel}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
                          {formatDuration(result.durationMs)}
                        </span>
                        <span
                          className={`text-2xl font-black ${scoreColor(result.score)} tracking-tighter drop-shadow-md`}
                        >
                          {result.score}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden shadow-inner flex">
                      <div
                        className={`h-full rounded-r-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_currentColor] ${scoreBg(result.score)}`}
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
        <div className="glass-panel p-8 mb-8 border-l-4 border-l-[#ff3b3b]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#ff3b3b]/10 flex items-center justify-center shadow-[0_0_15px_#ff3b3b]/20">
              <Lightbulb className="h-4 w-4 text-[#ff3b3b]" />
            </div>
            <h2 className="font-extrabold tracking-tight text-[var(--foreground)] text-xl">
              Coaching Synthesis
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-4 bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/5 rounded-2xl p-5 hover:bg-[var(--foreground)]/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#ff3b3b]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#ff3b3b] text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF section */}
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center">
            <FileText className="h-4 w-4 text-[var(--foreground)]" />
          </div>
          <h2 className="font-extrabold tracking-tight text-[var(--foreground)] text-xl">
            Extract Data
          </h2>
        </div>
        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-6 leading-relaxed">
          Initialize PDF generation sequence to extract a comprehensive 5-page clinical schematic
          containing biometric maps, performance matrices, and synthesis logs.
        </p>

        {pdfError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl tracking-tight mb-5 text-sm font-bold">
            [ERR] {pdfError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--foreground)]/10 mt-6">
          <Button
            onClick={handlePdf}
            disabled={pdfLoading}
            className="gap-2 h-14 px-8 text-sm font-bold tracking-widest uppercase drop-shadow-xl shadow-[var(--primary)]/20 hover:scale-105 active:scale-95 transition-all"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download schematic
              </>
            )}
          </Button>
          {pdfUrl && (
            <Link
              href={pdfUrl}
              target="_blank"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-4 py-2 bg-[var(--foreground)]/[0.05] rounded-full transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview PDF
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
