'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Zap, Navigation, Layers, HeartPulse, CheckCircle2, Trophy } from 'lucide-react'
import { useSessionStore } from '@/store/sessionStore'
import { saveGameResultAction } from '@/app/actions/session'
import { GAME_CONFIG, generateMockResult } from '@/lib/games/config'
import { Button } from '@/components/ui/button'
import { GameErrorBoundary } from '@/components/GameErrorBoundary'
import type { DbSession, GameType, GameResult, GameProps, Gender } from '@/lib/games/types'

const GlaucomaGame = dynamic(() => import('@/components/games/GlaucomaGame'), { ssr: false })
const AdhdGame = dynamic(() => import('@/components/games/AdhdGame'), { ssr: false })
const LabyrinthGame = dynamic(() => import('@/components/games/LabyrinthGame'), { ssr: false })
const MemoryCardsGame = dynamic(() => import('@/components/games/MemoryCardsGame'), { ssr: false })
const MedCoachGame = dynamic(() => import('@/components/games/MedCoachGame'), { ssr: false })

// ─── Icon map ───────────────────────────────────────────────────────────────

const GAME_ICONS: Record<GameType, React.ElementType> = {
  glaucoma: Eye,
  adhd: Zap,
  labyrinth: Navigation,
  'memory-cards': Layers,
  'med-coach': HeartPulse,
}

// ─── Session stepper ────────────────────────────────────────────────────────

