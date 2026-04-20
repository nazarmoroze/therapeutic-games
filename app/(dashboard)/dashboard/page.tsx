import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Brain, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import type { DbSession } from '@/lib/games/types'
import { GAME_CONFIG } from '@/lib/games/config'

export const metadata = {
  title: 'Dashboard — Therapeutic Games',
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-[#34d399]' // success green
  if (score >= 60) return 'text-[#f59e0b]' // warning amber
  return 'text-[#ff4d4d]' // destructive
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type SessionRow = Pick<
  DbSession,
  'id' | 'status' | 'overall_score' | 'selected_games' | 'created_at' | 'completed_at'
>

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, sessionsResult] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
    supabase
      .from('sessions')
      .select('id, status, overall_score, selected_games, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const profile = profileResult.data
  const sessions: SessionRow[] = (sessionsResult.data ?? []) as SessionRow[]

  const firstName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions
            .filter((s) => s.overall_score !== null)
            .reduce((sum, s) => sum + (s.overall_score ?? 0), 0) /
            (completedSessions.filter((s) => s.overall_score !== null).length || 1)
        )
      : null

  return (
    <div className="flex flex-col gap-10">
      {/* ── Welcome + CTA ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[var(--foreground)]">
            Hello, {firstName}
          </h1>
          <p className="text-[var(--muted-foreground)] text-base md:text-lg font-medium tracking-tight">
            Ready for today&apos;s brain activity session?
          </p>
        </div>

        <Link
          href="/session/new"
          className="inline-flex items-center justify-center gap-3 bg-[var(--primary)] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[var(--primary-hover)] transition-all shadow-xl shadow-[var(--primary)]/10 self-start md:self-auto shrink-0"
        >
          <Plus className="h-5 w-5" />
          Start Session
        </Link>
      </div>

      {/* ── Main Dashboard Split ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main large card */}
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden group border-white/80">
          {/* Subtle bg glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />

          <div className="z-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/60 shadow-lg border border-white flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-[var(--foreground)] opacity-90" />
            </div>
            <div className="space-y-1">
              <p className="text-[var(--muted-foreground)] text-xs font-bold tracking-[0.2em] uppercase">
                AVERAGE FOCUS
              </p>
              <h2
                className={`text-[5rem] leading-none tracking-tighter font-extrabold ${avgScore !== null ? scoreColor(avgScore) : 'text-[var(--foreground)]'}`}
              >
                {avgScore !== null ? `${avgScore}%` : '—'}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel p-8 rounded-[2.5rem] flex items-center justify-between border-white/80">
            <div className="space-y-1">
              <p className="text-[var(--muted-foreground)] text-xs font-bold tracking-[0.2em] uppercase">
                SESSIONS
              </p>
              <p className="text-4xl font-extrabold text-[var(--foreground)] tracking-tighter">
                {completedSessions.length}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center border border-white shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-[var(--muted-foreground)] opacity-70" />
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] flex-1 flex flex-col justify-center border-white/80">
            <p className="text-[var(--muted-foreground)] text-xs font-bold tracking-[0.2em] uppercase mb-2">
              IMPULSE LATENCY
            </p>
            <p className="text-4xl font-extrabold text-[var(--foreground)] tracking-tighter flex items-end gap-2">
              142 <span className="text-lg text-[var(--muted-foreground)] mb-1">ms</span>
            </p>
            <div className="h-1.5 w-full bg-[#18191B]/10 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-[var(--foreground)] w-[75%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Session history ───────────────────────────────────────────── */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--muted-foreground)] uppercase">
            Session History
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-[2rem] border-white/60 px-6 py-16 text-center">
            <Brain className="h-12 w-12 text-[var(--muted-foreground)] opacity-30 mx-auto mb-4" />
            <p className="text-[var(--foreground)] font-medium">No sessions yet</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">
              Start your first diagnostic session to see results here.
            </p>
            <Link
              href="/session/new"
              className="inline-flex items-center gap-2 bg-white/60 text-[var(--foreground)] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-sm border border-white hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              Create first session
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => {
              const games = (session.selected_games ?? []) as string[]
              const gameLabels = games
                .map((g) => GAME_CONFIG[g as keyof typeof GAME_CONFIG]?.shortLabel ?? g)
                .join(', ')

              const isComplete = session.status === 'completed'
              const href = isComplete
                ? `/session/${session.id}/results`
                : `/session/${session.id}/play`

              return (
                <Link
                  key={session.id}
                  href={href}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[1.5rem] glass-panel border-white/80 hover:bg-white/50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Status icon / left side */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm border border-white ${
                        isComplete
                          ? 'bg-[#34d399]/10 text-[#34d399]'
                          : 'bg-white/80 text-[var(--foreground)]'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6 opacity-70" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--foreground)] tracking-tight">
                          {gameLabels || 'Session'}
                        </span>
                        {!isComplete && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--foreground)] text-white text-[10px] font-bold tracking-wider uppercase">
                            Resume
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[var(--muted-foreground)]">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Score & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-32">
                    {session.overall_score !== null ? (
                      <span
                        className={`text-2xl font-extrabold tracking-tighter ${scoreColor(session.overall_score)}`}
                      >
                        {session.overall_score}%
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-[var(--muted-foreground)]">—</span>
                    )}

                    <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
