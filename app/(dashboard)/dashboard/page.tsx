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
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
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
    <div className="flex flex-col gap-8">
      {/* ── Welcome + CTA ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName} 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">Ready for today&apos;s session?</p>
          </div>
        </div>

        <Link
          href="/session/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                     text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200
                     transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Link>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-2xl font-bold text-slate-900">{completedSessions.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Sessions completed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p
            className={`text-2xl font-bold ${avgScore !== null ? scoreColor(avgScore) : 'text-slate-900'}`}
          >
            {avgScore !== null ? avgScore : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Average score</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-slate-900">
            {sessions.filter((s) => s.status === 'in_progress').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">In progress</p>
        </div>
      </div>

      {/* ── Session history ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Session History</h2>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <Brain className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No sessions yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Start your first diagnostic session to see results here.
            </p>
            <Link
              href="/session/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Create first session
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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
                  className="group bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4
                             hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {gameLabels || 'Session'}
                      </p>
                      <span
                        className={[
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                          isComplete
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700',
                        ].join(' ')}
                      >
                        {isComplete ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(session.created_at)}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {session.overall_score !== null ? (
                      <span className={`text-lg font-bold ${scoreColor(session.overall_score)}`}>
                        {session.overall_score}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
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
