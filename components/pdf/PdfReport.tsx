import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type {
  DbSession,
  GameResult,
  GlaucomaRawData,
  AdhdRawData,
  LabyrinthRawData,
  MemoryCardsRawData,
  MedCoachRawData,
} from '@/lib/games/types'
import { generateTipsFromResults } from '@/lib/games/med-coach/tips'

// ─── Styles ──────────────────────────────────────────────────────────────────

const C = {
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate9: '#0f172a',
  slate7: '#334155',
  slate5: '#64748b',
  slate3: '#cbd5e1',
  slate1: '#f1f5f9',
  white: '#ffffff',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
    paddingHorizontal: 48,
    paddingVertical: 44,
    fontSize: 10,
    color: C.slate7,
  },
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: C.slate9,
    paddingHorizontal: 56,
    paddingVertical: 56,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  // Typography
  h1: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 6 },
  h2: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.slate9, marginBottom: 14 },
  h3: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.slate9, marginBottom: 8 },
  label: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    color: C.slate5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: { fontSize: 10, color: C.slate7, lineHeight: 1.6 },
  small: { fontSize: 8, color: C.slate5 },

  // Layout
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flexDirection: 'column' },
  spacer: { flex: 1 },
  divider: { height: 1, backgroundColor: C.slate3, marginVertical: 16 },
  section: { marginBottom: 24 },

  // Cards
  card: { backgroundColor: C.slate1, borderRadius: 8, padding: 16, marginBottom: 12 },
  cardWhite: {
    backgroundColor: C.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    border: `1 solid ${C.slate3}`,
  },

  // Score pill
  scorePill: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  scoreText: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: C.white },

  // Bar
  barTrack: { height: 8, backgroundColor: C.slate3, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  // Field grid
  fieldCell: { width: 12, height: 12, marginRight: 1, marginBottom: 1 },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return C.emerald
  if (score >= 60) return C.amber
  return C.rose
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${m}m ${sec}s`
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${score}%`, backgroundColor: color }]} />
    </View>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <View style={[s.scorePill, { backgroundColor: color }]}>
      <Text style={s.scoreText}>{score}/100</Text>
    </View>
  )
}

function SectionHeader({ children }: { children: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.h2}>{children}</Text>
      <View style={{ height: 3, width: 40, backgroundColor: C.indigo, borderRadius: 2 }} />
    </View>
  )
}

// ─── Page 1: Cover ────────────────────────────────────────────────────────────

function CoverPage({ session, overallScore }: { session: DbSession; overallScore: number | null }) {
  const date = new Date(session.started_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const gender = session.patient_gender ?? 'Not specified'
  const age = session.patient_age ?? '—'

  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top section */}
      <View>
        <Text style={[s.label, { color: 'rgba(255,255,255,0.5)', marginBottom: 8 }]}>
          COGNITIVE HEALTH ASSESSMENT
        </Text>
        <Text style={s.h1}>Session Report</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{date}</Text>
      </View>

      {/* Middle — overall score */}
      <View style={{ alignItems: 'center', paddingVertical: 48 }}>
        <Text style={[s.label, { color: 'rgba(255,255,255,0.5)', marginBottom: 12 }]}>
          OVERALL SCORE
        </Text>
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: overallScore !== null ? scoreColor(overallScore) : C.slate5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 48, fontFamily: 'Helvetica-Bold', color: C.white }}>
            {overallScore ?? '–'}
          </Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 10, fontSize: 11 }}>
          out of 100
        </Text>
      </View>

      {/* Bottom — demographics */}
      <View>
        <View style={s.divider} />
        <View style={[s.row, { gap: 40 }]}>
          {[
            ['Patient Age', `${age} years`],
            ['Gender', gender.replace('_', ' ')],
            ['Glasses', session.has_glasses ? 'Yes' : 'No'],
            ['Games Played', `${session.game_results.length}`],
          ].map(([lbl, val]) => (
            <View key={lbl}>
              <Text style={[s.small, { marginBottom: 3 }]}>{lbl}</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white }}>
                {val}
              </Text>
            </View>
          ))}
        </View>
        <View style={[s.divider, { marginTop: 20 }]} />
        <Text style={[s.small, { color: 'rgba(255,255,255,0.3)', marginTop: 8 }]}>
          Generated by Therapeutic Games Platform · Session ID:{' '}
          {session.id.slice(0, 8).toUpperCase()}
        </Text>
      </View>
    </Page>
  )
}

