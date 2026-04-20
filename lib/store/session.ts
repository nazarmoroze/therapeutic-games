import { create } from 'zustand'
import type { GameSession, GameType, GameResult } from '@/types'

interface SessionStore {
  currentSession: GameSession | null
  isPlaying: boolean
  startSession: (gameType: GameType, userId: string) => void
  endSession: (results: GameResult) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSession: null,
  isPlaying: false,

  startSession: (gameType, userId) =>
    set({
      isPlaying: true,
      currentSession: {
        id: crypto.randomUUID(),
        user_id: userId,
        game_type: gameType,
        started_at: new Date().toISOString(),
      },
    }),

  endSession: (results) =>
    set((state) => ({
      isPlaying: false,
      currentSession: state.currentSession
        ? { ...state.currentSession, completed_at: new Date().toISOString(), results }
        : null,
    })),

  resetSession: () => set({ currentSession: null, isPlaying: false }),
}))
