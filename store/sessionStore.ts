import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { GameType, GameResult, PatientInfo, SessionStatus } from '@/lib/games/types'

// ─── State shape ────────────────────────────────────────────────────────────

export interface SessionState {
  // Persisted identifiers
  sessionId: string | null
  patientInfo: PatientInfo | null
  selectedGames: GameType[]

  // Runtime progress
  currentGameIndex: number
  gameResults: Partial<Record<GameType, GameResult>>
  status: SessionStatus

  // Actions
  initSession: (sessionId: string, patientInfo: PatientInfo, selectedGames: GameType[]) => void
  recordResult: (result: GameResult) => void
  nextGame: () => void
  reset: () => void
}

// ─── Derived helpers (not in store, import alongside) ───────────────────────

export function currentGame(state: SessionState): GameType | null {
  return state.selectedGames[state.currentGameIndex] ?? null
}

export function isLastGame(state: SessionState): boolean {
  return state.currentGameIndex >= state.selectedGames.length - 1
}

export function completedResults(state: SessionState): GameResult[] {
  return state.selectedGames
    .map((g) => state.gameResults[g])
    .filter((r): r is GameResult => r !== undefined)
}

export function overallScore(state: SessionState): number | null {
  const results = completedResults(state)
  if (results.length === 0) return null
  return Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
}

// ─── Store ──────────────────────────────────────────────────────────────────

const initialState = {
  sessionId: null,
  patientInfo: null,
  selectedGames: [] as GameType[],
  currentGameIndex: 0,
  gameResults: {} as Partial<Record<GameType, GameResult>>,
  status: 'idle' as SessionStatus,
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      ...initialState,

      initSession: (sessionId, patientInfo, selectedGames) =>
        set(
          {
            sessionId,
            patientInfo,
            selectedGames,
            currentGameIndex: 0,
            gameResults: {},
            status: 'playing',
          },
          false,
          'initSession'
        ),

      recordResult: (result) =>
        set(
          (state) => ({
            gameResults: {
              ...state.gameResults,
              [result.gameType]: result,
            },
          }),
          false,
          'recordResult'
        ),

      nextGame: () =>
        set(
          (state) => {
            const nextIndex = state.currentGameIndex + 1
            const isComplete = nextIndex >= state.selectedGames.length
            return {
              currentGameIndex: isComplete ? state.currentGameIndex : nextIndex,
              status: isComplete ? 'completed' : 'playing',
            }
          },
          false,
          'nextGame'
        ),

      reset: () => set({ ...initialState }, false, 'reset'),
    }),
    { name: 'session-store' }
  )
)