// ─── Page 2: Domain Overview ──────────────────────────────────────────────────

const DOMAIN_MAP: { label: string; gameType: string; color: string }[] = [
  { label: 'Visual Attention', gameType: 'glaucoma', color: C.indigo },
  { label: 'Sustained Attention', gameType: 'adhd', color: C.amber },
  { label: 'Memory', gameType: 'memory-cards', color: C.violet },
  { label: 'Navigation', gameType: 'labyrinth', color: C.emerald },
  { label: 'Health Knowledge', gameType: 'med-coach', color: C.rose },
]

function DomainPage({ results }: { results: GameResult[] }) {
  const map = Object.fromEntries(results.map((r) => [r.gameType, r.score]))

  return (
    <Page size="A4" style={s.page}>
      <SectionHeader>Domain Overview</SectionHeader>
      <Text style={[s.body, { marginBottom: 20, color: C.slate5 }]}>
        Scores across all assessed cognitive domains. Each score is normalised to 0–100.
      </Text>

      {DOMAIN_MAP.map(({ label, gameType, color }) => {
        const score = map[gameType]
        if (score === undefined) return null
        return (
          <View key={gameType} style={[s.cardWhite, { marginBottom: 14 }]}>
            <View style={[s.row, { marginBottom: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.h3, { marginBottom: 0 }]}>{label}</Text>
                <Text style={s.small}>
                  {gameType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
              </View>
              <ScoreBadge score={score} />
            </View>
            <ScoreBar score={score} color={color} />
          </View>
        )
      })}

      {/* Interpretation legend */}
      <View style={[s.card, { marginTop: 8 }]}>
        <Text style={[s.label, { marginBottom: 8 }]}>Score Guide</Text>
        <View style={s.row}>
          {[
            [C.emerald, '80–100', 'Above average'],
            [C.amber, '60–79', 'Within normal range'],
            [C.rose, '0–59', 'Below average — review recommended'],
          ].map(([color, range, desc]) => (
            <View key={range} style={{ flex: 1, paddingHorizontal: 6 }}>
              <View
                style={{
                  width: 24,
                  height: 4,
                  backgroundColor: color as string,
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <Text style={[s.small, { fontFamily: 'Helvetica-Bold' }]}>{range}</Text>
              <Text style={s.small}>{desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  )
}

// ─── Page 3: Visual Field & ADHD ─────────────────────────────────────────────

function fieldColor(v: number) {
  const colors = ['#1e293b', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd']
  return colors[Math.min(v, 4)]
}

function VisualAttentionPage({ results }: { results: GameResult[] }) {
  const g = results.find((r) => r.gameType === 'glaucoma')
  const a = results.find((r) => r.gameType === 'adhd')
  const gd = g?.rawData as GlaucomaRawData | undefined
  const ad = a?.rawData as AdhdRawData | undefined

  const avgRtG = gd?.responseTimesMs.length
    ? Math.round(gd.responseTimesMs.reduce((x, y) => x + y, 0) / gd.responseTimesMs.length)
    : null
  const avgRtA = ad?.reactionTimesMs.length
    ? Math.round(ad.reactionTimesMs.reduce((x, y) => x + y, 0) / ad.reactionTimesMs.length)
    : null

  return (
    <Page size="A4" style={s.page}>
      {/* Glaucoma */}
      {g && gd && (
        <View style={s.section}>
          <SectionHeader>Visual Field Analysis (Glaucoma Screening)</SectionHeader>
          <View style={[s.row, { marginBottom: 16, gap: 16 }]}>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>Score</Text>
              <Text
                style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: scoreColor(g.score) }}
              >
                {g.score}
              </Text>
            </View>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>Avg Response</Text>
              <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                {avgRtG ?? '—'}ms
              </Text>
            </View>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>Missed Targets</Text>
              <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                {gd.missedTargets}
              </Text>
            </View>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>False Positives</Text>
              <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                {gd.falsePositives}
              </Text>
            </View>
          </View>

          {/* Visual field map */}
          <Text style={[s.label, { marginBottom: 8 }]}>
            Visual Field Sensitivity Map (0=not tested, 4=excellent)
          </Text>
          <View style={{ flexDirection: 'column' }}>
            {gd.visualFieldMap.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', marginBottom: 1 }}>
                {row.map((cell, ci) => (
                  <View key={ci} style={[s.fieldCell, { backgroundColor: fieldColor(cell) }]} />
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ADHD */}
      {a && ad && (
        <View>
          <View style={s.divider} />
          <SectionHeader>Sustained Attention (ADHD Assessment)</SectionHeader>
          <View style={[s.row, { gap: 12 }]}>
            {[
              ['Score', `${a.score}`],
              ['Avg Reaction', avgRtA ? `${avgRtA}ms` : '—'],
              ['Omission Errors', `${ad.omissionErrors}`],
              ['Commission Errors', `${ad.commissionErrors}`],
              ['Sustained Attn.', `${ad.sustainedAttentionScore}/100`],
            ].map(([lbl, val]) => (
              <View key={lbl} style={[s.cardWhite, { flex: 1 }]}>
                <Text style={s.label}>{lbl}</Text>
                <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.card}>
            <Text style={[s.body, { color: C.slate5 }]}>
              Omission errors = missed targets (inattention). Commission errors = responding to
              non-targets (impulsivity). Sustained attention score tracks focus decay over the
              session duration.
            </Text>
          </View>
        </View>
      )}
    </Page>
  )
}

// ─── Page 4: Memory & Navigation ─────────────────────────────────────────────

function MemoryNavigationPage({ results }: { results: GameResult[] }) {
  const mem = results.find((r) => r.gameType === 'memory-cards')
  const lab = results.find((r) => r.gameType === 'labyrinth')
  const md = mem?.rawData as MemoryCardsRawData | undefined
  const ld = lab?.rawData as LabyrinthRawData | undefined

  const efficiency = md ? Math.round((md.totalPairs / md.attempts) * 100) : null

  return (
    <Page size="A4" style={s.page}>
      {/* Memory Cards */}
      {mem && md && (
        <View style={s.section}>
          <SectionHeader>Working Memory (Memory Cards)</SectionHeader>
          <View style={[s.row, { gap: 12, marginBottom: 12 }]}>
            {[
              ['Score', `${mem.score}`],
              ['Pairs Found', `${md.totalPairs}/${md.totalPairs}`],
              ['Attempts', `${md.attempts}`],
              ['Efficiency', `${efficiency}%`],
              ['Best Streak', `${md.longestMatchStreak}`],
              ['Duration', formatMs(md.completionTimeMs)],
            ].map(([lbl, val]) => (
              <View key={lbl} style={[s.cardWhite, { flex: 1 }]}>
                <Text style={s.label}>{lbl}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.card}>
            <Text style={[s.body, { color: C.slate5 }]}>
              Efficiency = pairs / attempts (100% = perfect first-try matches). Streak measures
              consecutive correct matches, indicating pattern recognition speed.
            </Text>
          </View>
        </View>
      )}

      {/* Labyrinth */}
      {lab && ld && (
        <View>
          <View style={s.divider} />
          <SectionHeader>Spatial Navigation (Labyrinth)</SectionHeader>
          <View style={[s.row, { gap: 12 }]}>
            {[
              ['Score', `${lab.score}`],
              ['Total Time', formatMs(ld.completionTimeMs)],
              ['Wrong Turns', `${ld.wrongTurns}`],
              ['Hints Used', `${ld.hintsUsed}`],
              ['Levels Reached', `${ld.levelReached}/3`],
            ].map(([lbl, val]) => (
              <View key={lbl} style={[s.cardWhite, { flex: 1 }]}>
                <Text style={s.label}>{lbl}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  )
}

// ─── Page 5: Health Coaching ──────────────────────────────────────────────────

function CoachingPage({ results }: { results: GameResult[] }) {
  const mc = results.find((r) => r.gameType === 'med-coach')
  const mcRaw = mc?.rawData as MedCoachRawData | undefined
  const tips = generateTipsFromResults(results)

  return (
    <Page size="A4" style={s.page}>
      <SectionHeader>Health Coaching & Recommendations</SectionHeader>

      {mc && mcRaw && (
        <View style={[s.section]}>
          <View style={[s.row, { marginBottom: 12, gap: 12 }]}>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>Knowledge Score</Text>
              <Text
                style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: scoreColor(mc.score) }}
              >
                {mc.score}
              </Text>
            </View>
            <View style={[s.cardWhite, { flex: 1 }]}>
              <Text style={s.label}>Correct Answers</Text>
              <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: C.slate9 }}>
                {mcRaw.correctAnswers}/{mcRaw.questionsAnswered}
              </Text>
            </View>
          </View>

          {/* Topic breakdown */}
          {Object.keys(mcRaw.topicScores).length > 0 && (
            <View style={s.card}>
              <Text style={[s.label, { marginBottom: 10 }]}>Topic Breakdown</Text>
              {Object.entries(mcRaw.topicScores).map(([topic, score]) => (
                <View key={topic} style={{ marginBottom: 8 }}>
                  <View style={[s.row, { marginBottom: 3 }]}>
                    <Text style={[s.body, { flex: 1 }]}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </Text>
                    <Text style={[s.small, { fontFamily: 'Helvetica-Bold' }]}>{score}%</Text>
                  </View>
                  <ScoreBar score={score} color={C.rose} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={s.divider} />
      <Text style={[s.h3, { marginBottom: 12 }]}>Personalised Recommendations</Text>
      {tips.map((tip, i) => (
        <View key={i} style={[s.row, { marginBottom: 10, alignItems: 'flex-start' }]}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: C.rose,
              marginTop: 4,
              marginRight: 10,
              flexShrink: 0,
            }}
          />
          <Text style={[s.body, { flex: 1, lineHeight: 1.7 }]}>{tip}</Text>
        </View>
      ))}

      {/* Disclaimer */}
      <View style={[s.card, { marginTop: 24, backgroundColor: '#fff7ed' }]}>
        <Text style={[s.small, { color: '#92400e', lineHeight: 1.6 }]}>
          Disclaimer: This report is generated by a research-grade screening tool and does not
          constitute a medical diagnosis. Results should be reviewed by a qualified healthcare
          professional. Scores may be influenced by factors including fatigue, anxiety, and
          environmental conditions at the time of testing.
        </Text>
      </View>
    </Page>
  )
}

// ─── Main Document ────────────────────────────────────────────────────────────

interface Props {
  session: DbSession
}

export function PdfReport({ session }: Props) {
  const results = session.game_results as GameResult[]
  const overallScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : null

  return (
    <Document
      title={`Cognitive Health Report — ${session.id.slice(0, 8).toUpperCase()}`}
      author="Therapeutic Games Platform"
      subject="Cognitive Health Assessment"
    >
      <CoverPage session={session} overallScore={overallScore} />
      <DomainPage results={results} />
      {results.some((r) => r.gameType === 'glaucoma' || r.gameType === 'adhd') && (
        <VisualAttentionPage results={results} />
      )}
      {results.some((r) => r.gameType === 'memory-cards' || r.gameType === 'labyrinth') && (
        <MemoryNavigationPage results={results} />
      )}
      <CoachingPage results={results} />
    </Document>
  )
}
