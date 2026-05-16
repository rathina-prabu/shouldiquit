# Should I Quit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a mobile-first anonymous web app that asks 16 questions + captures salary, and returns a verdict ("Should I Quit?") with an LLM-generated diagnosis and shareable card.

**Architecture:** Next.js 14 App Router single-page-feeling app with client-side routing across 7 screens. Pure-function scoring engine (no I/O). Hand-curated `benchmarks.json` for salary/market lookups. Supabase Postgres for anonymous session persistence. Live Claude API call for diagnosis. `@vercel/og` for the share card image.

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom design tokens for the riso palette)
- shadcn/ui only for primitives (button, input, select); custom components for everything visual
- Supabase JS SDK (`@supabase/supabase-js`)
- Anthropic SDK (`@anthropic-ai/sdk`)
- `@vercel/og` for OG image generation
- Vitest for unit tests, Playwright for one happy-path E2E test
- Zustand for quiz state
- Hosted on Vercel

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-05-16-should-i-quit-design.md`
- Mockups: `mockups/journey/` (riso v2 — 7 screens)
- Benchmarks data: `data/benchmarks.json` (already compiled)

---

## File Structure

```
shouldiquit/
├── app/
│   ├── layout.tsx              # Root layout: fonts, riso bg texture
│   ├── page.tsx                # Screen 1: Landing
│   ├── start/page.tsx          # Screen 2: Intake form (city/role/yoe)
│   ├── quiz/page.tsx           # Screen 3: Question runner (handles all 16)
│   ├── salary/page.tsx         # Screen 4: Salary form
│   ├── r/[id]/page.tsx         # Screen 5+7: Result page (taker + visitor views)
│   ├── api/
│   │   ├── sessions/route.ts   # POST: persist session, return short-id
│   │   ├── diagnose/route.ts   # POST: LLM diagnosis (Claude API)
│   │   └── og/[id]/route.tsx   # Screen 6: share card image (1080×1080)
│   └── globals.css             # Tailwind + riso design tokens
├── lib/
│   ├── questions.ts            # The 16 questions + answer choices + scoring weights
│   ├── scoring.ts              # Pure functions: scoreSession, deriveVerdict, etc.
│   ├── benchmarks.ts           # Wrapper around benchmarks.json with typed lookups
│   ├── supabase.ts             # Supabase client singleton (browser + server)
│   ├── claude.ts               # Anthropic SDK wrapper + diagnosis prompt
│   ├── short-id.ts             # 6-char base62 ID generator
│   ├── user-uuid.ts            # localStorage UUID get-or-create
│   └── types.ts                # Shared TypeScript types
├── components/
│   ├── RisoLayout.tsx          # Riso bg texture + max-width 440 wrapper
│   ├── ProgressBar.tsx         # Thin bar + Qn/16 counter
│   ├── QuestionCard.tsx        # One question with 4 buttons
│   ├── VerdictBlock.tsx        # Hero verdict tier + score
│   ├── MoneySection.tsx        # Salary vs market + Uber comparison
│   ├── DiagnosisBlock.tsx      # LLM diagnosis paragraph + actions
│   ├── ShareButtons.tsx        # WhatsApp / save image / copy link
│   └── HelplineFooter.tsx      # Static footer
├── store/
│   └── quiz-store.ts           # Zustand: setup data, answers, salary
├── data/
│   └── benchmarks.json         # Already compiled (135 KB)
├── tests/
│   ├── scoring.test.ts
│   ├── benchmarks.test.ts
│   ├── short-id.test.ts
│   └── e2e/happy-path.spec.ts  # Playwright
├── supabase/
│   └── migrations/
│       └── 0001_init.sql       # sessions + answers tables
├── public/
│   └── (fonts, favicon)
├── .env.local                  # Supabase keys, Anthropic key
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

# Phase 0 — Project Foundation

### Task 0.1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Initialize Next.js**

Run from `/Users/rathinaprabhu/SCG/shouldiquit/`:
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --no-eslint
```
Answer prompts:
- "would you like to use Turbopack" → No
- Existing files overwrite → keep `data/`, `docs/`, `mockups/` (Next will only touch `app/`, `public/`, root configs)

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```
Expected: localhost:3000 shows default Next.js page. Kill server.

