import type { GameType } from './types'

export interface GameConfig {
  label: string
  shortLabel: string
  description: string
  iconName: string // lucide icon name — imported in UI layer
  accentColor: string
  bgColor: string
  borderColor: string
  textColor: string
}

export const GAME_CONFIG: Record<GameType, GameConfig> = {
  glaucoma: {
    label: 'Glaucoma Screening',
    shortLabel: 'Glaucoma',
    description: 'Visual field test that screens for early glaucoma indicators.',
    iconName: 'Eye',
    accentColor: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-600',
  },
  adhd: {
    label: 'ADHD Assessment',
    shortLabel: 'ADHD',
    description: 'Sustained attention task measuring focus and impulse control.',
    iconName: 'Zap',
    accentColor: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
  },
  labyrinth: {
    label: 'Labyrinth Navigation',
    shortLabel: 'Labyrinth',
    description: 'Spatial reasoning maze that evaluates cognitive flexibility.',
    iconName: 'Navigation',
    accentColor: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
  },
  'memory-cards': {
    label: 'Memory Cards',
    shortLabel: 'Memory Cards',
    description: 'Pattern recognition game testing working memory capacity.',
    iconName: 'Layers',
    accentColor: 'violet',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-600',
  },
  'med-coach': {
    label: 'Med-Coach Quiz',
    shortLabel: 'Med-Coach',
    description: 'Interactive health knowledge assessment with coaching feedback.',
    iconName: 'HeartPulse',
    accentColor: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-600',
  },
}

export const GAME_ORDER: GameType[] = ['glaucoma', 'adhd', 'labyrinth', 'memory-cards', 'med-coach']

// ─── Mock result generator (used by placeholder game host) ──────────────────

import type {
  GameResult,
  GlaucomaRawData,
  AdhdRawData,
  LabyrinthRawData,
  MemoryCardsRawData,
  MedCoachRawData,
} from './types'

export function generateMockResult(gameType: GameType): Omit<GameResult, 'completedAt'> {
  const now = Date.now()

  switch (gameType) {
    case 'glaucoma': {
      const raw: GlaucomaRawData = {
        responseTimesMs: Array.from({ length: 24 }, () => 300 + Math.floor(Math.random() * 400)),
        missedTargets: Math.floor(Math.random() * 5),
        falsePositives: Math.floor(Math.random() * 3),
        visualFieldMap: Array.from({ length: 8 }, () =>
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 5))
        ),
      }
      return {
        gameType,
        score: 70 + Math.floor(Math.random() * 25),
        durationMs: 45000 + Math.random() * 15000,
        rawData: raw,
      }
    }
    case 'adhd': {
      const raw: AdhdRawData = {
        reactionTimesMs: Array.from({ length: 30 }, () => 200 + Math.floor(Math.random() * 500)),
        omissionErrors: Math.floor(Math.random() * 8),
        commissionErrors: Math.floor(Math.random() * 6),
        sustainedAttentionScore: 60 + Math.floor(Math.random() * 35),
      }
      return {
        gameType,
        score: 65 + Math.floor(Math.random() * 30),
        durationMs: 60000 + Math.random() * 30000,
        rawData: raw,
      }
    }
    case 'labyrinth': {
      const raw: LabyrinthRawData = {
        completionTimeMs: 30000 + Math.random() * 90000,
        wrongTurns: Math.floor(Math.random() * 12),
        hintsUsed: Math.floor(Math.random() * 4),
        levelReached: 3 + Math.floor(Math.random() * 5),
      }
      return {
        gameType,
        score: 60 + Math.floor(Math.random() * 35),
        durationMs: raw.completionTimeMs,
        rawData: raw,
      }
    }
    case 'memory-cards': {
      const pairs = 8
      const raw: MemoryCardsRawData = {
        totalPairs: pairs,
        attempts: pairs + Math.floor(Math.random() * 12),
        completionTimeMs: 40000 + Math.random() * 60000,
        longestMatchStreak: 1 + Math.floor(Math.random() * 5),
      }
      return {
        gameType,
        score: 55 + Math.floor(Math.random() * 40),
        durationMs: raw.completionTimeMs,
        rawData: raw,
      }
    }
    case 'med-coach': {
      const total = 10
      const correct = 5 + Math.floor(Math.random() * 6)
      const raw: MedCoachRawData = {
        questionsAnswered: total,
        correctAnswers: correct,
        timePerQuestionMs: Array.from({ length: total }, () => 5000 + Math.random() * 15000),
        topicScores: { pharmacology: 70, anatomy: 80, diagnostics: 65 },
      }
      return {
        gameType,
        score: Math.round((correct / total) * 100),
        durationMs: now - (now - 120000),
        rawData: raw,
      }
    }
  }
}
