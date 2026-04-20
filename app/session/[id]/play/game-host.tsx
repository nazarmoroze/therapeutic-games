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
    <div className="glass-panel border-b-0 rounded-none border-[var(--primary)]/10 px-4 py-4 sticky top-0 z-20 backdrop-blur-2xl">
      <div className="max-w-4xl mx-auto">
        {/* Label row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--primary)]">
            Module {Math.min(currentIndex + 1, games.length)} / {games.length}
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
            {completedGames.size} Diagnosed
          </span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 sm:gap-3">
          {games.map((game, idx) => {
            const done = completedGames.has(game)
            const active = idx === currentIndex
            const config = GAME_CONFIG[game]
            const Icon = GAME_ICONS[game]

            return (
              <div key={game} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Step circle */}
                <div
                  className={[
                    'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all shadow-md',
                    done
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--background)] shadow-[0_0_15px_var(--primary)]'
                      : active
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--foreground)]/10 bg-[var(--foreground)]/5',
                  ].join(' ')}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : (
                    <Icon
                      className={[
                        'h-5 w-5',
                        active
                          ? 'text-[var(--primary)] shadow-[var(--primary)]'
                          : 'text-[var(--muted-foreground)]',
                      ].join(' ')}
                    />
                  )}
                </div>

                {/* Label (hidden on xs) */}
                <span
                  className={[
                    'hidden sm:block text-xs font-bold tracking-tight truncate min-w-0',
                    active
                      ? 'text-[var(--foreground)]'
                      : done
                        ? 'text-[var(--muted-foreground)] line-through opacity-50'
                        : 'text-[var(--muted-foreground)]',
                  ].join(' ')}
                >
                  {config.shortLabel}
                </span>

                {/* Connector */}
                {idx < games.length - 1 && (
                  <div
                    className={[
                      'hidden sm:block flex-1 h-px',
                      done ? 'bg-[var(--primary)]/50' : 'bg-[var(--foreground)]/10',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: -16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="glass-panel p-10 max-w-sm w-full mx-4 text-center border-[var(--primary)]/30 shadow-[0_0_50px_var(--primary)]/10"
      >
        {/* Glow ring */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 rounded-[2rem] bg-[var(--primary)] opacity-20 blur-2xl scale-[1.7]" />
          <div
            className={`relative flex items-center justify-center w-24 h-24 rounded-[2rem] border border-[var(--primary)]/30 shadow-2xl bg-[var(--background)]/80 backdrop-blur-md`}
          >
            <Icon
              className={`h-12 w-12 text-[var(--primary)] pointer-events-none drop-shadow-[0_0_10px_var(--primary)]`}
            />
          </div>
        </div>

        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--primary)] mb-2 drop-shadow-md">
          Sequence Complete
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] mb-6">
          {config.shortLabel}
        </h2>

        <div className="flex items-center justify-center gap-3 my-6">
          <Trophy className="h-6 w-6 text-[#34d399] drop-shadow-[0_0_15px_#34d399]" />
          <span className="text-6xl font-black text-[var(--foreground)] tracking-tighter drop-shadow-lg">
            {score}
          </span>
          <span className="text-[var(--muted-foreground)] text-sm font-bold tracking-widest mt-4">
            / 100
          </span>
        </div>

        <div
          className={[
            'h-3 rounded-full mb-8 bg-[var(--foreground)]/5 overflow-hidden shadow-inner border border-[var(--foreground)]/10',
          ].join(' ')}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className={`h-full bg-[#34d399] rounded-full shadow-[0_0_15px_#34d399]`}
          />
        </div>

        <Button
          size="lg"
          className="w-full tracking-widest uppercase font-bold shadow-[0_0_20px_var(--primary)]/30 hover:scale-105 active:scale-95 transition-all text-xs"
          onClick={onContinue}
        >
          {isLast ? 'Synthesize Results' : 'Next Module'}
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
      className="flex flex-col items-center justify-center gap-10 flex-1 py-16 px-4"
    >
      <div
        className={`flex items-center justify-center w-28 h-28 rounded-[2.5rem] border border-[var(--primary)]/30 bg-[var(--primary)]/5 shadow-[0_0_30px_var(--primary)]/20 relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/10 to-transparent blur-[2px] rounded-[2.5rem] z-0" />
        <Icon className={`h-14 w-14 text-[var(--primary)] z-10`} />
      </div>

      <div className="text-center max-w-sm">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--primary)] mb-3">
          Virtual Interface
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] mb-4">
          {config.label}
        </h2>
        <p className="text-[var(--muted-foreground)] text-sm font-medium leading-relaxed tracking-tight">
          {config.description}
        </p>
      </div>

      {/* Mock game area */}
      <div
        className={`w-full max-w-xl h-64 rounded-3xl border border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 flex items-center justify-center relative overflow-hidden backdrop-blur-xl group hover:border-[var(--primary)]/60 transition-colors`}
      >
        <div className="absolute top-0 right-0 p-4 border-b border-l border-[var(--primary)]/20 rounded-bl-3xl bg-[var(--primary)]/10 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
          Mock Env
        </div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
          Module: <span className="text-[var(--foreground)]">{gameType}</span>
        </p>
      </div>

      <Button
        size="lg"
        onClick={onFinish}
        className="px-10 text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_bg-[var(--primary)]]/30"
      >
        Execute Sequence
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
