import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Brain,
  Eye,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  BarChart3,
  ChevronRight,
} from 'lucide-react'

export const metadata = {
  title: 'Therapeutic Games — AI Cognitive Health Screening',
  description:
    "Clinical-grade cognitive assessments through interactive games. Screen for glaucoma, ADHD, and early Alzheimer's indicators in under 30 minutes.",
}

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-sm">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Therapeutic Games</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-200 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Research Demo · Not a Medical Device
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            AI-Powered
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Cognitive Health
            </span>{' '}
            Screening
          </h1>

          <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Clinical-grade assessments through interactive games. Screen for glaucoma, ADHD, and
            early Alzheimer&apos;s indicators — in under 30 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl text-base hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-900/30"
            >
              Start Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Sign in to existing account <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-indigo-300">
            {(
              [
                [ShieldCheck, 'Research Protocols'],
                [FileText, 'PDF Reports'],
                [BarChart3, 'Domain Analysis'],
              ] as [React.ElementType, string][]
            ).map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-3">
              What We Screen For
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Five cognitive domains
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Each game targets a specific neurological domain using research-validated protocols.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                Icon: Eye,
                color: 'bg-indigo-600',
                lightBg: 'bg-indigo-50',
                lightText: 'text-indigo-600',
                name: 'Glaucoma Screening',
                tag: 'Visual Field Analysis',
                desc: 'An 8×8 spatial grid test maps peripheral vision sensitivity. Detects early patterns of glaucoma before symptoms appear.',
                metrics: [
                  'Response time tracking',
                  'False positive detection',
                  'Visual field heat map',
                ],
              },
              {
                Icon: Zap,
                color: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                lightText: 'text-amber-600',
                name: 'ADHD Assessment',
                tag: 'Continuous Performance Test',
                desc: 'A sustained-attention task measures focus, reaction time, and impulse control with live EEG band visualisation.',
                metrics: [
                  'Omission & commission errors',
                  'Reaction time distribution',
                  'Live EEG monitoring',
                ],
              },
              {
                Icon: Layers,
                color: 'bg-violet-600',
                lightBg: 'bg-violet-50',
                lightText: 'text-violet-600',
                name: 'Memory Assessment',
                tag: 'Working Memory Test',
                desc: 'A pattern-recognition card matching task evaluates working memory capacity and consolidation speed.',
                metrics: [
                  'Match efficiency score',
                  'Consecutive streak tracking',
                  'Completion time analysis',
                ],
              },
              {
                Icon: Brain,
                color: 'bg-emerald-600',
                lightBg: 'bg-emerald-50',
                lightText: 'text-emerald-600',
                name: 'Spatial Navigation',
                tag: 'Labyrinth Task',
                desc: 'A procedurally-generated maze tests spatial reasoning and cognitive flexibility across 3 difficulty levels.',
                metrics: ['Path efficiency', 'Wrong-turn analysis', 'Level progression'],
              },
              {
                Icon: ShieldCheck,
                color: 'bg-rose-600',
                lightBg: 'bg-rose-50',
                lightText: 'text-rose-600',
                name: 'Health Coaching',
                tag: 'Med-Coach Quiz',
                desc: "A health literacy quiz generates personalised recommendations based on each patient's full assessment results.",
                metrics: ['10-question knowledge test', 'Score-based tips', 'Topic breakdown'],
              },
              {
                Icon: FileText,
                color: 'bg-slate-700',
                lightBg: 'bg-slate-100',
                lightText: 'text-slate-700',
                name: 'PDF Report',
                tag: '5-Page Clinical Summary',
                desc: 'A downloadable PDF report summarises all domain scores, raw metrics, visual maps, and coaching recommendations.',
                metrics: ['Visual field maps', 'Domain radar chart', 'Personalised coaching'],
              },
            ].map(({ Icon, color, lightBg, lightText, name, tag, desc, metrics }) => (
              <div
                key={name}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${color} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${lightText} mb-0.5`}>{tag}</p>
                    <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                <ul className="flex flex-col gap-1.5 mt-auto">
                  {metrics.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${lightBg} border border-current ${lightText} flex-shrink-0`}
                      />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-3">
            Simple Workflow
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-12">
            From intake to report in 3 steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Patient Intake',
                desc: 'Enter anonymous demographics — age, gender, visual correction. Takes under 30 seconds.',
              },
              {
                step: '02',
                title: 'Play Assessments',
                desc: 'Patient completes selected cognitive games. Each is self-guided with clear on-screen instructions.',
              },
              {
                step: '03',
                title: 'Download Report',
                desc: 'A detailed 5-page PDF report is generated with scores, visualisations, and personalised recommendations.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center font-extrabold text-indigo-600 text-sm">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to run your first assessment?
          </h2>
          <p className="text-indigo-200 mb-8">Free demo — no credit card required.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl text-base hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Start Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">Therapeutic Games</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="bg-amber-950/40 border border-amber-700/30 rounded-xl px-5 py-4 mb-6">
              <p className="text-amber-300 text-xs leading-relaxed font-medium">
                ⚠️ Medical Disclaimer: This platform is a research and demonstration tool and does
                not constitute a medical device, clinical diagnostic tool, or substitute for
                professional medical advice, diagnosis, or treatment. All results should be reviewed
                by a qualified healthcare professional. Do not use this platform to make clinical
                decisions.
              </p>
            </div>
            <p className="text-xs text-slate-600 text-center">
              © {new Date().getFullYear()} Therapeutic Games Platform. Research use only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
