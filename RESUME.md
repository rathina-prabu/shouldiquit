# RESUME — overnight build of Should I Quit

> **For the agent reading this in a new session:** the user (Rathina) is asleep. They want a working app by morning. You have full `--dangerously-skip-permissions`. Read this file completely, then execute. Do not ask clarifying questions — defaults are documented and locked.

---

## What this is

A mobile-first anonymous web app called **Should I Quit**. Asks the user 18 questions + their salary, returns a verdict (LEAVE NOW / STAY & FIX / etc.) with money comparison + diagnosis + share card. Built for Indian IT professionals.

## Where to read context (in this order)

1. `docs/superpowers/specs/2026-05-16-should-i-quit-design.md` — **complete design spec.** All 18 questions live here in §4. Read this first.
2. `docs/superpowers/plans/2026-05-17-should-i-quit-implementation.md` — **step-by-step implementation plan**. Phases 0-6, each task has exact files + code + commit messages. Follow it.
3. `mockups/journey/` — riso aesthetic, 7 screens. Match these visually.
4. `data/benchmarks.json` — pre-compiled (135 KB) salary/city/role/market data. Use as-is.

## What's already done (do not redo)

- Spec written, brainstorming complete
- All 18 questions written with scoring weights (see spec §4)
- Riso v2 design locked, mockups at `mockups/journey/`
- 4 polarity rule: A positive · B neutral positive · C neutral negative · D negative
- Benchmarks compiled to `data/benchmarks.json`
- Supabase project created (see below for credentials)

## What's NOT done — your job tonight

Build the entire Next.js app per the implementation plan. Push commits as you go. End with a running dev server.

---

## Locked decisions (do not deliberate)

| Decision | Lock |
|---|---|
| Final question count | **18** (Module 2 Manager = 4 + Module 3 People = 4, others as spec). Do NOT trim. |
| Persona | **None.** No "Dr. K", no character, no medical theater. Direct second-person voice. |
| LLM | **Templated fallback only.** Anthropic org is in deletion-scheduled state (see below). Code MUST handle the missing API key gracefully — try Claude, fall back to template. |
| Salary screen | Required, no skip. Two inputs: fixed (CTC) + variable (bonus/ESOPs). |
| Visitor view | Detect via localStorage UUID match. Strip salary, full diagnosis, hourly rate. Show verdict + score + weakest module + "Take yours" CTA. |
| Share card | 1080×1080 PNG via `@vercel/og`. Already specified in plan Task 5.1. |
| Helpline footer | Always-shown single line: `Struggling with more than work? iCall 9152987821 · Vandrevala 1860-2662-345` |
| Aesthetic | Riso. Palette: paper `#f4ecd6`, ink `#0e3870`, accent `#e8576b`. Fonts: Rubik Mono One (display) + Rubik (body). |
| Mobile-first | Max width 440px. Single-column. Full-width tap targets. |

---

## Critical credentials (NEVER commit)

### Supabase

