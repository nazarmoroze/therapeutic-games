// ─── Game slug identifiers ──────────────────────────────────────────────────

export type GameType = 'glaucoma' | 'adhd' | 'labyrinth' | 'memory-cards' | 'med-coach'

// ─── Patient demographics ───────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface PatientInfo {
  age: number
  gender: Gender
  hasGlasses: boolean
}

// ─── Session status ─────────────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'onboarding' | 'playing' | 'completed'

// ─── Game-specific raw data ─────────────────────────────────────────────────

export interface GlaucomaRawData {
  responseTimesMs: number[]
  missedTargets: number
  falsePositives: number
  /** 8x8 grid sensitivity map (0–4 scale per cell) */
  visualFieldMap: number[][]
}

export interface AdhdRawData {
  reactionTimesMs: number[]
  omissionErrors: number // missed targets
  commissionErrors: number // false presses
  sustainedAttentionScore: number // 0–100
  eegStream?: import('./neiry/types').EegSample[]
}

export interface LabyrinthRawData {
  completionTimeMs: number
  wrongTurns: number
  hintsUsed: number
  levelReached: number
}

export interface MemoryCardsRawData {
  totalPairs: number
  attempts: number
  completionTimeMs: number
  longestMatchStreak: number
}

export interface MedCoachRawData {
  questionsAnswered: number
  correctAnswers: number
  timePerQuestionMs: number[]
  topicScores: Record<string, number>
}

export type RawData =
  | GlaucomaRawData
  | AdhdRawData
  | LabyrinthRawData
  | MemoryCardsRawData
  | MedCoachRawData

// ─── Game result (one per completed game) ──────────────────────────────────

export interface GameResult {
  gameType: GameType
  score: number // 0–100
  durationMs: number
  completedAt: string // ISO timestamp
  rawData: RawData
}

// ─── Props injected into every game component ───────────────────────────────

export interface GameProps {
  patientInfo: PatientInfo
  onResult: (result: Omit<GameResult, 'gameType' | 'completedAt'>) => void
}

// ─── Database row shape (mirrors public.sessions) ──────────────────────────

export interface DbSession {
  id: string
  user_id: string
  status: 'in_progress' | 'completed'
  patient_age: number | null
  patient_gender: string | null
  has_glasses: boolean
  selected_games: GameType[]
  game_results: GameResult[]
  overall_score: number | null
  started_at: string
  completed_at: string | null
  pdf_url: string | null
  created_at: string
}

// ─── Create session input ───────────────────────────────────────────────────

export interface CreateSessionInput {
  patientInfo: PatientInfo
  selectedGames: GameType[]
}
