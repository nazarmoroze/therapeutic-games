'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { GameResult } from '@/lib/games/types'

const DOMAIN_MAP = [
  { key: 'glaucoma', label: 'Visual\nAttention' },
  { key: 'adhd', label: 'Sustained\nAttention' },
  { key: 'memory-cards', label: 'Memory' },
  { key: 'labyrinth', label: 'Navigation' },
  { key: 'med-coach', label: 'Health\nKnowledge' },
]

export default function RadarWidget({ results }: { results: GameResult[] }) {
  const map = Object.fromEntries(results.map((r) => [r.gameType, r.score]))

  const data = DOMAIN_MAP.filter(({ key }) => map[key] !== undefined).map(({ key, label }) => ({
    domain: label,
    score: map[key],
  }))

  if (data.length < 3) return null

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'inherit' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          tickCount={5}
        />
        <Radar
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
        />
        <Tooltip
          formatter={(v) => [`${v}/100`, 'Score']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
