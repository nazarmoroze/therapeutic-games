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
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {
    // env vars not configured — render landing page without auth check
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)] shadow-md">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-[var(--foreground)] tracking-tight text-lg">
              Soma Therapy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold tracking-widest uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-full transition-colors shadow-lg shadow-[var(--primary)]/20"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[--background] text-[var(--foreground)] min-h-[90vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#34d399]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center z-10">
          <div className="inline-flex items-center gap-3 bg-white/60 border border-white/80 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase text-[var(--foreground)] mb-10 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_#34d399]" />
            Research Demo
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-extrabold tracking-tighter mb-8 leading-[1.05]">
            Neural Cognitive
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)]">
              Health Screening
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted-foreground)] font-medium max-w-2xl mx-auto mb-12 leading-relaxed tracking-tight">
            Clinical-grade assessments through interactive simulations. Screen for glaucoma, ADHD,
            and early cognitive decline markers — in under 30 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 bg-[var(--primary)] text-white font-bold px-10 py-5 rounded-full text-sm uppercase tracking-widest hover:bg-[var(--primary-hover)] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20"
            >
              Start Demo <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 bg-white/60 border border-white/80 text-[var(--foreground)] font-bold px-10 py-5 rounded-full text-sm uppercase tracking-widest hover:bg-white transition-colors backdrop-blur-md shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              Sign in to Account <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-20 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--muted-foreground)]">
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
      <section className="bg-[var(--background)] py-32 px-4 sm:px-6 lg:px-8 text-[var(--foreground)] border-t border-[var(--primary)]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--primary)] mb-6">
              Clinical Models
            </p>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-[var(--foreground)] mb-6">
              Core Assessments
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto tracking-tight font-medium">
              Four gamified tasks measuring distinct cognitive and perceptual domains. All
              integrated into one workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                Icon: Eye,
                color: 'bg-[var(--foreground)]',
                lightBg: 'bg-black/[0.05]',
                lightText: 'text-[var(--foreground)]',
                name: 'Glaucoma Screening',
                tag: 'Visual Field Analysis',
                desc: 'An 8×8 spatial grid test maps peripheral vision sensitivity. Detects early patterns of glaucoma before symptoms appear.',
                metrics: ['Response tracking', 'Anomaly detection', 'Visual field map'],
              },
              {
                Icon: Zap,
                color: 'bg-[#ff3b3b]',
                lightBg: 'bg-[#ff3b3b]/10',
                lightText: 'text-[#ff3b3b]',
                name: 'ADHD Assessment',
                tag: 'Continuous Performance Test',
                desc: 'A sustained-attention task measures focus, reaction time, and impulse control via rapid visual discrimination.',
                metrics: ['Omission errors', 'Reaction time drift', 'Inhibitory control'],
              },
              {
                Icon: Layers,
                color: 'bg-[#3b82f6]',
                lightBg: 'bg-[#3b82f6]/10',
                lightText: 'text-[#3b82f6]',
                name: 'Memory Assessment',
                tag: 'Working Memory Test',
                desc: 'A pattern-recognition card matching task evaluates working memory capacity and consolidation speed.',
                metrics: ['Match efficiency', 'Consecutive streaks', 'Completion time'],
              },
              {
                Icon: Brain,
                color: 'bg-[var(--primary)]',
                lightBg: 'bg-[var(--primary)]/10',
                lightText: 'text-[var(--primary)]',
                name: 'Spatial Navigation',
                tag: 'Labyrinth Task',
                desc: 'A procedurally-generated maze tests spatial reasoning and cognitive flexibility across 3 difficulty levels.',
                metrics: ['Path efficiency', 'Wrong-turn analysis', 'Level progression'],
              },
              {
                Icon: ShieldCheck,
                color: 'bg-[#ec4899]',
                lightBg: 'bg-[#ec4899]/10',
                lightText: 'text-[#ec4899]',
                name: 'Health Coaching',
                tag: 'Med-Coach Quiz',
                desc: "A health literacy quiz generates personalised recommendations based on each patient's full assessment results.",
                metrics: ['Knowledge test', 'Score-based tips', 'Topic breakdown'],
              },
              {
                Icon: FileText,
                color: 'bg-[#8b5cf6]',
                lightBg: 'bg-[#8b5cf6]/10',
                lightText: 'text-[#8b5cf6]',
                name: 'PDF Extraction',
                tag: 'Clinical Summary',
                desc: 'A downloadable PDF report summarises all domain scores, raw metrics, visual maps, and coaching recommendations.',
                metrics: ['Visual field maps', 'Domain radar chart', 'Consultation prep'],
              },
            ].map(({ Icon, color, lightBg, lightText, name, tag, desc, metrics }) => (
              <div
                key={name}
                className="glass-panel p-8 flex flex-col gap-6 hover:shadow-2xl hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl ${color} shadow-lg shadow-black/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-[10px] font-bold tracking-[0.2em] uppercase ${lightText} mb-1`}
                    >
                      {tag}
                    </p>
                    <h3 className="font-extrabold tracking-tight text-[var(--foreground)] text-lg">
                      {name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--muted-foreground)] leading-relaxed">
                  {desc}
                </p>
                <ul className="flex flex-col gap-2 mt-auto pt-4 border-t border-[var(--foreground)]/5">
                  {metrics.map((m) => (
                    <li
                      key={m}
                      className="flex items-center gap-3 text-xs font-bold tracking-tight text-[var(--muted-foreground)]"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${lightBg} shadow-[0_0_6px_currentColor] ${lightText} flex-shrink-0`}
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
      <section className="py-32 bg-[var(--foreground)] text-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 mb-6">
            Simple Workflow
          </p>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-20 tracking-tighter">
            From intake to report in 3 steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-12 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Patient Intake',
                desc: 'Enter anonymous demographics — age, gender. Takes under 30 seconds.',
              },
              {
                step: '02',
                title: 'Play Assessments',
                desc: 'Patient completes cognitive games. Each is self-guided with clear instructions.',
              },
              {
                step: '03',
                title: 'Export Report',
                desc: 'A detailed 5-page PDF report is generated with scores and visualisations.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-5 group">
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center font-extrabold tracking-tight text-white text-3xl group-hover:scale-110 transition-transform group-hover:bg-white/10 group-hover:border-white/20 shadow-xl shadow-black/20">
                  {step}
                </div>
                <h3 className="font-extrabold text-white tracking-tight text-xl">{title}</h3>
                <p className="text-sm font-medium text-white/50 leading-relaxed px-4">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--primary)] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tighter mb-6">
            Ready to run an assessment?
          </h2>
          <p className="text-white/80 font-medium text-lg sm:text-xl tracking-tight mb-12">
            Free demo — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-[var(--primary)] font-extrabold px-12 py-5 rounded-full text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
          >
            Initialize Setup <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-black text-[var(--muted-foreground)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-lg">Soma Therapy</span>
            </div>
            <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.2em]">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10">
            <div className="bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 rounded-[2rem] px-8 py-6 mb-8 text-center max-w-4xl mx-auto backdrop-blur-md">
              <p className="text-[#ff3b3b] text-xs leading-relaxed font-bold uppercase tracking-widest">
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
