export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export interface GameSession {
  id: string
  user_id: string
  game_type: GameType
  started_at: string
  completed_at?: string
  results?: GameResult
  pdf_url?: string
}

export type GameType = 'emotional-recognition' | 'breathing' | 'attention' | 'memory'

export interface GameResult {
  score: number
  duration_seconds: number
  metrics: Record<string, number>
  raw_data?: unknown
}

export interface Report {
  session: GameSession
  user: User
  generated_at: string
}