- **Project name:** `shouldiquit`
- **Project ID:** `yojxqkwqlnodtllkmauq`
- **Region:** `ap-south-1` (Mumbai)
- **URL:** `https://yojxqkwqlnodtllkmauq.supabase.co`
- **Publishable key (use for client AND server):** `sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq`
- **Legacy anon (JWT, equivalent):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvanhxa3dxbG5vZHRsbGttYXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDk3NTQsImV4cCI6MjA5NDUyNTc1NH0.gpMHdlvvEf8eRMi8nYInetM02RI_EG5EPkRC8oXweqI`
- **Service role key:** NOT auto-fetchable via MCP. **Either** use Supabase MCP to write via the project_id (preferred — has full privileges via the MCP auth), **or** ask user to grab from Supabase Dashboard → Project Settings → API Keys → `service_role`. For tonight's build, **rely on the Supabase MCP for any writes during dev**, and use permissive RLS policies that allow `anon` to insert/select. This works without the service role key.
- **Org:** `Rathina Prabu` (slug `hbuktnkekcmbeeikqzbf`)

**RLS strategy:** apply migration with policies allowing public insert + select on `sessions` and `answers` (already specified in plan Task 3.1). With these policies, the anon/publishable key works for both server-side and client-side ops. No service role key needed.

### Anthropic — UNAVAILABLE

User's Anthropic org is **scheduled for deletion** (accidentally clicked delete). They sent support an email before sleeping. Until org is restored, **NO Claude API access**.

**Implication:** The LLM diagnosis route MUST use the templated fallback. The code must be structured so that when `ANTHROPIC_API_KEY` is missing or invalid, it falls back to the templated diagnosis. Do not block on the LLM — ship without it.

When the user wakes up + restores the org + adds the key to `.env.local`, the live LLM activates automatically.

### Build the .env.local

Write `.env.local` (project root, gitignored):
```
NEXT_PUBLIC_SUPABASE_URL=https://yojxqkwqlnodtllkmauq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq
SUPABASE_URL=https://yojxqkwqlnodtllkmauq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq
ANTHROPIC_API_KEY=
```

(Yes, both public and "service-role" slots use the publishable key. With permissive RLS, this works. Replace `SUPABASE_SERVICE_ROLE_KEY` with the real one if the user provides it later.)

Also write `.gitignore` (if not present) with `.env*.local`.

---

## Where you LEFT OFF

The previous session was in the middle of these tasks:
1. ✓ Supabase project created (`yojxqkwqlnodtllkmauq`)
2. ✓ Publishable key obtained
3. ✗ Schema migration NOT YET applied (do this next via MCP)
4. ✗ Next.js NOT scaffolded — first attempt blocked because `data/`, `mockups/`, `.claude/` exist. **Workaround: manual scaffold.** Write all the Next.js config + entry files by hand. Do not use `create-next-app`.
5. ✗ Everything in the plan from Task 0.2 onwards

---

## How to scaffold without `create-next-app`

Since `data/`, `mockups/`, `.claude/`, `docs/`, `RESUME.md` etc. already exist in `/Users/rathinaprabhu/SCG/shouldiquit/`, write these files manually (do NOT use `create-next-app`):

1. `package.json` — see below
2. `tsconfig.json`
3. `next.config.js`
4. `tailwind.config.ts`
5. `postcss.config.js`
6. `.gitignore` — include `node_modules/`, `.next/`, `.env*.local`, `*.tsbuildinfo`
7. `.env.local` (with values above)
8. `app/layout.tsx`
9. `app/globals.css`
10. `app/page.tsx`
11. `next-env.d.ts`

Then `npm install`.

### Reference `package.json`

```json
{
  "name": "shouldiquit",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start -H 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "@supabase/supabase-js": "^2.45.0",
    "@vercel/og": "^0.6.0",
    "next": "14.2.10",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.7.0",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vitest": "^2.1.2"
  }
}
```

### Reference `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Reference `next.config.js`

```js
/** @type {import('next').NextConfig} */
module.exports = { reactStrictMode: true }
```

### Reference `postcss.config.js`

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

### Reference `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#f4ecd6", ink: "#0e3870", accent: "#e8576b" },
      fontFamily: {
        display: ['"Rubik Mono One"', "sans-serif"],
        body: ["Rubik", "sans-serif"],
      },
      maxWidth: { mobile: "440px" },
    },
  },
  plugins: [],
}
export default config
```

### Reference `app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Rubik:ital,wght@0,400;0,500;0,700;1,400&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
body {
  background-color: theme('colors.paper');
  background-image: radial-gradient(circle, rgba(14, 56, 112, 0.04) 1px, transparent 1px);
  background-size: 3px 3px;
  color: theme('colors.ink');
  font-family: theme('fontFamily.body');
  min-height: 100vh;
}
```

### Reference `app/layout.tsx`

```tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Should I Quit?",
  description: "An app that asks 18 questions and answers one. Anonymous.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Reference `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

After all those files are written, run `npm install`.

---

## Execution sequence (do these in order)

