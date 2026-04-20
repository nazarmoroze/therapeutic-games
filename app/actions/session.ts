'use server'

import { createClient } from '@/lib/supabase/server'
import type { CreateSessionInput, GameResult, GameType, DbSession } from '@/lib/games/types'

// ─── Create a new session ────────────────────────────────────────────────────

export async function createSessionAction(
  input: CreateSessionInput
): Promise<{ sessionId: string } | { error: string }> {
  const { patientInfo, selectedGames } = input

  if (selectedGames.length === 0) {
    return { error: 'Select at least one game.' }
  }
  if (patientInfo.age < 1 || patientInfo.age > 120) {
    return { error: 'Age must be between 1 and 120.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      status: 'in_progress',
      patient_age: patientInfo.age,
      patient_gender: patientInfo.gender,
      has_glasses: patientInfo.hasGlasses,
      selected_games: selectedGames,
      game_results: [],
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('createSession:', error)
    return { error: 'Failed to create session. Please try again.' }
  }

  return { sessionId: data.id }
}

// ─── Save a single game result + advance session ────────────────────────────

export async function saveGameResultAction(
  sessionId: string,
  result: GameResult
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  // Fetch current game_results array
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('game_results, selected_games')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !session) return { error: 'Session not found.' }

  const updatedResults: GameResult[] = [...(session.game_results as GameResult[]), result]

  const allDone = updatedResults.length >= (session.selected_games as GameType[]).length
  const overallScore = allDone
    ? Math.round(updatedResults.reduce((s, r) => s + r.score, 0) / updatedResults.length)
    : null

  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      game_results: updatedResults,
      ...(allDone && {
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_score: overallScore,
      }),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (updateError) return { error: updateError.message }
  return {}
}

// ─── Fetch a single session (for play/results pages) ────────────────────────

export async function getSessionAction(
  sessionId: string
): Promise<{ session: DbSession } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return { error: 'Session not found.' }

  return { session: data as DbSession }
}

// ─── List sessions for the current user ────────────────────────────────────

export async function listSessionsAction(): Promise<
  | {
      sessions: Pick<
        DbSession,
        'id' | 'status' | 'overall_score' | 'selected_games' | 'created_at' | 'completed_at'
      >[]
    }
  | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { data, error } = await supabase
    .from('sessions')
    .select('id, status, overall_score, selected_games, created_at, completed_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return { error: error.message }

  return { sessions: (data ?? []) as DbSession[] }
}