- [ ] **Step 3: Install runtime deps**

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk zustand @vercel/og
```

- [ ] **Step 4: Install dev deps**

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 5: Commit**

```bash
git init  # if not already
git add .
git commit -m "chore: scaffold Next.js 14 app with deps"
```

---

### Task 0.2: Configure Tailwind with riso design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace tailwind config with riso tokens**

Write `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4ecd6",
        ink: "#0e3870",
        accent: "#e8576b",
      },
      fontFamily: {
        display: ['"Rubik Mono One"', "sans-serif"],
        body: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        mobile: "440px",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Replace globals.css with paper texture + Google Fonts link**

Write `app/globals.css`:
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

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```
Open localhost:3000 — body background should now be paper-cream with subtle dot texture.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: riso design tokens and paper background"
```

---

### Task 0.3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Write vitest config**

Write `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
})
```

- [ ] **Step 2: Create test setup file**

Write `tests/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 3: Add test scripts to package.json**

Edit `package.json` `"scripts"` block — add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Write a smoke test**

Write `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest"

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/ package.json
git commit -m "chore: vitest configured"
```

---

# Phase 1 — Pure Logic (Scoring + Benchmarks)

### Task 1.1: Define shared types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write the types file**

Write `lib/types.ts`:
```ts
export type City = "Bangalore" | "Chennai" | "Hyderabad" | "Gurgaon" | "Mumbai"

export type Role =
  | "Senior Product Manager" | "Product Manager" | "Associate PM"
  | "Software Engineer" | "Senior Software Engineer" | "Engineering Manager" | "Tech Lead"
  | "Designer" | "Senior Designer"
  | "Data Scientist" | "Senior Data Scientist"
  | "DevOps Engineer" | "QA Engineer"
  | "Sales Lead" | "Marketing Manager" | "Growth Manager" | "Customer Success Manager"
  | "Finance Analyst" | "HR Business Partner" | "Operations Manager"

export type YoeBand = "0-3" | "4-7" | "8-12" | "13+"

export type ModuleName = "work" | "manager" | "people" | "growth" | "money" | "wellbeing"

export type AccumulatorName = "intent_to_quit" | "cynicism" | "agency"

export type Dimension = ModuleName | AccumulatorName

export type VerdictTier =
  | "STAY_THRIVE"
  | "STAY_FIX"
  | "ITS_COMPLICATED"
  | "START_LOOKING"
  | "LEAVE_NOW"

export interface Choice {
  label: string
  scores: Partial<Record<Dimension, number>>
}

export interface Question {
  id: string                  // "q1", "q2", ...
  module: ModuleName
  prompt: string
  choices: [Choice, Choice, Choice, Choice]  // exactly 4, A/B/C/D polarity order
}

export interface SetupData {
  city: City
  role: Role
  yoe: number                 // raw years; banded for benchmark lookup
}

export interface SalaryData {
  fixed_lakhs: number
  variable_lakhs: number
}

export interface Answer {
  question_id: string
  choice_index: 0 | 1 | 2 | 3
}

export interface Scores {
  modules: Record<ModuleName, number>     // 0-100
  master: number                           // 0-100
  tier: VerdictTier
  weakest_module: ModuleName
  intent_to_quit: number                   // raw accumulator (not normalized)
  cynicism: number
  agency: number
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: shared TypeScript types"
```

---

### Task 1.2: Encode all 16 questions

**Files:**
- Create: `lib/questions.ts`
- Test: `tests/questions.test.ts`

- [ ] **Step 1: Write the failing test**

Write `tests/questions.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { QUESTIONS } from "@/lib/questions"
import type { ModuleName } from "@/lib/types"

describe("QUESTIONS", () => {
  it("has 16 questions", () => {
    expect(QUESTIONS).toHaveLength(16)
  })
  it("every question has exactly 4 choices", () => {
    QUESTIONS.forEach(q => expect(q.choices).toHaveLength(4))
  })
  it("question IDs are unique", () => {
    const ids = new Set(QUESTIONS.map(q => q.id))
    expect(ids.size).toBe(16)
  })
  it("module distribution matches spec", () => {
    const counts: Record<string, number> = {}
    QUESTIONS.forEach(q => { counts[q.module] = (counts[q.module] || 0) + 1 })
    expect(counts.work).toBe(3)
    expect(counts.manager).toBe(4)
    expect(counts.people).toBe(4)
    expect(counts.growth).toBe(3)
    expect(counts.money).toBe(2)
    expect(counts.wellbeing).toBe(2)
  })
  it("every option A scores higher than option D on its module", () => {
    QUESTIONS.forEach(q => {
      const aScore = q.choices[0].scores[q.module] ?? 0
      const dScore = q.choices[3].scores[q.module] ?? 0
      expect(aScore).toBeGreaterThan(dScore)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/questions.test.ts
```
Expected: FAIL — `QUESTIONS` not exported.

- [ ] **Step 3: Write the questions module**

Write `lib/questions.ts`:
```ts
import type { Question } from "./types"

export const QUESTIONS: Question[] = [
  // Module 1: THE WORK
  {
    id: "q1", module: "work",
    prompt: "The nature of your work, most weeks:",
    choices: [
      { label: "A meaty mix — real challenges, things to figure out.", scores: { work: 5 } },
      { label: "Mostly repetitive, occasional spike of something interesting.", scores: { work: 3 } },
      { label: "Directionless — you do work, no one's quite sure why.", scores: { work: 1, cynicism: 2 } },
      { label: "Pure execution of someone else's blueprint. No thinking.", scores: { work: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q2", module: "work",
    prompt: "Skill development at this job:",
    choices: [
      { label: "Going wide — picking up new skills regularly.", scores: { work: 5, growth: 3 } },
      { label: "Going deep — sharpening a few skills into real expertise.", scores: { work: 5, growth: 3 } },
      { label: "Plateaued — no real skill movement in a while.", scores: { work: 1, cynicism: 2 } },
      { label: "Going backwards — losing edges you had when you joined.", scores: { work: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q3", module: "work",
    prompt: "Who actually notices the work you do?",
    choices: [
      { label: "Customers.", scores: { work: 5 } },
      { label: "Leadership / the wider org.", scores: { work: 4 } },
      { label: "Just my manager.", scores: { work: 2 } },
      { label: "Honestly, nobody.", scores: { work: 0, cynicism: 3 } },
    ],
  },
  // Module 2: THE MANAGER
  {
    id: "q4", module: "manager",
    prompt: "Manager takes a sick day. You...",
    choices: [
      { label: "Send them a \"feel better\" note. And mean it.", scores: { manager: 5 } },
      { label: "Carry on. They're fine, you're fine.", scores: { manager: 3 } },
      { label: "Quiet relief. The day just got easier.", scores: { manager: 1, cynicism: 2 } },
      { label: "Praying it's a broken leg. Both ideally.", scores: { manager: 0, cynicism: 3, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q5", module: "manager",
    prompt: "How does your manager treat off-hours?",
    choices: [
      { label: "Respects them. No pings after work hours.", scores: { manager: 5 } },
      { label: "Slacks at 10pm but writes \"no rush\" — and means it.", scores: { manager: 4 } },
      { label: "Pings whenever. Expects replies fast.", scores: { manager: 1, intent_to_quit: 1 } },
      { label: "Phone calls. At 11pm. On a Sunday. About something that could've waited.", scores: { manager: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q6", module: "manager",
    prompt: "The feedback you get from them:",
    choices: [
      { label: "Sharp and specific. You leave 1:1s with something to do.", scores: { manager: 5 } },
      { label: "\"Keep doing what you're doing.\" Said warmly. Useless.", scores: { manager: 3 } },
      { label: "Silent when it works. Loud when something breaks.", scores: { manager: 1, cynicism: 2 } },
      { label: "\"Be more proactive.\" \"Create visibility.\" Same words, every year.", scores: { manager: 0, cynicism: 4 } },
    ],
  },
  {
    id: "q7", module: "manager",
    prompt: "When your work goes up to leadership, credit:",
    choices: [
      { label: "They name you. By name. Unprompted.", scores: { manager: 5 } },
      { label: "Mentioned when relevant. Fair share.", scores: { manager: 4 } },
      { label: "\"The team did great work.\" Your specific bit, invisible.", scores: { manager: 1, cynicism: 2 } },
      { label: "They take it. Personally. Like you weren't even in the room.", scores: { manager: 0, cynicism: 4, intent_to_quit: 3 } },
    ],
  },
  // Module 3: THE PEOPLE
  {
    id: "q8", module: "people",
    prompt: "Friends at work:",
    choices: [
      { label: "Multiple. You'd still hang out with them even if you quit tomorrow.", scores: { people: 5 } },
      { label: "One real one. Your work-survival lifeline. Mostly at work though.", scores: { people: 4 } },
      { label: "Friendly with everyone. Close to no one.", scores: { people: 2 } },
      { label: "Pretty sure there's a team WhatsApp without you in it.", scores: { people: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q9", module: "people",
    prompt: "Politics at work:",
    choices: [
      { label: "What politics? People mostly just work.", scores: { people: 5 } },
      { label: "Some politics. You know the landmines.", scores: { people: 3 } },
      { label: "Active warzone. Half your energy goes to surviving it.", scores: { people: 1, intent_to_quit: 2 } },
      { label: "Every resignation story here starts with the politics.", scores: { people: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q10", module: "people",
    prompt: "Mentorship:",
    choices: [
      { label: "Someone senior is invested in your growth. They actually check in.", scores: { people: 5, growth: 3 } },
      { label: "A few people you can ping. Informal but real.", scores: { people: 3, growth: 2 } },
      { label: "The senior who said \"reach out anytime\" has never replied.", scores: { people: 1, growth: 1, cynicism: 2 } },
      { label: "Nobody here is worth learning from. ChatGPT is your mentor.", scores: { people: 0, growth: 0, cynicism: 4, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q11", module: "people",
    prompt: "When you think \"HR\" at your company:",
    choices: [
      { label: "Genuinely on your side. They've fought for you behind the scenes.", scores: { people: 4 } },
      { label: "Diwali emails. Engagement surveys. Background noise.", scores: { people: 3 } },
      { label: "\"Open door policy.\" Nobody home when you knock.", scores: { people: 1, cynicism: 2 } },
      { label: "They take leadership's side. Every time.", scores: { people: 0, cynicism: 3 } },
    ],
  },
  // Module 4: THE GROWTH
  {
    id: "q12", module: "growth",
    prompt: "Promotion conversation:",
    choices: [
      { label: "Clear criteria, clear timeline. You know what to hit.", scores: { growth: 5, agency: 2 } },
      { label: "Discussed broadly. No dates yet, but it's on the radar.", scores: { growth: 3 } },
      { label: "\"You need more impact.\" Ask what impact means. Silence.", scores: { growth: 1, cynicism: 3 } },
      { label: "The cycle closed without you. You found out from someone else's promo announcement.", scores: { growth: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q13", module: "growth",
    prompt: "Voice in meetings:",
    choices: [
      { label: "People wait for your take. They act on it.", scores: { growth: 5, agency: 2 } },
      { label: "Heard. Sometimes acted on. Mostly polite.", scores: { growth: 3 } },
      { label: "Polite nods. Then ignored. You've started noticing the pattern.", scores: { growth: 1, cynicism: 2 } },
      { label: "Anything you say gets shot down. So you stopped speaking up.", scores: { growth: 0, cynicism: 4, agency: -2 } },
    ],
  },
  {
    id: "q14", module: "growth",
    prompt: "Work-life balance:",
    choices: [
      { label: "Real. You log off and have a life.", scores: { growth: 5, wellbeing: 3 } },
      { label: "A few late evenings each week to finish things. Weekends stay yours.", scores: { growth: 3, wellbeing: 2 } },
      { label: "Work bleeds into evenings often. Weekends sometimes too.", scores: { growth: 1, wellbeing: 0, cynicism: 2 } },
      { label: "Laptop on every trip. On-call through weddings and weekend getaways.", scores: { growth: 0, wellbeing: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  // Module 5: THE MONEY
  {
    id: "q15", module: "money",
    prompt: "Last hike at appraisal:",
    choices: [
      { label: "Solid double-digit hike. Above inflation. Made you feel valued.", scores: { money: 5 } },
      { label: "Standard hike. Around market rate. Nothing to complain about.", scores: { money: 4 } },
      { label: "Below inflation. You did the math — you're earning less in real terms.", scores: { money: 1, cynicism: 2, intent_to_quit: 1 } },
      { label: "Zero hike. \"It's been a tough year for the company.\"", scores: { money: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q16", module: "money",
    prompt: "Compared to peers at your level, your pay is:",
    choices: [
      { label: "Higher. You quietly know it.", scores: { money: 5, agency: 2 } },
      { label: "About the same. The system feels fair enough.", scores: { money: 4 } },
      { label: "Lower. Same work, same title. The gap stings.", scores: { money: 1, intent_to_quit: 3, cynicism: 2 } },
      { label: "No clue. Nobody here talks pay. You've stopped guessing.", scores: { money: 0, cynicism: 4, agency: -2 } },
    ],
  },
]

// Wait — that's 16. Module 6 (wellbeing) questions 17 and 18 also needed.
```

Append two more questions to the array (just before the closing `]`):
```ts
  // Module 6: THE STATE OF YOU (wellbeing)
  {
    id: "q17", module: "wellbeing",
    prompt: "Sunday evening, your body:",
    choices: [
      { label: "Looking forward. Tomorrow has something you actually want to do.", scores: { wellbeing: 5 } },
      { label: "It's Monday. So what.", scores: { wellbeing: 3 } },
      { label: "Mood drops around 7 PM. The week starts arriving.", scores: { wellbeing: 1, intent_to_quit: 2 } },
      { label: "Can't sleep. Tomorrow's meetings already running in your head.", scores: { wellbeing: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q18", module: "wellbeing",
    prompt: "Outside of your job:",
    choices: [
      { label: "There's a full \"you\" — friends, hobbies, plans of your own.", scores: { wellbeing: 5 } },
      { label: "Less than there used to be. But the \"you\" is still there.", scores: { wellbeing: 3 } },
      { label: "Even when you're enjoying something, thoughts of work pop in. The mood crashes.", scores: { wellbeing: 1, cynicism: 2 } },
      { label: "Mentally, you're still at the office. Always.", scores: { wellbeing: 0, intent_to_quit: 3, cynicism: 2 } },
    ],
  },
```

Then update the test — total is 18, not 16:

Edit `tests/questions.test.ts` line `expect(QUESTIONS).toHaveLength(16)` → `18`. Update module counts: `wellbeing: 2`. (Note: actual count includes Module 2 = 4 and Module 3 = 4 per spec until trimmed; total = 3+4+4+3+2+2 = 18.)

Re-update `expect(ids.size).toBe(16)` → `18`.

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/questions.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/questions.ts tests/questions.test.ts
git commit -m "feat: encode all 18 quiz questions with scoring weights"
```

---

### Task 1.3: Scoring engine (pure functions)

**Files:**
- Create: `lib/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing test**

Write `tests/scoring.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { computeScores, deriveVerdict, findWeakestModule } from "@/lib/scoring"
import { QUESTIONS } from "@/lib/questions"
import type { Answer } from "@/lib/types"

const allAs = (): Answer[] => QUESTIONS.map(q => ({ question_id: q.id, choice_index: 0 }))
const allDs = (): Answer[] => QUESTIONS.map(q => ({ question_id: q.id, choice_index: 3 }))

describe("computeScores", () => {
  it("returns 100 for all-A answers (best case)", () => {
    const s = computeScores(allAs())
    expect(s.modules.work).toBe(100)
    expect(s.modules.manager).toBe(100)
    expect(s.modules.people).toBe(100)
    expect(s.modules.growth).toBe(100)
    expect(s.modules.money).toBe(100)
    expect(s.modules.wellbeing).toBe(100)
    expect(s.master).toBe(100)
  })
  it("returns ~0 for all-D answers (worst case)", () => {
    const s = computeScores(allDs())
    expect(s.modules.work).toBeLessThan(10)
    expect(s.master).toBeLessThan(10)
  })
  it("accumulates intent_to_quit on D answers", () => {
    const s = computeScores(allDs())
    expect(s.intent_to_quit).toBeGreaterThan(10)
  })
  it("weakest module is correctly identified", () => {
    // All-A except q15 (money) = D
    const answers = allAs().map(a => a.question_id === "q15" ? { ...a, choice_index: 3 as const } : a)
    const s = computeScores(answers)
    expect(s.modules.money).toBeLessThan(s.modules.work)
  })
})

describe("deriveVerdict", () => {
  it("100 → STAY_THRIVE", () => expect(deriveVerdict(100)).toBe("STAY_THRIVE"))
  it("75 → STAY_THRIVE", () => expect(deriveVerdict(75)).toBe("STAY_THRIVE"))
  it("60 → STAY_FIX", () => expect(deriveVerdict(60)).toBe("STAY_FIX"))
  it("45 → ITS_COMPLICATED", () => expect(deriveVerdict(45)).toBe("ITS_COMPLICATED"))
  it("30 → START_LOOKING", () => expect(deriveVerdict(30)).toBe("START_LOOKING"))
  it("10 → LEAVE_NOW", () => expect(deriveVerdict(10)).toBe("LEAVE_NOW"))
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- tests/scoring.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement scoring**

Write `lib/scoring.ts`:
```ts
import { QUESTIONS } from "./questions"
import type { Answer, ModuleName, Scores, VerdictTier, Dimension } from "./types"

const MODULE_WEIGHTS: Record<ModuleName, number> = {
  work: 0.11,
  manager: 0.18,
  people: 0.10,
  growth: 0.18,
  money: 0.25,
  wellbeing: 0.18,
}

const MODULES: ModuleName[] = ["work", "manager", "people", "growth", "money", "wellbeing"]

export function computeScores(answers: Answer[]): Scores {
  const dimensionTotals: Record<string, number> = {}

  // Sum hits across all answers
  for (const a of answers) {
    const q = QUESTIONS.find(qq => qq.id === a.question_id)
    if (!q) continue
    const choice = q.choices[a.choice_index]
    if (!choice) continue
    for (const [dim, pts] of Object.entries(choice.scores)) {
      dimensionTotals[dim] = (dimensionTotals[dim] || 0) + (pts as number)
    }
  }

  // Compute module maxes
  const moduleMaxes: Record<ModuleName, number> = {
    work: 0, manager: 0, people: 0, growth: 0, money: 0, wellbeing: 0,
  }
  for (const q of QUESTIONS) {
    // Max for this question's primary module = max hit any choice gives to that module
    const maxHit = Math.max(...q.choices.map(c => (c.scores[q.module] as number) ?? 0))
    moduleMaxes[q.module] += maxHit
  }

  // Module scores (0-100)
  const modules: Record<ModuleName, number> = {} as Record<ModuleName, number>
  for (const m of MODULES) {
    const earned = dimensionTotals[m] ?? 0
    const max = moduleMaxes[m] || 1
    modules[m] = Math.round((earned / max) * 100)
  }

  // Master weighted score
  const master = Math.round(
    MODULES.reduce((sum, m) => sum + MODULE_WEIGHTS[m] * modules[m], 0)
  )

  const tier = deriveVerdict(master)
  const weakest_module = findWeakestModule(modules)

  return {
    modules,
    master,
    tier,
    weakest_module,
    intent_to_quit: dimensionTotals.intent_to_quit ?? 0,
    cynicism: dimensionTotals.cynicism ?? 0,
    agency: dimensionTotals.agency ?? 0,
  }
}

export function deriveVerdict(master: number): VerdictTier {
  if (master >= 75) return "STAY_THRIVE"
  if (master >= 55) return "STAY_FIX"
  if (master >= 40) return "ITS_COMPLICATED"
  if (master >= 20) return "START_LOOKING"
  return "LEAVE_NOW"
}

export function findWeakestModule(modules: Record<ModuleName, number>): ModuleName {
  let weakest: ModuleName = "work"
  let lowest = 101
  for (const m of MODULES) {
    if (modules[m] < lowest) {
      lowest = modules[m]
      weakest = m
    }
  }
  return weakest
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/scoring.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts tests/scoring.test.ts
git commit -m "feat: pure-function scoring engine with verdict tiers"
```

---

### Task 1.4: Benchmarks lookup module

**Files:**
- Create: `lib/benchmarks.ts`
- Test: `tests/benchmarks.test.ts`

- [ ] **Step 1: Write the failing test**

Write `tests/benchmarks.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { yoeToBand, lookupSalary, lookupCityContext, computeRealDailyRate, computeSalaryOffset } from "@/lib/benchmarks"

describe("yoeToBand", () => {
  it("0 → 0-3", () => expect(yoeToBand(0)).toBe("0-3"))
  it("3 → 0-3", () => expect(yoeToBand(3)).toBe("0-3"))
  it("5 → 4-7", () => expect(yoeToBand(5)).toBe("4-7"))
  it("10 → 8-12", () => expect(yoeToBand(10)).toBe("8-12"))
  it("15 → 13+", () => expect(yoeToBand(15)).toBe("13+"))
})

describe("lookupSalary", () => {
  it("returns p50 for Sr PM Bangalore 8-12", () => {
    const s = lookupSalary("Bangalore", "Senior Product Manager", 10)
    expect(s).toBeDefined()
    expect(s!.p50).toBeGreaterThan(20)
  })
})

describe("lookupCityContext", () => {
  it("returns gig pay for Bangalore", () => {
    const c = lookupCityContext("Bangalore")
    expect(c.gig_cab_hourly_inr).toBeGreaterThan(0)
  })
})

describe("computeRealDailyRate", () => {
  it("(22 L total / 250 days) = ₹880/day", () => {
    expect(computeRealDailyRate(18, 4)).toBe(880)
  })
})

describe("computeSalaryOffset", () => {
  it("returns negative for below-p25 salary", () => {
    // Sr PM Blr 8-12 p25 ~ 35L. User on 20L → below.
    const offset = computeSalaryOffset(20, "Bangalore", "Senior Product Manager", 10)
    expect(offset).toBeLessThan(0)
  })
  it("returns 0 for above-p75 salary (asymmetric)", () => {
    const offset = computeSalaryOffset(80, "Bangalore", "Senior Product Manager", 10)
    expect(offset).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- tests/benchmarks.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement the benchmarks module**

Write `lib/benchmarks.ts`:
```ts
import benchmarksJson from "../data/benchmarks.json"
import type { City, Role, YoeBand } from "./types"

// Driver-pay anchors per spec §6. Informal sources; refine post-launch.
const UBER_DRIVER_DAILY_INR: Record<City, number> = {
  Bangalore: 600,
  Mumbai: 700,
  Gurgaon: 650,
  Chennai: 500,
  Hyderabad: 550,
}

export function yoeToBand(yoe: number): YoeBand {
  if (yoe <= 3) return "0-3"
  if (yoe <= 7) return "4-7"
  if (yoe <= 12) return "8-12"
  return "13+"
}

export interface SalaryCell {
  p25: number
  p50: number
  p75: number
  p90: number
  confidence: "high" | "medium" | "low"
  sources: string[]
}

export function lookupSalary(city: City, role: Role, yoe: number): SalaryCell | undefined {
  const band = yoeToBand(yoe)
  // @ts-expect-error JSON structure is dynamic at type level
  return benchmarksJson.salaries?.[city]?.[role]?.[band]
}

export function lookupCityContext(city: City) {
  // @ts-expect-error JSON structure is dynamic at type level
  return benchmarksJson.city_context[city]
}

export function getUberDriverDaily(city: City): number {
  return UBER_DRIVER_DAILY_INR[city]
}

const WORKING_DAYS_PER_YEAR = 250

export function computeRealDailyRate(fixedLakhs: number, variableLakhs: number): number {
  const totalLakhs = fixedLakhs + variableLakhs
  return Math.round((totalLakhs * 100000) / WORKING_DAYS_PER_YEAR)
}

/**
 * Returns a salary offset applied to the Money module score.
 * - Below p25: -15
 * - Between p25 and p50: -5
 * - Between p50 and p75: 0
 * - Above p75: 0 (asymmetric — overpaid doesn't pull score toward stay)
 */
export function computeSalaryOffset(
  totalLakhs: number,
  city: City,
  role: Role,
  yoe: number,
): number {
  const cell = lookupSalary(city, role, yoe)
  if (!cell) return 0
  if (totalLakhs < cell.p25) return -15
  if (totalLakhs < cell.p50) return -5
  return 0
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/benchmarks.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/benchmarks.ts tests/benchmarks.test.ts
git commit -m "feat: benchmarks lookup with YoE banding and salary offset"
```

---

### Task 1.5: Short ID generator

**Files:**
- Create: `lib/short-id.ts`
- Test: `tests/short-id.test.ts`

- [ ] **Step 1: Write test**

Write `tests/short-id.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { generateShortId } from "@/lib/short-id"

describe("generateShortId", () => {
  it("returns 6 chars", () => {
    expect(generateShortId()).toHaveLength(6)
  })
  it("uses only base62 alphabet", () => {
    const id = generateShortId()
    expect(id).toMatch(/^[0-9a-zA-Z]{6}$/)
  })
  it("returns different IDs on consecutive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, generateShortId))
    expect(ids.size).toBeGreaterThan(95)  // collision tolerance for tiny test
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- tests/short-id.test.ts
```

- [ ] **Step 3: Implement**

Write `lib/short-id.ts`:
```ts
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function generateShortId(length = 6): string {
  let out = ""
  const bytes = new Uint8Array(length)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/short-id.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/short-id.ts tests/short-id.test.ts
git commit -m "feat: 6-char base62 short ID generator"
```

---

# Phase 2 — Quiz Flow UI

### Task 2.1: Zustand quiz store

**Files:**
- Create: `store/quiz-store.ts`
- Test: `tests/quiz-store.test.ts`

- [ ] **Step 1: Write the failing test**

Write `tests/quiz-store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest"
import { useQuizStore } from "@/store/quiz-store"

describe("quiz store", () => {
  beforeEach(() => {
    useQuizStore.setState({ setup: null, answers: [], salary: null })
  })
  it("starts empty", () => {
    const s = useQuizStore.getState()
    expect(s.setup).toBeNull()
    expect(s.answers).toEqual([])
  })
  it("records an answer", () => {
    useQuizStore.getState().answer("q1", 2)
    expect(useQuizStore.getState().answers).toEqual([{ question_id: "q1", choice_index: 2 }])
  })
  it("overwrites a previous answer for the same question", () => {
    useQuizStore.getState().answer("q1", 0)
    useQuizStore.getState().answer("q1", 3)
    expect(useQuizStore.getState().answers).toHaveLength(1)
    expect(useQuizStore.getState().answers[0].choice_index).toBe(3)
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- tests/quiz-store.test.ts
```

- [ ] **Step 3: Implement the store**

Write `store/quiz-store.ts`:
```ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Answer, SetupData, SalaryData } from "@/lib/types"

interface QuizState {
  setup: SetupData | null
  answers: Answer[]
  salary: SalaryData | null
  setSetup: (s: SetupData) => void
  answer: (question_id: string, choice_index: 0 | 1 | 2 | 3) => void
  setSalary: (s: SalaryData) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      setup: null,
      answers: [],
      salary: null,
      setSetup: (s) => set({ setup: s }),
      answer: (question_id, choice_index) =>
        set((state) => ({
          answers: [
            ...state.answers.filter((a) => a.question_id !== question_id),
            { question_id, choice_index },
          ],
        })),
      setSalary: (s) => set({ salary: s }),
      reset: () => set({ setup: null, answers: [], salary: null }),
    }),
    { name: "siq-quiz-state" }
  )
)
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/quiz-store.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add store/quiz-store.ts tests/quiz-store.test.ts
git commit -m "feat: zustand quiz store with localStorage persistence"
```

---

### Task 2.2: RisoLayout shared wrapper

**Files:**
- Create: `components/RisoLayout.tsx`

- [ ] **Step 1: Write the component**

Write `components/RisoLayout.tsx`:
```tsx
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  topBarLeft?: ReactNode
  topBarRight?: ReactNode
}

export function RisoLayout({ children, topBarLeft, topBarRight }: Props) {
  return (
    <div className="w-full max-w-mobile mx-auto min-h-screen flex flex-col px-6 py-6 pb-16">
      {(topBarLeft || topBarRight) && (
        <div className="flex justify-between text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-8">
          <span>{topBarLeft}</span>
          <span className="text-accent font-medium">{topBarRight}</span>
        </div>
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/RisoLayout.tsx
git commit -m "feat: RisoLayout shared mobile-width wrapper"
```

---

### Task 2.3: Landing screen (Screen 1)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace landing page**

Replace `app/page.tsx`:
```tsx
import Link from "next/link"
import { RisoLayout } from "@/components/RisoLayout"

export default function LandingPage() {
  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Anonymous">
      <div className="flex flex-col flex-1 justify-center">
        <div className="text-[13px] tracking-[0.2em] uppercase text-accent mb-5 font-medium">
          — 10 minutes · 18 questions —
        </div>
        <h1 className="font-display text-[56px] leading-[0.95] tracking-[-2px] mb-6">
          Should<br />I Quit?
        </h1>
        <p className="text-[17px] leading-[1.45] mb-8 max-w-[340px]">
          An app that asks you 18 questions and answers one.{" "}
          <em className="text-accent font-medium not-italic">
            We don't know who you are. That's the point.
          </em>
        </p>
        <Link
          href="/start"
          className="self-start bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all"
        >
          Start →
        </Link>
        <div className="mt-4 text-[12px] text-ink/55">
          Free · No login · One go
        </div>
      </div>
      <div className="mt-auto pt-8 border-t border-dashed border-ink/30 text-[12px] text-ink/65 leading-relaxed">
        No name. No email. No company.{" "}
        <strong className="text-ink font-medium">Confidentiality is the whole point.</strong>
      </div>
    </RisoLayout>
  )
}
```

- [ ] **Step 2: Visual check**

```bash
npm run dev
```
Open localhost:3000 in mobile-width browser (~440px). Should match `mockups/journey/01-landing.html`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing screen"
```

---

### Task 2.4: Intake form (Screen 2)

**Files:**
- Create: `app/start/page.tsx`
- Modify: `lib/user-uuid.ts` (new helper)

- [ ] **Step 1: Write user-uuid helper**

Write `lib/user-uuid.ts`:
```ts
const KEY = "siq-user-uuid"

export function getOrCreateUserUuid(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

export function getShortUserId(): string {
  const uuid = getOrCreateUserUuid()
  return "usr_" + uuid.replace(/-/g, "").slice(0, 5)
}
```

- [ ] **Step 2: Write intake page**

Write `app/start/page.tsx`:
```tsx
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore } from "@/store/quiz-store"
import { getShortUserId } from "@/lib/user-uuid"
import type { City, Role } from "@/lib/types"

const CITIES: City[] = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Gurgaon"]
const ROLES: Role[] = [
  "Senior Product Manager", "Product Manager", "Associate PM",
  "Software Engineer", "Senior Software Engineer", "Engineering Manager",
  "Designer", "Senior Designer",
  "Data Scientist", "Senior Data Scientist",
  "DevOps Engineer", "QA Engineer",
  "Sales Lead", "Marketing Manager", "Growth Manager", "Customer Success Manager",
  "Finance Analyst", "HR Business Partner", "Operations Manager",
]

export default function StartPage() {
  const router = useRouter()
  const setSetup = useQuizStore((s) => s.setSetup)
  const [city, setCity] = useState<City>("Bangalore")
  const [role, setRole] = useState<Role>("Senior Product Manager")
  const [yoe, setYoe] = useState(8)
  const [userId, setUserId] = useState("")

  useEffect(() => setUserId(getShortUserId()), [])

  const submit = () => {
    setSetup({ city, role, yoe })
    router.push("/quiz")
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Step 1 of 3">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        — First, the basics —
      </div>
      <h1 className="font-display text-[30px] leading-tight tracking-tight mb-3">
        Tell us about you.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Three things to compare your situation.{" "}
        <strong className="font-medium">We never ask your name, email, or where you work.</strong>
      </p>

      <Field label="Your city">
        <select className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none"
          value={city} onChange={e => setCity(e.target.value as City)}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Your role">
        <select className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none"
          value={role} onChange={e => setRole(e.target.value as Role)}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>

      <Field label="Total years of experience">
        <input type="number" className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none"
          value={yoe} onChange={e => setYoe(parseInt(e.target.value) || 0)} />
      </Field>

      <div className="mt-8 p-4 border-l-[3px] border-accent bg-accent/[0.08] flex justify-between items-center">
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase text-accent font-medium mb-1">Your anonymous ID</div>
          <div className="font-display text-[16px]">{userId || "usr_…"}</div>
        </div>
        <div className="text-[11px] text-ink/60 text-right leading-tight">
          Generated.<br />No name attached.
        </div>
      </div>

      <button
        onClick={submit}
        className="mt-8 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all text-center"
      >
        Start the questions →
      </button>
      <div className="text-[11px] text-center mt-3 text-ink/55 italic">18 questions · ~5 minutes</div>
    </RisoLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-1 block font-medium">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Visual check**

Navigate to /start. Match mockup `mockups/journey/02-booking.html`.

- [ ] **Step 4: Commit**

```bash
git add app/start/page.tsx lib/user-uuid.ts
git commit -m "feat: intake form with city/role/yoe + anonymous ID"
```

---

### Task 2.5: QuestionCard component

**Files:**
- Create: `components/QuestionCard.tsx`

- [ ] **Step 1: Write component**

Write `components/QuestionCard.tsx`:
```tsx
import type { Question } from "@/lib/types"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  moduleLabel: string
  onAnswer: (choiceIndex: 0 | 1 | 2 | 3) => void
}

const POLARITY_LABELS = ["A", "B", "C", "D"] as const

export function QuestionCard({ question, questionNumber, totalQuestions, moduleLabel, onAnswer }: Props) {
  const remaining = totalQuestions - questionNumber
  const percentDone = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <>
      <div className="flex justify-between text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-8">
        <span>{moduleLabel}</span>
        <span><span className="text-accent font-medium">{questionNumber}</span> / {totalQuestions}</span>
      </div>
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-3 font-medium">
        — Q{questionNumber} —
      </div>
      <h1 className="font-display text-[32px] leading-tight tracking-tight mb-3">
        {question.prompt}
      </h1>
      <div className="text-[11px] tracking-[0.15em] uppercase text-ink/55 mb-3 mt-8 font-medium">Pick one</div>
      <div className="flex flex-col gap-1.5">
        {question.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i as 0 | 1 | 2 | 3)}
            className="border border-ink/30 hover:border-ink hover:bg-ink/[0.04] py-3 px-4 text-left text-[14.5px] flex items-center gap-3 transition-colors"
          >
            <span className="font-display text-accent text-[12px] min-w-[20px]">0{i + 1}</span>
            <span className="flex-1">{c.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="flex-1 h-[2px] bg-ink/15">
          <div className="h-full bg-accent" style={{ width: `${percentDone}%` }} />
        </div>
        <span className="text-[11px] tracking-[0.15em] uppercase text-ink/55">{remaining} left</span>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/QuestionCard.tsx
git commit -m "feat: QuestionCard component"
```

---

### Task 2.6: Quiz runner page (Screen 3)

**Files:**
- Create: `app/quiz/page.tsx`

- [ ] **Step 1: Write the quiz runner**

Write `app/quiz/page.tsx`:
```tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { QuestionCard } from "@/components/QuestionCard"
import { useQuizStore } from "@/store/quiz-store"
import { QUESTIONS } from "@/lib/questions"

const MODULE_LABELS: Record<string, string> = {
  work: "Section 1 · The Work",
  manager: "Section 2 · The Manager",
  people: "Section 3 · The People",
  growth: "Section 4 · The Growth",
  money: "Section 5 · The Money",
  wellbeing: "Section 6 · The State of You",
}

export default function QuizPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const setup = useQuizStore((s) => s.setup)
  const answer = useQuizStore((s) => s.answer)

  useEffect(() => {
    if (!setup) router.replace("/start")
  }, [setup, router])

  if (!setup) return null

  const q = QUESTIONS[index]
  if (!q) return null

  const handleAnswer = (choiceIndex: 0 | 1 | 2 | 3) => {
    answer(q.id, choiceIndex)
    if (index + 1 >= QUESTIONS.length) {
      router.push("/salary")
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <RisoLayout>
      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={QUESTIONS.length}
        moduleLabel={MODULE_LABELS[q.module] ?? q.module}
        onAnswer={handleAnswer}
      />
    </RisoLayout>
  )
}
```

- [ ] **Step 2: Visual + behavior check**

Walk through all 18 questions in the browser. Confirm:
- Progress bar increments
- Module label changes between modules
- Answers persist in localStorage (refresh mid-quiz, state should be preserved — but for this v1 we restart on refresh; back navigation is a nice-to-have to add post-MVP)
- Lands on /salary after Q18

- [ ] **Step 3: Commit**

```bash
git add app/quiz/page.tsx
git commit -m "feat: quiz runner page (18 questions, one per screen)"
```

---

### Task 2.7: Salary screen (Screen 4)

**Files:**
- Create: `app/salary/page.tsx`

- [ ] **Step 1: Write salary page**

Write `app/salary/page.tsx`:
```tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore } from "@/store/quiz-store"

export default function SalaryPage() {
  const router = useRouter()
  const setup = useQuizStore((s) => s.setup)
  const answers = useQuizStore((s) => s.answers)
  const setSalary = useQuizStore((s) => s.setSalary)
  const [fixed, setFixed] = useState(18)
  const [variable, setVariable] = useState(4)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!setup) router.replace("/start")
    else if (answers.length === 0) router.replace("/quiz")
  }, [setup, answers, router])

  const total = (fixed || 0) + (variable || 0)

  const submit = async () => {
    setSubmitting(true)
    setSalary({ fixed_lakhs: fixed, variable_lakhs: variable })
    // POST to /api/sessions — implementation in Task 3.2
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setup, answers,
        salary: { fixed_lakhs: fixed, variable_lakhs: variable },
        user_uuid: localStorage.getItem("siq-user-uuid"),
      }),
    })
    const { id } = await res.json()
    router.push(`/r/${id}`)
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Step 3 of 3">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        — Almost done —
      </div>
      <h1 className="font-display text-[28px] leading-tight tracking-tight mb-4">
        One last thing.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Your salary. It's the biggest input into the verdict.{" "}
        <strong className="font-medium">Anonymous. Stored as a number, never tied to you.</strong>
      </p>

      <SalaryField label="Annual fixed (CTC)" value={fixed} onChange={setFixed} />
      <SalaryField label="Variable + bonus + ESOPs" value={variable} onChange={setVariable} />

      <div className="mt-5 py-4 border-t border-b border-ink flex justify-between items-center">
        <span className="text-[11px] tracking-[0.18em] uppercase text-ink/60">Total</span>
        <span className="font-display text-[28px] tracking-tight">₹{total} L</span>
      </div>

      <button
        onClick={submit} disabled={submitting}
        className="mt-8 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] disabled:opacity-50"
      >
        {submitting ? "Computing…" : "See the verdict →"}
      </button>
      <div className="text-[11px] text-center mt-3 text-ink/55 italic">
        Anonymous · Never tied to you
      </div>
    </RisoLayout>
  )
}

function SalaryField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-1.5 font-medium">{label}</div>
      <div className="flex items-center border-b-[1.5px] border-ink py-1.5 focus-within:border-accent">
        <span className="font-display text-[18px] text-accent mr-2">₹</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="flex-1 bg-transparent border-0 outline-none font-display text-[22px]"
        />
        <span className="text-[11px] text-ink/55 tracking-[0.1em] uppercase">Lakhs</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/salary/page.tsx
git commit -m "feat: salary screen with fixed + variable inputs"
```

---

# Phase 3 — Persistence (Supabase)

### Task 3.1: Supabase schema migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Write migration**

Write `supabase/migrations/0001_init.sql`:
```sql
-- sessions: one row per completed quiz
create table sessions (
  id text primary key,
  user_uuid uuid not null,
  city text not null,
  role text not null,
  yoe int not null,
  salary_fixed_lakhs numeric(6,2),
  salary_variable_lakhs numeric(6,2),
  created_at timestamptz default now(),
  master_score int,
  module_work int,
  module_manager int,
  module_people int,
  module_growth int,
  module_money int,
  module_wellbeing int,
  verdict_tier text,
  weakest_module text,
  intent_to_quit int,
  cynicism int,
  agency int,
  diagnosis_paragraph text,
  diagnosis_actions jsonb
);

create table answers (
  session_id text references sessions(id) on delete cascade,
  question_id text not null,
  choice_index int not null,
  primary key (session_id, question_id)
);

create index idx_sessions_user_uuid on sessions(user_uuid);
create index idx_sessions_bucket on sessions(role, city, yoe);

alter table sessions enable row level security;
alter table answers enable row level security;

-- Public can insert their own session and read any session by short ID
create policy "anonymous insert sessions" on sessions for insert with check (true);
create policy "public read sessions" on sessions for select using (true);
create policy "anonymous insert answers" on answers for insert with check (true);
create policy "public read answers" on answers for select using (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Use the Supabase MCP tool (`mcp__plugin_supabase_supabase__authenticate` first) to push the migration. Confirm tables exist in dashboard.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "chore: supabase schema for sessions and answers"
```

---

### Task 3.2: POST /api/sessions endpoint

**Files:**
- Create: `lib/supabase.ts`
- Create: `app/api/sessions/route.ts`

- [ ] **Step 1: Supabase client**

Write `lib/supabase.ts`:
```ts
import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 2: Add env template**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

Copy to `.env.local` and fill in real values (do NOT commit `.env.local`).

- [ ] **Step 3: Write route**

Write `app/api/sessions/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { computeScores } from "@/lib/scoring"
import { computeSalaryOffset } from "@/lib/benchmarks"
import { generateShortId } from "@/lib/short-id"
import type { Answer, City, Role, SetupData, SalaryData } from "@/lib/types"

interface Payload {
  setup: SetupData
  answers: Answer[]
  salary: SalaryData
  user_uuid: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  const { setup, answers, salary, user_uuid } = body

  if (!setup || !answers || !salary || !user_uuid) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }

  const scores = computeScores(answers)
  const offset = computeSalaryOffset(
    salary.fixed_lakhs + salary.variable_lakhs,
    setup.city as City,
    setup.role as Role,
    setup.yoe,
  )
  const adjMoney = Math.max(0, scores.modules.money + offset)
  const adjMaster = Math.round(
    0.11 * scores.modules.work +
    0.18 * scores.modules.manager +
    0.10 * scores.modules.people +
    0.18 * scores.modules.growth +
    0.25 * adjMoney +
    0.18 * scores.modules.wellbeing
  )

  const id = generateShortId()

  const { error: sessionErr } = await supabaseAdmin.from("sessions").insert({
    id, user_uuid,
    city: setup.city, role: setup.role, yoe: setup.yoe,
    salary_fixed_lakhs: salary.fixed_lakhs,
    salary_variable_lakhs: salary.variable_lakhs,
    master_score: adjMaster,
    module_work: scores.modules.work,
    module_manager: scores.modules.manager,
    module_people: scores.modules.people,
    module_growth: scores.modules.growth,
    module_money: adjMoney,
    module_wellbeing: scores.modules.wellbeing,
    verdict_tier: scores.tier,
    weakest_module: scores.weakest_module,
    intent_to_quit: scores.intent_to_quit,
    cynicism: scores.cynicism,
    agency: scores.agency,
  })

  if (sessionErr) {
    return NextResponse.json({ error: sessionErr.message }, { status: 500 })
  }

  const { error: answersErr } = await supabaseAdmin.from("answers").insert(
    answers.map((a) => ({ session_id: id, question_id: a.question_id, choice_index: a.choice_index }))
  )
  if (answersErr) {
    return NextResponse.json({ error: answersErr.message }, { status: 500 })
  }

  return NextResponse.json({ id })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase.ts .env.local.example app/api/sessions/route.ts
git commit -m "feat: POST /api/sessions persists answers and computed scores"
```

---

# Phase 4 — Result Page

### Task 4.1: VerdictBlock component

**Files:**
- Create: `components/VerdictBlock.tsx`

- [ ] **Step 1: Component**

Write `components/VerdictBlock.tsx`:
```tsx
import type { VerdictTier } from "@/lib/types"

const TIER_LABELS: Record<VerdictTier, string> = {
  STAY_THRIVE: "Stay & Thrive ✅",
  STAY_FIX: "Stay & Fix 🤔",
  ITS_COMPLICATED: "It's Complicated 🤷",
  START_LOOKING: "Start Looking 🚪",
  LEAVE_NOW: "Leave Now 🔥",
}

const TIER_TAGLINES: Record<VerdictTier, string> = {
  STAY_THRIVE: "You're winning. Close the tabs. Touch grass.",
  STAY_FIX: "Mostly fine. Fix the one broken thing.",
  ITS_COMPLICATED: "The middle. You know it. The data confirms it.",
  START_LOOKING: "Update the CV. You don't need to bolt today, but start.",
  LEAVE_NOW: "The math is done. Open LinkedIn.",
}

export function VerdictBlock({ tier, score }: { tier: VerdictTier; score: number }) {
  return (
    <div className="bg-accent text-paper py-9 px-5 -mx-6 mb-8 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase opacity-75 mb-2.5 font-medium">— Recommendation —</div>
      <h1 className="font-display text-[42px] leading-[0.95] tracking-tight mb-4 uppercase">
        {TIER_LABELS[tier]}
      </h1>
      <div className="flex justify-center items-baseline gap-1.5 font-display">
        <span className="text-[64px] leading-[0.9] tracking-[-2px]">{score}</span>
        <span className="text-[18px] opacity-70">/ 100</span>
      </div>
      <div className="mt-4 italic text-[15px] leading-snug opacity-95">"{TIER_TAGLINES[tier]}"</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/VerdictBlock.tsx
git commit -m "feat: VerdictBlock hero"
```

---

### Task 4.2: MoneySection component

**Files:**
- Create: `components/MoneySection.tsx`

- [ ] **Step 1: Component**

Write `components/MoneySection.tsx`:
```tsx
import type { City, Role } from "@/lib/types"
import { lookupSalary, computeRealDailyRate, getUberDriverDaily, yoeToBand } from "@/lib/benchmarks"

interface Props {
  city: City
  role: Role
  yoe: number
  fixed_lakhs: number
  variable_lakhs: number
}

export function MoneySection({ city, role, yoe, fixed_lakhs, variable_lakhs }: Props) {
  const total = fixed_lakhs + variable_lakhs
  const salaryCell = lookupSalary(city, role, yoe)
  const realDaily = computeRealDailyRate(fixed_lakhs, variable_lakhs)
  const uberDaily = getUberDriverDaily(city)
  const delta = realDaily - uberDaily
  const band = yoeToBand(yoe)

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-3.5 border-t border-ink/20">
        The Money
      </h2>
      <div className="flex flex-col">
        <Row label="Your salary" value={`₹${total} L`} />
        {salaryCell && (
          <Row label={`Market · ${role} · ${city} · ${band} yr`} value={`₹${salaryCell.p50} L`} />
        )}
        <Row label="Your real take-home / day" value={`₹${realDaily}`} highlight />
        <Row label={`🚗 ${city} Uber driver / day`} value={`₹${uberDaily}`} muted />
      </div>
      <div className="mt-2 py-2.5 px-3 bg-accent/10 border-l-[3px] border-accent text-[13px]">
        {delta >= 0
          ? <>You earn <strong className="font-medium text-accent">₹{delta} more</strong> per day than an Uber driver. ☠️</>
          : <>You earn <strong className="font-medium text-accent">₹{-delta} LESS</strong> per day than an Uber driver. ☠️☠️</>
        }
      </div>
    </>
  )
}

function Row({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-ink/[0.12] text-[14px] ${highlight ? "font-medium text-ink" : ""} ${muted ? "text-ink/60 text-[13px]" : ""}`}>
      <span>{label}</span>
      <span className="font-display text-[15px]">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MoneySection.tsx
git commit -m "feat: MoneySection with salary vs market + Uber comparison"
```

---

### Task 4.3: Diagnosis prompt + Claude API route

**Files:**
- Create: `lib/claude.ts`
- Create: `app/api/diagnose/route.ts`

- [ ] **Step 1: Claude wrapper + prompt**

Write `lib/claude.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk"
import type { ModuleName, VerdictTier } from "./types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface DiagnoseInput {
  city: string
  role: string
  yoe: number
  tier: VerdictTier
  master: number
  modules: Record<ModuleName, number>
  weakest_module: ModuleName
  salary_vs_market: "below" | "near" | "above"
  intent_to_quit: number
  cynicism: number
  top_extreme_answers: string[]  // 3-5 quotes of the user's most-extreme answer labels
}

const SYSTEM_PROMPT = `You are writing a brutally honest, lightly funny career diagnosis for someone who took an 18-question quiz called "Should I Quit".

Tone:
- Direct second-person ("you...")
- No narrator, no signature, no "we"
- Indian English. Conversational. Sharp.
- Never use: "leverage", "synergy", "journey", "actionable", "ecosystem", "ownership"
- If they're below-market on salary AND in a leave-leaning tier, prioritize building runway over quitting
- If they're above-market on salary, point out the golden-cage trap

Format your response as JSON only:
{
  "diagnosis": "<two short paragraphs, max 120 words total>",
  "actions": ["<action 1>", "<action 2>", "<action 3>"]
}

Actions are specific, this-week things to try. Concrete. No corporate speak.`

export async function diagnose(input: DiagnoseInput): Promise<{ diagnosis: string; actions: string[] }> {
  const userMessage = `User context:
- Role: ${input.role} in ${input.city}, ${input.yoe} YoE
- Verdict: ${input.tier} (${input.master}/100)
- Module scores: work ${input.modules.work}, manager ${input.modules.manager}, people ${input.modules.people}, growth ${input.modules.growth}, money ${input.modules.money}, wellbeing ${input.modules.wellbeing}
- Weakest module: ${input.weakest_module}
- Salary vs market: ${input.salary_vs_market}
- Intent-to-quit accumulator: ${input.intent_to_quit} (higher = more "I'm done")
- Cynicism accumulator: ${input.cynicism}
- Most extreme answers they picked:
${input.top_extreme_answers.map((a, i) => `  ${i + 1}. "${a}"`).join("\n")}

Write the diagnosis. JSON only.`

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : "{}"
  const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim()
  return JSON.parse(cleaned)
}

export function templatedDiagnosis(weakest: ModuleName, tier: VerdictTier): { diagnosis: string; actions: string[] } {
  // Fallback if API fails. Keyed by weakest module + tier.
  const templates: Partial<Record<`${ModuleName}_${VerdictTier}`, { diagnosis: string; actions: string[] }>> = {
    manager_LEAVE_NOW: {
      diagnosis: "The data is clear: your manager is the fire. Everything else is downstream. Switching companies may help, but if you don't break the pattern of taking abuse from authority, the next manager will look just like this one.\n\nThe math is done.",
      actions: ["Open LinkedIn. Update the headline.", "Take two recruiter calls this week.", "Write the resignation draft. You'll feel lighter just having it."],
    },
    // Add more as needed
  }
  return templates[`${weakest}_${tier}`] ?? {
    diagnosis: "Your score puts you in a meaningful middle band. The weakest area in your job right now is the one to focus on — and changing companies won't automatically fix it.",
    actions: ["Identify the one thing most broken at work.", "Test one fix this week.", "Re-check this quiz in 90 days."],
  }
}
```

- [ ] **Step 2: Diagnosis route**

Write `app/api/diagnose/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { diagnose, templatedDiagnosis } from "@/lib/claude"
import { QUESTIONS } from "@/lib/questions"
import { lookupSalary } from "@/lib/benchmarks"
import type { City, Role, ModuleName, VerdictTier } from "@/lib/types"

export async function POST(req: NextRequest) {
  const { session_id } = await req.json()
  if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 })

  const { data: session } = await supabaseAdmin.from("sessions").select("*").eq("id", session_id).single()
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (session.diagnosis_paragraph) {
    return NextResponse.json({ diagnosis: session.diagnosis_paragraph, actions: session.diagnosis_actions })
  }

  const { data: answers } = await supabaseAdmin.from("answers").select("*").eq("session_id", session_id)

  // Find top extreme answers (choice_index 3 = the punchline D options)
  const top_extreme_answers = (answers ?? [])
    .filter((a) => a.choice_index === 3)
    .map((a) => QUESTIONS.find((q) => q.id === a.question_id)?.choices[3].label ?? "")
    .filter(Boolean)
    .slice(0, 5)

  // Salary vs market
  const cell = lookupSalary(session.city as City, session.role as Role, session.yoe)
  const total = (session.salary_fixed_lakhs ?? 0) + (session.salary_variable_lakhs ?? 0)
  let salary_vs_market: "below" | "near" | "above" = "near"
  if (cell) {
    if (total < cell.p25) salary_vs_market = "below"
    else if (total > cell.p75) salary_vs_market = "above"
  }

  let result: { diagnosis: string; actions: string[] }
  try {
    result = await diagnose({
      city: session.city,
      role: session.role,
      yoe: session.yoe,
      tier: session.verdict_tier as VerdictTier,
      master: session.master_score,
      modules: {
        work: session.module_work,
        manager: session.module_manager,
        people: session.module_people,
        growth: session.module_growth,
        money: session.module_money,
        wellbeing: session.module_wellbeing,
      },
      weakest_module: session.weakest_module as ModuleName,
      salary_vs_market,
      intent_to_quit: session.intent_to_quit,
      cynicism: session.cynicism,
      top_extreme_answers,
    })
  } catch (err) {
    console.error("Claude API failed, using template", err)
    result = templatedDiagnosis(session.weakest_module as ModuleName, session.verdict_tier as VerdictTier)
  }

  // Cache for next visit
  await supabaseAdmin.from("sessions").update({
    diagnosis_paragraph: result.diagnosis,
    diagnosis_actions: result.actions,
  }).eq("id", session_id)

  return NextResponse.json(result)
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/claude.ts app/api/diagnose/route.ts
git commit -m "feat: Claude API diagnosis with templated fallback"
```

---

### Task 4.4: Result page + DiagnosisBlock + ShareButtons + HelplineFooter

**Files:**
- Create: `components/DiagnosisBlock.tsx`
- Create: `components/ShareButtons.tsx`
- Create: `components/HelplineFooter.tsx`
- Create: `app/r/[id]/page.tsx`

- [ ] **Step 1: HelplineFooter**

Write `components/HelplineFooter.tsx`:
```tsx
export function HelplineFooter() {
  return (
    <div className="mt-6 text-[12px] leading-relaxed text-ink/70 text-center italic">
      Struggling with more than work? <strong className="font-medium not-italic text-ink">iCall 9152987821</strong> · <strong className="font-medium not-italic text-ink">Vandrevala 1860-2662-345</strong>
    </div>
  )
}
```

- [ ] **Step 2: DiagnosisBlock**

Write `components/DiagnosisBlock.tsx`:
```tsx
interface Props {
  diagnosis: string | null
  actions: string[] | null
  loading: boolean
}

export function DiagnosisBlock({ diagnosis, actions, loading }: Props) {
  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-3.5 border-t border-ink/20">Your diagnosis</h2>
      {loading || !diagnosis ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-ink/15 rounded" />
          <div className="h-4 bg-ink/15 rounded w-5/6" />
          <div className="h-4 bg-ink/15 rounded w-4/6" />
        </div>
      ) : (
        <div className="pl-3.5 border-l-2 border-accent text-[15px] leading-[1.6] space-y-3 whitespace-pre-line">
          {diagnosis}
        </div>
      )}
      {actions && (
        <>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">This week, try</h2>
          <div className="flex flex-col gap-3.5">
            {actions.map((a, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="font-display text-[18px] text-accent min-w-[28px] leading-snug">0{i + 1}</div>
                <div className="text-[14.5px] leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: ShareButtons**

Write `components/ShareButtons.tsx`:
```tsx
"use client"
import { useState } from "react"

interface Props {
  shareUrl: string
  tier: string
  score: number
  weakestModule: string
}

const TIER_TEXT: Record<string, string> = {
  STAY_THRIVE: "STAY & THRIVE ✅",
  STAY_FIX: "STAY & FIX 🤔",
  ITS_COMPLICATED: "IT'S COMPLICATED 🤷",
  START_LOOKING: "START LOOKING 🚪",
  LEAVE_NOW: "LEAVE NOW 🔥",
}

export function ShareButtons({ shareUrl, tier, score, weakestModule }: Props) {
  const [copied, setCopied] = useState(false)

  const text = `Just got diagnosed: ${TIER_TEXT[tier]} (${score}/100). The ${weakestModule} problem.\n\nTake yours (5 min, anonymous): ${shareUrl}`

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ text, url: shareUrl })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-8 pt-4 border-t border-ink/20">
      <div className="text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-2.5 text-center font-medium">Share</div>
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={share} className="border border-ink px-3.5 py-2 text-[12px] font-medium hover:bg-ink hover:text-paper transition-colors">
          📱 Share
        </button>
        <button onClick={copy} className="border border-ink px-3.5 py-2 text-[12px] font-medium hover:bg-ink hover:text-paper transition-colors">
          🔗 {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Result page**

Write `app/r/[id]/page.tsx`:
```tsx
"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabaseAnon } from "@/lib/supabase"
import { RisoLayout } from "@/components/RisoLayout"
import { VerdictBlock } from "@/components/VerdictBlock"
import { MoneySection } from "@/components/MoneySection"
import { DiagnosisBlock } from "@/components/DiagnosisBlock"
import { ShareButtons } from "@/components/ShareButtons"
import { HelplineFooter } from "@/components/HelplineFooter"
import { getOrCreateUserUuid } from "@/lib/user-uuid"
import type { City, Role, VerdictTier } from "@/lib/types"

export default function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<any>(null)
  const [diagnosis, setDiagnosis] = useState<{ diagnosis: string; actions: string[] } | null>(null)
  const [isTaker, setIsTaker] = useState(false)

  useEffect(() => {
    supabaseAnon.from("sessions").select("*").eq("id", id).single().then(({ data }) => {
      setSession(data)
      if (data && getOrCreateUserUuid() === data.user_uuid) {
        setIsTaker(true)
      }
    })
  }, [id])

  useEffect(() => {
    if (session && isTaker) {
      fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: id }),
      })
        .then(r => r.json())
        .then(setDiagnosis)
    }
  }, [session, isTaker, id])

  if (!session) return <RisoLayout>Loading…</RisoLayout>

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  if (!isTaker) {
    return (
      <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Visitor view">
        <div className="text-[12px] tracking-[0.2em] uppercase text-accent text-center mb-2 font-medium">— Someone shared this —</div>
        <p className="text-[16px] leading-snug text-center mb-7">
          A friend took the quiz. The verdict on their job: <strong className="text-accent font-medium">{session.verdict_tier}</strong>
        </p>
        <VerdictBlock tier={session.verdict_tier as VerdictTier} score={session.master_score} />
        <div className="text-center text-[12px] text-ink/60 italic mb-8">
          Their salary, answers and diagnosis are not shown. That's the whole point.
        </div>
        <div className="mt-auto pt-6 border-t border-dashed border-ink/30 text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-accent mb-2 font-medium">— Your turn —</div>
          <h2 className="font-display text-[32px] tracking-tight mb-3.5">Take yours.</h2>
          <p className="text-[14px] text-ink/75 mb-5">10 minutes. Anonymous. We won't ask your name either.</p>
          <a href="/" className="inline-block bg-ink text-paper px-6 py-3.5 text-[14px] font-medium shadow-[3px_3px_0_#e8576b]">
            Start →
          </a>
        </div>
      </RisoLayout>
    )
  }

  return (
    <RisoLayout topBarLeft={`usr_${session.user_uuid.slice(0, 5)}`} topBarRight="Confidential">
      <VerdictBlock tier={session.verdict_tier as VerdictTier} score={session.master_score} />
      <MoneySection
        city={session.city as City}
        role={session.role as Role}
        yoe={session.yoe}
        fixed_lakhs={session.salary_fixed_lakhs}
        variable_lakhs={session.salary_variable_lakhs}
      />
      <DiagnosisBlock
        diagnosis={diagnosis?.diagnosis ?? null}
        actions={diagnosis?.actions ?? null}
        loading={!diagnosis}
      />
      <ShareButtons shareUrl={shareUrl} tier={session.verdict_tier} score={session.master_score} weakestModule={session.weakest_module} />
      <HelplineFooter />
    </RisoLayout>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/DiagnosisBlock.tsx components/ShareButtons.tsx components/HelplineFooter.tsx app/r/
git commit -m "feat: result page with taker/visitor views"
```

---

# Phase 5 — Share Card Image (OG)

### Task 5.1: OG image route

**Files:**
- Create: `app/api/og/[id]/route.tsx`
- Modify: `app/r/[id]/page.tsx` (add OG meta tags)

- [ ] **Step 1: OG route**

Write `app/api/og/[id]/route.tsx`:
```tsx
import { ImageResponse } from "@vercel/og"
import { supabaseAdmin } from "@/lib/supabase"

export const runtime = "edge"

const TIER_TEXT: Record<string, string> = {
  STAY_THRIVE: "Stay & Thrive ✅",
  STAY_FIX: "Stay & Fix 🤔",
  ITS_COMPLICATED: "It's Complicated 🤷",
  START_LOOKING: "Start Looking 🚪",
  LEAVE_NOW: "Leave Now 🔥",
}

const TIER_BG: Record<string, string> = {
  STAY_THRIVE: "#5a8a5a",
  STAY_FIX: "#7a9050",
  ITS_COMPLICATED: "#c9a227",
  START_LOOKING: "#d47a2a",
  LEAVE_NOW: "#e8576b",
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data: session } = await supabaseAdmin.from("sessions").select("*").eq("id", params.id).single()
  if (!session) return new Response("not found", { status: 404 })

  return new ImageResponse(
    (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        width: "100%", height: "100%", padding: "70px 60px",
        background: "#f4ecd6", color: "#0e3870",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", opacity: 0.6 }}>
          <span>shouldiquit.app</span>
          <span style={{ color: "#e8576b", fontWeight: 600 }}>Anonymous</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 26, letterSpacing: 8, color: "#e8576b", marginBottom: 40, fontWeight: 600 }}>— FINAL RECOMMENDATION —</div>
          <div style={{ fontSize: 128, fontWeight: 900, lineHeight: 0.92, letterSpacing: -5, color: TIER_BG[session.verdict_tier], textTransform: "uppercase" }}>
            {TIER_TEXT[session.verdict_tier]}
          </div>
          <div style={{ fontSize: 220, fontWeight: 900, lineHeight: 1, marginTop: 30, color: "#0e3870" }}>
            {session.master_score}<span style={{ fontSize: 64, color: "#e8576b" }}>/100</span>
          </div>
          <div style={{ marginTop: 40, fontSize: 28, letterSpacing: 4, color: "#0e3870", textTransform: "uppercase", opacity: 0.8 }}>
            Weakest: <span style={{ color: "#e8576b", fontWeight: 600 }}>The {session.weakest_module}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, borderTop: "2px solid rgba(14,56,112,0.2)", fontSize: 28, opacity: 0.7 }}>
          <span><span style={{ color: "#e8576b", fontWeight: 600 }}>shouldiquit</span>.app/r/{params.id}</span>
          <span style={{ fontWeight: 600 }}>Take yours →</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  )
}
```

- [ ] **Step 2: Add OG meta to result page**

Add `generateMetadata` server-side export to `app/r/[id]/page.tsx`. Since the existing page is a client component, create `app/r/[id]/layout.tsx` for the metadata:

Write `app/r/[id]/layout.tsx`:
```tsx
import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabaseAdmin.from("sessions").select("verdict_tier,master_score").eq("id", params.id).single()
  if (!data) return { title: "Should I Quit" }
  return {
    title: `Should I Quit? — ${data.verdict_tier} (${data.master_score}/100)`,
    openGraph: {
      images: [{ url: `/api/og/${params.id}`, width: 1080, height: 1080 }],
    },
    twitter: { card: "summary_large_image", images: [`/api/og/${params.id}`] },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 3: Test**

After deploying or running locally: visit `localhost:3000/api/og/<existing-session-id>` — should render a 1080×1080 PNG matching the share-card mockup.

- [ ] **Step 4: Commit**

```bash
git add app/api/og/ app/r/[id]/layout.tsx
git commit -m "feat: 1080x1080 OG share card via @vercel/og"
```

---

# Phase 6 — Polish & Deploy

### Task 6.1: Happy-path E2E test

**Files:**
- Create: `tests/e2e/happy-path.spec.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Playwright config**

```bash
npx playwright install chromium
```

Write `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
})
```

- [ ] **Step 2: Write E2E test**

Write `tests/e2e/happy-path.spec.ts`:
```ts
import { test, expect } from "@playwright/test"

test("complete the quiz end-to-end", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /Should\s+I Quit/ })).toBeVisible()
  await page.getByRole("link", { name: /Start/ }).click()
  await page.getByRole("button", { name: /Start the questions/ }).click()

  for (let i = 0; i < 18; i++) {
    await page.locator("button:has-text('02')").first().click()  // pick option B every time
  }

  await expect(page).toHaveURL(/\/salary$/)
  await page.getByRole("button", { name: /See the verdict/ }).click()
  await page.waitForURL(/\/r\//, { timeout: 10000 })
  await expect(page.locator("text=/100/")).toBeVisible()
})
```

- [ ] **Step 3: Run E2E**

```bash
npx playwright test
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/ playwright.config.ts
git commit -m "test: end-to-end happy path"
```

---

### Task 6.2: Vercel deploy

- [ ] **Step 1: Push to GitHub**

```bash
gh repo create shouldiquit --private --source=. --remote=origin --push
```

- [ ] **Step 2: Deploy via Vercel CLI**

```bash
npx vercel --prod
```

Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

- [ ] **Step 3: Smoke test on production URL**

Walk through the full flow on the deployed URL. Verify:
- Landing loads
- Quiz completes
- Verdict page shows diagnosis
- Share card image renders at `/api/og/<id>`

---

## Open items NOT in this plan (Phase 2 backlog)

- Back navigation within quiz
- Module-transition cards (decided to drop per design doc)
- Re-test in 90-day reminder
- Compare-with-friends mechanic
- Trim Manager + People modules from 4 → 3 (decide which to drop based on early user data)
- Backfill Money module to 3 questions
- Custom font-loading via `next/font` (currently CSS @import — fine for v1)
- Pre-compute benchmarks during quiz (currently looked up at result-time)
- Refresh `data/benchmarks.json` quarterly

---

*End of plan.*