1. **Write `.env.local`** with Supabase values.
2. **Write `.gitignore`**.
3. **Write all Next.js scaffold files** listed above.
4. **`npm install`** — should complete in ~60s.
5. **Apply Supabase schema migration via MCP.** Use `mcp__plugin_supabase_supabase__apply_migration` with `project_id: yojxqkwqlnodtllkmauq` and the migration body from plan Task 3.1.
6. **Build lib/** files per plan Phase 1 (types, questions, scoring, benchmarks, short-id, user-uuid). Write tests as you go (TDD). Run `npm test` to confirm.
7. **Build store/quiz-store.ts** (Zustand) per plan Task 2.1.
8. **Build all UI components** per plan Phase 4. Match riso aesthetic.
9. **Build all 7 screen pages** per plan Phases 2 + 4. Match `mockups/journey/`.
10. **Build all 3 API routes** per plan Phases 3 + 4 + 5. The diagnose route MUST handle missing/invalid `ANTHROPIC_API_KEY` and fall back to templated paragraph.
11. **Start dev server** with `npm run dev` (already bound to `0.0.0.0` via the script). Should be at `http://localhost:3000` and `http://192.168.1.6:3000`.
12. **Walk the happy path** in mobile-emulator view (Chrome DevTools, width 390-440). Complete a quiz, verify it persists to Supabase (use MCP `execute_sql` to confirm row exists), verify result page renders, verify share-card image at `/api/og/<id>`.
13. **Commit progressively** as you go — one commit per major task. End state should have ~15-20 clean commits.
14. **Run dev server in background** (use `npm run dev` with `run_in_background: true` so it persists for the user to test in the morning).
15. **Update this RESUME.md** at the end with what you completed and any remaining issues.

---

## Key implementation gotchas (read these before you build)

1. **Question count = 18, not 20.** Total = Work(3) + Manager(4) + People(4) + Growth(3) + Money(2) + Wellbeing(2) = 18. The plan says 18 in places, ignore any "20" references.

2. **The diagnose route must gracefully handle no Anthropic key.** Wrap the Claude SDK call in try/catch. If `ANTHROPIC_API_KEY` is empty OR the call throws, return the templated diagnosis (`templatedDiagnosis()` in `lib/claude.ts`). User wakes up to a working diagnosis paragraph either way.

3. **Templated diagnosis library needs to be richer than the plan stub.** Write a templated paragraph for each `weakest_module × verdict_tier` combo = 6 × 5 = 30 templates. Cover all combos. Each one should be ~2 short paragraphs + 3 specific actions. Tone: direct second-person, sharp, on-brand. The user will read these literally. Reference the locked tone from the question writing — punchy, observational, Indian English.

4. **Uber driver daily INR is hard-coded** in `lib/benchmarks.ts` per spec §6:
   ```
   Bangalore: 600, Mumbai: 700, Gurgaon: 650, Chennai: 500, Hyderabad: 550
   ```

5. **localStorage key for user_uuid** is `siq-user-uuid`. Zustand persist key is `siq-quiz-state`. Both in `lib/user-uuid.ts` and `store/quiz-store.ts` respectively.

6. **The visitor view detection** runs client-side after fetching the session. Compare `localStorage.getItem('siq-user-uuid')` against `session.user_uuid`. Match = taker view. No match = stripped visitor view.

7. **OG image route** uses Edge runtime (`export const runtime = "edge"`). Cannot use Node-only imports there. Use the `@vercel/og` JSX-ish syntax. See plan Task 5.1 exactly.

8. **Mobile-first layout.** Every screen wraps in `<RisoLayout>` with `max-w-mobile mx-auto`. Don't bother with desktop tuning — works fine but not optimized.

9. **Q10 (Mentorship) scoring** hits BOTH `people` and `growth` dimensions. Q14 (Work-life balance) hits BOTH `growth` and `wellbeing`. These cross-module hits are intentional — preserve them when transcribing from spec §4 to `lib/questions.ts`.

10. **Money score salary offset** lives in the API route (POST /api/sessions). The score from the 2 money questions is computed by `computeScores()`, then offset by `computeSalaryOffset()` if the user is below market. Plan Task 3.2 has the exact code.

---

## Default answers to anything else the user might have wanted to clarify

| Question | Default |
|---|---|
| GitHub push? | No. Don't push tonight. User will do it. |
| Vercel deploy? | No. Local dev server only. User will deploy when awake. |
| Custom domain? | No. `localhost:3000` / `192.168.1.6:3000`. |
| Tests? | Yes — write unit tests for scoring, benchmarks, short-id, quiz-store. Skip E2E if time is tight. |
| Linting / formatting? | Skip ESLint config; use defaults if needed. Don't run Prettier as a step. |
| Module trim (4→3)? | Skip. Ship at 18. |
| Backfill 3rd Money question? | Skip. Ship with 2. |
| Add Q19/Q20 (hours/runway)? | Skip. Ship with 18. |

---

## Validation phase — persona-based scoring sanity check

**Run this AFTER the app is built and dev server is up.** This is the smoke test that proves the scoring + question design actually produce sensible verdicts.

### Why this matters

If a clearly frustrated user ends up at STAY & THRIVE — the scoring is broken or the questions don't capture what they should. This test catches calibration bugs before the user wakes up. **Treat any mismatch as a P0 issue and write what's wrong in `WAKE_UP.md`.**

### How to run it

Dispatch **three parallel `general-purpose` subagents**, one per persona below. Each subagent gets:

1. **Their persona prompt** (full situation + emotional state + pain points)
2. **The 18 questions with their 4 options each, plain text, NO scoring weights shown**
3. **Instruction:** "Answer each question with the option-letter (A/B/C/D) that this persona would honestly pick. Don't optimize for any outcome. Return JSON only: `[{q: 'q1', choice: 'C'}, {q: 'q2', choice: 'B'}, ...]`"

After all three subagents return their answers, **YOU (the parent agent) compute the scores** using `lib/scoring.ts`, then compare actual verdict against expected. Write the comparison to `validation-results.md` at project root.

### Persona 1 — HAPPY (expected: STAY & THRIVE)

**Brief for subagent:**
> You're a Senior Software Engineer in Bangalore, 5 years of experience, fixed CTC ₹32L + variable ₹6L. You joined this company 18 months ago after a great offer.
>
> Your situation:
> - Your manager is genuinely thoughtful — gives sharp specific feedback, respects your time, pushes you forward at promo committees.
> - The work is meaningful: you ship things that customers actually use and senior leadership references your projects.
> - You learn something new every couple of months. Just started picking up systems design depth.
> - You have two real friends on the team. You'd hang out with them even if you quit.
> - Office politics is light. People mostly just work.
> - Last hike was 18% — above inflation.
> - You're paid above your peers and you know it.
> - You log off by 7 PM most days. Weekends are sacred.
> - Sunday evenings, you're often looking forward to Monday.
> - Outside work you have a full life — climbing on weekends, a partner, two book clubs.
>
> Pain points: occasional crunch weeks, slightly opaque promotion criteria, one annoying skip-level. Nothing major.
>
> Answer each of the 18 questions HONESTLY as this person would. Don't optimize. Don't game.

**Expected verdict:** STAY & THRIVE (score 75-100). If they end up below 75, something is off.

### Persona 2 — MEDIOCRE (expected: STAY & FIX or IT'S COMPLICATED)

**Brief for subagent:**
> You're an Engineering Manager in Hyderabad, 9 years of experience, fixed CTC ₹38L + variable ₹4L. Been here 3 years.
>
> Your situation:
> - Your manager is decent. Not bad, not great. Feedback is vague ("keep doing what you're doing"). Doesn't pump for you in promo committees but doesn't sandbag either.
> - Work is fine — running a team of 6, ~40% your time goes to people management. Some weeks feel meaningful, some weeks feel like babysitting JIRA.
> - You haven't picked up a new technical skill in over a year. Going deep on management instead.
> - You have one real friend at work. Everyone else is friendly-but-distant.
> - There are camps. You stay neutral and that works, mostly. Got caught in a political cross-fire about 6 months ago, still stings.
> - No formal mentorship. You've asked a few seniors casually but no one's invested.
> - Last hike was 9% — basically market rate, not exciting.
> - You compare-think your peers earn roughly the same as you. No transparency, but you don't feel underpaid.
> - You leave by 8 PM most days. Some weekends get touched but rarely.
> - Sunday evenings you're neutral — it's just Monday.
> - Outside work, your life is shrinking — you used to play guitar, haven't picked it up in 6 months. Friends keep texting you for plans you keep postponing.
>
> Pain points: career feels stuck, promotion has been "discussed broadly" for 18 months, growth feels flat.
>
> Answer the 18 questions honestly.

**Expected verdict:** STAY & FIX or IT'S COMPLICATED (score 40-74). If they end up at STAY & THRIVE OR at START LOOKING, something is off.

### Persona 3 — FRUSTRATED (expected: LEAVE NOW or START LOOKING)

**Brief for subagent:**
> You're a Senior Product Manager in Gurgaon, 8 years of experience, fixed CTC ₹26L + variable ₹3L. Been here 2 years and 4 months. **This is the realistic-quitter pattern:** you genuinely love the work and your team — that's the only reason you've stayed this long. But the boss, the pay, the lack of growth, and your own burnout are all closing in.
>
> **THE WORK (positive — you genuinely like it):**
> - The product problems are meaty and intellectually interesting. You'd be sad to leave the actual problem space.
> - You're doing real PM work — strategy, customer interviews, shipping features that customers actually use. The work has meaning.
> - Customers notice your work and tell you. You feel that direct impact.
>
> **THE PEOPLE (positive — they're the reason you stayed):**
> - You have three real friends on this team. You've been to their weddings. You'd hang out with them outside work even after you quit.
> - Office politics is light at the team level. People mostly just work, your immediate circle is drama-free.
> - One of the principal engineers has actually been a real mentor to you — checks in monthly, gave you a stretch project last quarter.
> - HR — neutral. Diwali emails. Engagement surveys. They've never helped, never hurt.
>
> **THE MANAGER (the fire):**
> - Phone calls at 11 PM on Sundays about things that could have waited.
> - Feedback is "Be more proactive" and "Create visibility" — same words, every year.
> - Takes credit for your work in front of the CPO. You've watched it happen three times.
>
> **THE GROWTH (stuck):**
> - Promotion was discussed once 18 months ago, then ghosted. You watched the cycle close without you and found out from someone else's promo announcement.
> - You've stopped speaking up in meetings. Anything you say gets shot down by the manager.
> - Work-life balance is broken — laptop comes on every trip, you were on-call through your cousin's wedding last month.
>
> **THE MONEY (underpaid):**
> - Last hike was zero. "Tough year for the company."
> - Below market by 30-40% — you found out by accident when a junior who joined this year showed his offer letter.
>
> **THE STATE OF YOU (cooked):**
> - Sunday nights you can't sleep — already running tomorrow's meetings in your head.
> - Outside work — even when you're enjoying something, thoughts of work pop in and the mood crashes.
>
> The trap: the work + the team are good enough that you keep telling yourself "things will improve." They won't.
>
> Answer the 18 questions honestly as this person.

**Expected verdict:** START LOOKING or LEAVE NOW (score 0-39).

Why this is a better test than "everything is bad": this persona will score HIGH on Work (11% weight) and People (10% weight) modules — ~21% of the master score will be solidly positive. The other 79% (Manager + Growth + Money + Wellbeing) is leaning D. The math should still land below 40 because the weighted-down modules dominate. If the scoring lets this person end up at IT'S COMPLICATED or higher, the design is too forgiving — the manager-comp-growth-burnout combo IS a quit signal even when work + colleagues are good.

If this persona ends up at LEAVE NOW (0-19): means scoring is appropriately weighted.
If they end up at START LOOKING (20-39): scoring is well-calibrated.
If they land in IT'S COMPLICATED (40-54) or above: **bug — module weights need re-tuning** because positive Work/People shouldn't be enough to save someone who's actively being pushed out.

### What to do after running the test

Write a file `validation-results.md` at project root with:

```markdown
# Validation results — <timestamp>

## Persona 1: HAPPY
- Expected tier: STAY & THRIVE (75-100)
- Actual score: <score>/100
- Actual tier: <tier>
- Match: ✅ / ❌
- Module breakdown: work=X, manager=X, people=X, growth=X, money=X, wellbeing=X
- Accumulator: intent_to_quit=X, cynicism=X, agency=X
- Answer choices: q1=A, q2=B, ...
- Notes: <anything surprising>

## Persona 2: MEDIOCRE
... same structure ...

## Persona 3: FRUSTRATED
... same structure ...

## Overall verdict on the scoring
- Are all 3 personas landing in the expected tier? Y/N
- If N, what's likely broken?
  - Question polarity wrong on which Q?
  - Scoring weight too low/high on which dimension?
  - Module weight needs tuning?
- Specific fix recommendations
```

### When to escalate to `WAKE_UP.md`

- All 3 personas match expected tier → just note "scoring validated" in WAKE_UP.md
- 1 or more personas mismatch → write the full diagnosis + recommendation in WAKE_UP.md, flag as P0 for the user to review when awake

### How to dispatch the subagents (technical)

Use the `Agent` tool with `subagent_type: "general-purpose"`, run all three in parallel in a single message. Each agent's prompt should be:
- The persona brief above (verbatim)
- Salary numbers (fixed/variable per persona, since the score includes salary offset)
- City + role + YoE (since these gate the benchmark lookup)
- The 18 questions with all 4 options each, plain text
- Output format spec: JSON array `[{q: "q1", choice: "A"|"B"|"C"|"D"}, ...]`

After all 3 return, you (the parent agent) compute the verdict by:
1. Convert their choice letters to indices (A=0, B=1, C=2, D=3)
2. Call `computeScores(answers)` from `lib/scoring.ts`
3. Apply the salary offset using `computeSalaryOffset(total_lakhs, city, role, yoe)`
4. Recompute `adjMaster` per the salary-adjusted formula in plan Task 3.2
5. Derive the tier

If the build is fully complete, you could also POST to `/api/sessions` with each agent's answers and check the response — that's the most realistic end-to-end test.

---

## Wake-up state for the user (build the `WAKE_UP.md` at root)

When you finish (or hit a stopping point), write `WAKE_UP.md` at `/Users/rathinaprabhu/SCG/shouldiquit/WAKE_UP.md`. Include:

1. **TL;DR:** What's running. What URL to open on phone.
2. **Status table:** What's complete vs broken vs deferred.
3. **3 things the user must do:**
   - Email Anthropic support (template already in their head — they did it before sleep)
   - When org restored: paste `ANTHROPIC_API_KEY=...` into `.env.local` and restart dev server
   - Test the flow on their phone
4. **Deploy plan when ready:** exact commands for `vercel --prod`.
5. **Known issues / TODOs.**

---

## How to verify Supabase writes

Use the MCP:
```
mcp__plugin_supabase_supabase__execute_sql
  project_id: yojxqkwqlnodtllkmauq
  query: SELECT id, role, city, master_score, verdict_tier, created_at FROM sessions ORDER BY created_at DESC LIMIT 5;
```

After a happy-path walk, you should see one fresh row.

---

## Final reminders

- **Read the spec doc and the plan doc before writing any code.** They contain answers to almost everything.
- **Polarity rule is non-negotiable** — A/B/C/D = positive/neutral+/neutral-/negative on every question.
- **Don't add features beyond what's specified.** Module transition cards, pre-session animation, archetype labels — all explicitly cut. Don't add them back.
- **No emojis in code/UI** except: tier emojis on the verdict (✅🤔🤷🚪🔥), the helpline footer's plain text, and the answer-text emojis that already exist in `mockups/journey/04-question.html` (🌞😐😔🪦 etc.). Don't add new emojis anywhere else.
- **No icons in answer options.** User explicitly removed them. Just text.
- **`--dangerously-skip-permissions` is active.** No confirmations needed. Move fast.

Good luck. Build the thing.
