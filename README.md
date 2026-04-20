# Therapeutic Games Platform

AI-powered cognitive health screening through interactive games. Screens for glaucoma, ADHD, and early Alzheimer's indicators via 5 game-based assessments with PDF report generation.

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Framework  | Next.js 14 (App Router)                |
| Language   | TypeScript                             |
| Auth & DB  | Supabase (Auth + PostgreSQL + Storage) |
| Styling    | Tailwind CSS                           |
| State      | Zustand                                |
| Charts     | Recharts                               |
| PDF        | @react-pdf/renderer                    |
| Animations | Framer Motion                          |
| Deployment | Vercel                                 |

## Games

| Game               | Domain              | Duration |
| ------------------ | ------------------- | -------- |
| Glaucoma Screening | Visual Field        | ~3 min   |
| ADHD Assessment    | Sustained Attention | ~5 min   |
| Labyrinth          | Spatial Navigation  | ~5 min   |
| Memory Cards       | Working Memory      | ~3 min   |
| Med-Coach Quiz     | Health Knowledge    | ~3 min   |

---

## Local Development

### 1. Clone & install

```bash
git clone <repo-url>
cd therapeutic-games
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Find these in: **Supabase Dashboard → Project Settings → API**.

### 3. Run database migrations

In [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new) run in order:

1. `supabase/migrations/20240101000000_init.sql`
2. `supabase/migrations/20240102000000_sessions.sql`

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### Vercel Dashboard (recommended)

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Deploy**

### Vercel CLI

```bash
npm i -g vercel && vercel login
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

### Post-deployment checklist

- [ ] Landing page loads at `/`
- [ ] Register account and confirm email
- [ ] Create session, complete games end-to-end
- [ ] PDF download works
- [ ] Results radar chart renders
- [ ] Disclaimer banner visible and dismissible

---

## Project Structure

```
app/
  (auth)/           # Login & Register
  (dashboard)/      # Dashboard with session history
  session/[id]/     # Game host + Results
  api/pdf/generate/ # PDF generation API
  page.tsx          # Landing page

components/
  games/            # All 5 game components
  pdf/              # PdfReport (5 pages)
  DisclaimerBanner  # Dismissible research disclaimer
  GameErrorBoundary # Per-game error recovery

lib/
  games/            # Types, engines, scoring
  supabase/         # client / server / admin
```

---

## Environment Variables

| Variable                        | Description                    |
| ------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (server only) |

---

> **Medical Disclaimer:** This is a research demonstration tool and does not constitute a medical device or clinical diagnostic tool. Results must be reviewed by a qualified healthcare professional.
