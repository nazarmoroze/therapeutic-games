import type { GameResult, GameType, MedCoachRawData } from '../types'

export function generateTipsFromResults(results: GameResult[]): string[] {
  const map = Object.fromEntries(results.map((r) => [r.gameType, r])) as Partial<
    Record<GameType, GameResult>
  >
  const tips: string[] = []

  const g = map['glaucoma']
  if (g) {
    tips.push(
      g.score < 70
        ? 'Your visual field test showed some irregularities. Schedule a comprehensive eye exam — early glaucoma has no symptoms and is most treatable when caught early.'
        : 'Your visual field test results are within normal range. Continue scheduling eye exams every 1–2 years after age 40.'
    )
  }

  const a = map['adhd']
  if (a) {
    tips.push(
      a.score < 65
        ? 'Your sustained attention scores suggest difficulty maintaining focus. Regular aerobic exercise (30 min/day), consistent sleep schedules, and mindfulness meditation have the strongest evidence for improvement.'
        : 'Your sustained attention performance is strong. Continue regular mental challenges and aerobic exercise to maintain this level.'
    )
  }

  const m = map['memory-cards']
  if (m) {
    tips.push(
      m.score < 65
        ? 'Your working memory could benefit from regular memory exercises and prioritising 7–9 hours of quality sleep. REM sleep is critical for memory consolidation.'
        : 'Your memory performance is solid. Omega-3 rich foods (fatty fish, walnuts) and continued mental stimulation support long-term memory health.'
    )
  }

  const l = map['labyrinth']
  if (l) {
    tips.push(
      l.score < 60
        ? 'Spatial reasoning and cognitive flexibility can be strengthened through navigation tasks, 3D puzzles, and learning new physical skills such as a musical instrument or sport.'
        : 'Your spatial navigation skills are performing well. Strategy games and learning new routes help maintain this domain.'
    )
  }

  const mc = map['med-coach']
  if (mc) {
    const raw = mc.rawData as MedCoachRawData
    const pct =
      raw.questionsAnswered > 0 ? Math.round((raw.correctAnswers / raw.questionsAnswered) * 100) : 0
    tips.push(
      pct < 70
        ? 'Strengthening your health knowledge is an important part of proactive self-care. Consider reviewing sleep, nutrition, and exercise guidelines with your healthcare provider.'
        : 'Excellent health literacy! Applying this knowledge consistently — especially around sleep quality, Mediterranean-style nutrition, and regular exercise — is what translates into long-term cognitive health.'
    )
  }

  return tips.length > 0
    ? tips
    : [
        'Keep up regular physical activity, quality sleep, and mental stimulation to maintain cognitive health across all domains.',
      ]
}