function SessionStepper({
  games,
  currentIndex,
  completedGames,
}: {
  games: GameType[]
  currentIndex: number
  completedGames: Set<GameType>
}) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
      <div className="max-w-3xl mx-auto">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">
            Game {Math.min(currentIndex + 1, games.length)} of {games.length}
          </span>
          <span className="text-xs text-slate-400">{completedGames.size} completed</span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {games.map((game, idx) => {
            const done = completedGames.has(game)
            const active = idx === currentIndex
            const config = GAME_CONFIG[game]
            const Icon = GAME_ICONS[game]

            return (
              <div key={game} className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                {/* Step circle */}
                <div
                  className={[
                    'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    done
                      ? 'bg-indigo-600 border-indigo-600'
                      : active
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Icon
                      className={['h-3.5 w-3.5', active ? config.textColor : 'text-slate-300'].join(
                        ' '
                      )}
                    />
                  )}
                </div>

                {/* Label (hidden on xs) */}
                <span
                  className={[
                    'hidden sm:block text-xs truncate min-w-0',
                    active
                      ? 'text-slate-900 font-semibold'
                      : done
                        ? 'text-slate-400 line-through'
                        : 'text-slate-400',
                  ].join(' ')}
                >
                  {config.shortLabel}
                </span>

                {/* Connector */}
                {idx < games.length - 1 && (
                  <div
                    className={[
                      'hidden sm:block flex-1 h-px',
                      done ? 'bg-indigo-300' : 'bg-slate-200',
                    ].join(' ')}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Transition overlay ──────────────────────────────────────────────────────

function GameTransitionOverlay({
  gameType,
  score,
  onContinue,
  isLast,
}: {
  gameType: GameType
  score: number
  onContinue: () => void
  isLast: boolean
}) {
  const config = GAME_CONFIG[gameType]
  const Icon = GAME_ICONS[gameType]

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: -16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center"
      >
        {/* Glow ring */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-20 blur-xl scale-150" />
          <div
            className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-white shadow-xl ${config.bgColor}`}
          >
            <Icon className={`h-9 w-9 ${config.textColor}`} />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">
          Game Complete
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{config.shortLabel}</h2>

        <div className="flex items-center justify-center gap-2 my-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="text-4xl font-extrabold text-slate-900">{score}</span>
          <span className="text-slate-400 text-lg font-medium">/100</span>
        </div>

        <div className={['h-2 rounded-full mb-6 bg-slate-100 overflow-hidden'].join(' ')}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>

        <Button size="lg" className="w-full" onClick={onContinue}>
          {isLast ? '🎉 View Results' : 'Next Game →'}
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ─── Placeholder game canvas ─────────────────────────────────────────────────

function GamePlaceholder({ gameType, onFinish }: { gameType: GameType; onFinish: () => void }) {
  const config = GAME_CONFIG[gameType]
  const Icon = GAME_ICONS[gameType]

  return (
    <motion.div
      key={gameType}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-8 flex-1 py-16 px-4"
    >
      <div
        className={`flex items-center justify-center w-24 h-24 rounded-3xl border-2 ${config.bgColor} ${config.borderColor} shadow-sm`}
      >
        <Icon className={`h-12 w-12 ${config.textColor}`} />
      </div>

      <div className="text-center max-w-sm">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1">
          Placeholder
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{config.label}</h2>
        <p className="text-slate-500 text-sm leading-relaxed">{config.description}</p>
      </div>

      {/* Mock game area */}
      <div
        className={`w-full max-w-lg h-56 rounded-2xl border-2 border-dashed ${config.borderColor} ${config.bgColor} flex items-center justify-center`}
      >
        <p className="text-sm font-mono text-slate-400">GAME: {gameType}</p>
      </div>

      <Button size="lg" onClick={onFinish}>
        Finish Game
      </Button>
    </motion.div>
  )
}

// ─── Main GameHost ────────────────────────────────────────────────────────────

interface GameHostProps {
  session: DbSession
}

export function GameHost({ session }: GameHostProps) {
  const router = useRouter()

  const {
    sessionId,
    selectedGames,
    currentGameIndex,
    gameResults,
    initSession,
    recordResult,
    nextGame,
  } = useSessionStore()

  // Hydrate store from DB session on mount (handles page refresh)
  useEffect(() => {
    if (sessionId !== session.id) {
      const completedCount = session.game_results.length
      // Rebuild store state from DB row
      initSession(
        session.id,
        {
          age: session.patient_age ?? 0,
          gender: (session.patient_gender as Gender) ?? 'prefer_not_to_say',
          hasGlasses: session.has_glasses,
        },
        session.selected_games
      )
      // Re-apply already-completed results
      session.game_results.forEach((r) => recordResult(r))
      // Advance index to match DB state
      for (let i = 0; i < completedCount; i++) {
        // We use the store's nextGame but need to be careful not to mark complete
        useSessionStore.getState().nextGame()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id])

  const games = selectedGames.length > 0 ? selectedGames : session.selected_games
  const activeGame: GameType | null = games[currentGameIndex] ?? null

  const completedSet = new Set<GameType>(Object.keys(gameResults) as GameType[])

  const [transition, setTransition] = useState<{
    gameType: GameType
    score: number
    isLast: boolean
  } | null>(null)

  const [saving, setSaving] = useState(false)

  const handleGameResult = useCallback(
    async (partial: Parameters<GameProps['onResult']>[0]) => {
      if (!activeGame || saving) return
      setSaving(true)

      const fullResult: GameResult = {
        ...partial,
        gameType: activeGame,
        completedAt: new Date().toISOString(),
      }

      await saveGameResultAction(session.id, fullResult)
      recordResult(fullResult)

      const last = currentGameIndex >= games.length - 1
      setTransition({ gameType: activeGame, score: fullResult.score, isLast: last })
      setSaving(false)
    },
    [activeGame, saving, session.id, recordResult, currentGameIndex, games.length]
  )

  const handlePlaceholderFinish = useCallback(async () => {
    if (!activeGame) return
    const mock = generateMockResult(activeGame)
    await handleGameResult({
      score: mock.score,
      durationMs: mock.durationMs,
      rawData: mock.rawData,
    })
  }, [activeGame, handleGameResult])

  const handleContinue = useCallback(() => {
    if (!transition) return
    const { isLast } = transition
    setTransition(null)

    if (isLast) {
      router.push(`/session/${session.id}/results`)
    } else {
      nextGame()
    }
  }, [transition, nextGame, router, session.id])

  if (!activeGame) return null

  return (
    <div className="min-h-screen flex flex-col">
      <SessionStepper games={games} currentIndex={currentGameIndex} completedGames={completedSet} />

      <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {(() => {
            const patientInfo = useSessionStore.getState().patientInfo ?? {
              age: session.patient_age ?? 0,
              gender: (session.patient_gender as Gender) ?? 'prefer_not_to_say',
              hasGlasses: session.has_glasses,
            }
            const gameName = GAME_CONFIG[activeGame]?.label ?? activeGame
            const wrapGame = (node: React.ReactNode, minH = 'min-h-[480px]') => (
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className={`flex-1 ${minH}`}
              >
                <GameErrorBoundary gameName={gameName} onSkip={handlePlaceholderFinish}>
                  {node}
                </GameErrorBoundary>
              </motion.div>
            )
            if (activeGame === 'glaucoma')
              return wrapGame(
                <GlaucomaGame patientInfo={patientInfo} onResult={handleGameResult} />
              )
            if (activeGame === 'adhd')
              return wrapGame(
                <AdhdGame patientInfo={patientInfo} onResult={handleGameResult} />,
                'min-h-[560px]'
              )
            if (activeGame === 'labyrinth')
              return wrapGame(
                <LabyrinthGame patientInfo={patientInfo} onResult={handleGameResult} />
              )
            if (activeGame === 'memory-cards')
              return wrapGame(
                <MemoryCardsGame patientInfo={patientInfo} onResult={handleGameResult} />
              )
            if (activeGame === 'med-coach')
              return wrapGame(
                <MedCoachGame patientInfo={patientInfo} onResult={handleGameResult} />,
                'min-h-[600px]'
              )
            return (
              <GamePlaceholder
                key={activeGame}
                gameType={activeGame}
                onFinish={handlePlaceholderFinish}
              />
            )
          })()}
        </AnimatePresence>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {transition && (
          <GameTransitionOverlay
            gameType={transition.gameType}
            score={transition.score}
            onContinue={handleContinue}
            isLast={transition.isLast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
