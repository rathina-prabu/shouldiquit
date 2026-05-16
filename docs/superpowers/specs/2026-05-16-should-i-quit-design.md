# Should I Quit — Design Spec

**Date:** 2026-05-16
**Status:** Draft for review

---

## 1. What we're building

A 10-minute anonymous web app that helps Indian IT professionals decide whether to quit their job. The user has a one-time consultation with "Dr. K" (a fictional independent career therapist), answers 20 questions about their work, discloses their salary, and receives a verdict (LEAVE NOW / STAY & FIX / etc.), a Money section comparing their real hourly rate to gig workers in their city, an LLM-generated diagnosis paragraph, and a shareable card.

**Target audience:** Indian IT professionals 25-45 in Bangalore, Mumbai, Hyderabad, Chennai, Gurgaon. The person quietly googling "should I quit my job" at 11 PM.

**Why it exists:** Existing tools are HR-sanitized, paid coaches, or shallow BuzzFeed quizzes. There is no honest, free, structured, fun tool that combines self-diagnostic depth with shareable output.

**Hook:** Two things do the heavy lifting:
1. **The Card** — square share image with verdict + score + brutal stat. Screenshot-friendly. Spotify-Wrapped/16Personalities pattern.
2. **The Real Hourly Rate** — your salaried hourly pay vs Uber/auto/Swiggy driver pay in your city. Visceral, shareable, India-specific.

---

## 2. Brand & tone

- **Product name:** Should I Quit
- **Persona: none.** No character. No mascot. No "Dr.", "The Practice", "We the team", or any narrator. The product is a tool — it asks questions, gives an answer.
- **Voice:** direct second-person ("you…"), conversational, opinionated. Sharp without a speaker.
- **Tagline candidates:**
  - "We don't know who you are. That's the point."
  - "The career checkup HR won't give you."
- **Tone:** Light, funny, edgy. Indian internet humor. Never preachy. The copy carries the personality, no character does.

---

## 3. User journey

**7 screens**, all mobile-first.

| # | Screen | Purpose |
|---|---|---|
| 1 | **Landing** | Pitch · "Start" CTA · privacy promise |
| 2 | **Tell us about yourself** | City · role · total YoE. Anonymous ID auto-generated and visibly shown |
| 3 | **Question (×20)** | One question per screen, 4 reply options, progress bar with current section name |
| 4 | **Salary** | Fixed + Variable inputs, anonymity reassurance, mandatory |
| 5 | **Result (taker view)** | Verdict, score, money section, diagnosis, 3 actions, share buttons |
| 6 | **Share card (image)** | 1080×1080 image generated server-side, screenshot/save target |
| 7 | **Visitor view of result** | What anyone with the URL sees (stripped) |

**Dropped from earlier draft:** *pre-session loading beat* and *module transition cards*. Both existed only because there was a character animating them. Without a character, both become dead weight. Module identity is now shown inline on the question screen header (e.g. "Section 5 · The State of You · Q15/20").

Mockups for all 7 in riso-zine aesthetic at `mockups/journey/`.

---

## 4. The questions

**Total: 16 questions across 6 modules.** No icons. All 4-option multiple choice. Polarity rule: A positive · B neutral positive · C neutral negative · D negative.

**Modules & weights (sum to 100%):**

| Module | Weight | Questions |
|---|---|---|
| The Work | 11% | 3 |
| The Manager | 18% | 4 (trim to 3 in implementation) |
| The People | 10% | 4 (trim to 3 in implementation) |
| The Growth | 18% | 3 |
| The Money | 25% | 2 |
| The State of You | 18% | 2 |

Money is the heaviest single factor — salary input feeds directly into score, not just display.

**Modules dropped from original 8-module spec:** *The Company* and *The Life Fit*. Strongest signals folded into surviving modules.

**No skip.** Forced choice on all questions. Back navigation enabled.

---

### Module 1 · THE WORK

**Q1. The nature of your work, most weeks:**
- A. A meaty mix — real challenges, things to figure out.
- B. Mostly repetitive, occasional spike of something interesting.
- C. Directionless — you do work, no one's quite sure why.
- D. Pure execution of someone else's blueprint. No thinking.

**Q2. Skill development at this job:**
- A. Going wide — picking up new skills regularly.
- B. Going deep — sharpening a few skills into real expertise.
- C. Plateaued — no real skill movement in a while.
- D. Going backwards — losing edges you had when you joined.

**Q3. Who actually notices the work you do?**
- A. Customers.
- B. Leadership / the wider org.
- C. Just my manager.
- D. Honestly, nobody.

---

### Module 2 · THE MANAGER (4 — trim to 3)

**Q4. Manager takes a sick day. You...**
- A. Send them a "feel better" note. And mean it.
- B. Carry on. They're fine, you're fine.
- C. Quiet relief. The day just got easier.
- D. Praying it's a broken leg. Both ideally.

**Q5. How does your manager treat off-hours?**
- A. Respects them. No pings after work hours.
- B. Slacks at 10pm but writes "no rush" — and means it.
- C. Pings whenever. Expects replies fast.
- D. Phone calls. At 11pm. On a Sunday. About something that could've waited.

**Q6. The feedback you get from them:**
- A. Sharp and specific. You leave 1:1s with something to do.
- B. "Keep doing what you're doing." Said warmly. Useless.
- C. Silent when it works. Loud when something breaks.
- D. "Be more proactive." "Create visibility." Same words, every year.

**Q7. When your work goes up to leadership, credit:**
- A. They name you. By name. Unprompted.
- B. Mentioned when relevant. Fair share.
- C. "The team did great work." Your specific bit, invisible.
- D. They take it. Personally. Like you weren't even in the room.

---

### Module 3 · THE PEOPLE (4 — trim to 3)

**Q8. Friends at work:**
- A. Multiple. You'd still hang out with them even if you quit tomorrow.
- B. One real one. Your work-survival lifeline. Mostly at work though.
- C. Friendly with everyone. Close to no one.
- D. Pretty sure there's a team WhatsApp without you in it.

**Q9. Politics at work:**
- A. What politics? People mostly just work.
- B. Some politics. You know the landmines.
- C. Active warzone. Half your energy goes to surviving it.
- D. Every resignation story here starts with the politics.

**Q10. Mentorship:**
- A. Someone senior is invested in your growth. They actually check in.
- B. A few people you can ping. Informal but real.
- C. The senior who said "reach out anytime" has never replied.
- D. Nobody here is worth learning from. ChatGPT is your mentor.

**Q11. When you think "HR" at your company:**
- A. Genuinely on your side. They've fought for you behind the scenes.
- B. Diwali emails. Engagement surveys. Background noise.
- C. "Open door policy." Nobody home when you knock.
- D. They take leadership's side. Every time.

---

### Module 4 · THE GROWTH

**Q12. Promotion conversation:**
- A. Clear criteria, clear timeline. You know what to hit.
- B. Discussed broadly. No dates yet, but it's on the radar.
- C. "You need more impact." Ask what impact means. Silence.
- D. The cycle closed without you. You found out from someone else's promo announcement.

**Q13. Voice in meetings:**
- A. People wait for your take. They act on it.
- B. Heard. Sometimes acted on. Mostly polite.
- C. Polite nods. Then ignored. You've started noticing the pattern.
- D. Anything you say gets shot down. So you stopped speaking up.

**Q14. Work-life balance:**
- A. Real. You log off and have a life.
- B. A few late evenings each week to finish things. Weekends stay yours.
- C. Work bleeds into evenings often. Weekends sometimes too.
- D. Laptop on every trip. On-call through weddings and weekend getaways.

---

### Module 5 · THE MONEY

**Q15. Last hike at appraisal:**
- A. Solid double-digit hike. Above inflation. Made you feel valued.
- B. Standard hike. Around market rate. Nothing to complain about.
- C. Below inflation. You did the math — you're earning less in real terms.
- D. Zero hike. "It's been a tough year for the company."

**Q16. Compared to peers at your level, your pay is:**
- A. Higher. You quietly know it.
- B. About the same. The system feels fair enough.
- C. Lower. Same work, same title. The gap stings.
- D. No clue. Nobody here talks pay. You've stopped guessing.

---

### Module 6 · THE STATE OF YOU

**Q17. Sunday evening, your body:**
- A. Looking forward. Tomorrow has something you actually want to do.
- B. It's Monday. So what.
- C. Mood drops around 7 PM. The week starts arriving.
- D. Can't sleep. Tomorrow's meetings already running in your head.

**Q18. Outside of your job:**
- A. There's a full "you" — friends, hobbies, plans of your own.
- B. Less than there used to be. But the "you" is still there.
- C. Even when you're enjoying something, thoughts of work pop in. The mood crashes.
- D. Mentally, you're still at the office. Always.

---

## 5. Setup & salary screens (outside the 20)

### Setup screen (before quiz)
- **City** — dropdown, 5 cities (Bangalore, Mumbai, Chennai, Hyderabad, Gurgaon) + Other
- **Role** — dropdown, 20 IT roles + Other
- **Total years of experience** — number input
- Auto-generated patient ID shown to user (e.g. `usr_xk29q`) — privacy made visible
- **Drives:** background pre-computation of benchmarks while user takes quiz

### Salary screen (after Q20, before result)
- Two numeric inputs: **Fixed (CTC)** + **Variable + bonus + ESOPs** in Lakhs INR
- Anonymity reassurance in Dr. K's voice
- Total auto-calculated below
- Mandatory (no skip option)
- CTA goal-anchored: *"See my verdict →"*

---

## 6. Scoring logic

### Dimensions

Aggressively minimal — **6 scored dimensions** (one per module) + **3 accumulators** (cross-module pattern detectors).

**Scored dimensions:**

| Dimension | Module | Captures (folded sub-dimensions) |
|---|---|---|
| `work` | The Work | engagement · meaning · autonomy |
| `manager` | The Manager | manager · trust · respect-from-manager |
| `people` | The People | belonging · mentorship · politics · HR · isolation |
| `growth` | The Growth | learning · recognition · voice · stagnation |
| `money` | The Money | comp · benefits + salary-vs-market offset |
| `wellbeing` | The State of You | burnout · exhaustion · anxiety · dread · boundaries · motivation |

**Accumulators** (NOT in module scores — used to enrich diagnosis):

| Accumulator | Catches |
|---|---|
| `intent_to_quit` | "I'm already gone in my head" pattern — count of most extreme leave-leaning answers |
| `cynicism` | "this place is theatre / I have a mental spreadsheet" pattern (absorbs resentment) |
| `agency` | "I'm doing something" vs "I'm a passive victim" (absorbs confidence) |

### Each answer scores into one or more dimensions

```ts
{
  id: 'q3_impact_audience',
  module: 'work',
  choices: [
    { label: 'Customers',            scores: { work: 5 } },
    { label: 'Leadership / the org', scores: { work: 4 } },
    { label: 'Just my manager',      scores: { work: 2 } },
    { label: 'Honestly, nobody',     scores: { work: 0, cynicism: 3 } }
  ]
}
```

### Per-module score (0-100)

```
module_score = round( (sum of this module's dimension hits across its 3 questions)
                      / (max possible for this module) × 100 )
```

### Master score (0-100)

```
master = 0.11 × work
       + 0.18 × manager
       + 0.10 × people
       + 0.18 × growth
       + 0.25 × money
       + 0.18 × wellbeing
```

### Salary's effect on score
Salary is one input to the Money module:
- **Bottom quartile** for role × city × YoE → adds a *negative offset* of up to **15 points** to the Money module score (shifts toward leave)
- **Top quartile** → applies **no offset** (people don't stay just because they're paid well; asymmetric by design)
- Cap: after applying salary offset, the master score moves by at most one tier band purely from this input

### Real daily take-home (used in Money section, not in scoring)
```
real_daily_take_home_inr = (fixed_lakhs + variable_lakhs) × 100000 / 250
```
250 working days per year (approx 50 weeks × 5 days). We use *days*, not hours, because (a) the per-day comparison is more intuitive and (b) the absolute-rupee gap reads more viscerally than a per-hour gap.

### Uber driver daily take-home (the comparison anchor)
A single reasonable round number per city, sourced from **informal sources** (driver forum posts, YouTube driver interviews, journalism case studies). Precision doesn't matter — what matters is the gap framing.

Starting numbers (refine post-launch if a driver disputes them in our comments):
- Bangalore: ₹600/day
- Mumbai: ₹700/day
- Gurgaon: ₹650/day
- Chennai: ₹500/day
- Hyderabad: ₹550/day

Per-hour variant (if we display hourly): divide daily by ~6 effective revenue hours per shift.

### The punch
```
delta = real_daily_take_home_inr − uber_driver_daily_inr
```
Display: *"You earn ₹{delta} more per day than an Uber driver. ☠️"*

When the user is **below** an Uber driver's earnings (junior fresher in expensive city): *"You earn ₹{|delta|} LESS per day than an Uber driver. ☠️☠️"*

Single comparison point (cab/Uber driver only). Dropped auto + delivery from the result page — one stat lands harder than three.

---

## 7. Verdict tiers (5)

| Score | Tier | Emoji |
|---|---|---|
| 75-100 | STAY & THRIVE | ✅ |
| 55-74 | STAY & FIX | 🤔 |
| 40-54 | IT'S COMPLICATED | 🤷 |
| 20-39 | START LOOKING | 🚪 |
| 0-19 | LEAVE NOW | 🔥 |

**No override tiers.** All nuance (runway, intent-to-quit, overpaid trap) lives in the LLM diagnosis paragraph, not in the tier label. Single helpline footer on every result.

---

## 8. Result page (taker view) — order top to bottom

1. **Verdict block** — full-width hero, tier + score + tagline
2. **Money section** — your salary · market for your bucket · your real daily take-home · Uber driver daily · "you earn ₹X more (or less) per day than an Uber driver" callout
3. **Your diagnosis** — LLM-generated 2-paragraph diagnosis, direct second-person, unsigned
4. **This week, try** — 3 specific actions
5. **Share buttons** — WhatsApp / Save image / Copy link
6. **Helpline footer** — always shown, single line

---

## 9. Visitor view of result

Same URL as taker. On page load, the client fetches the session by short-ID, then compares the session's `user_uuid` to the localStorage UUID on the current device. Match → render taker view. No match (or no localStorage UUID) → render visitor view. Server returns the same payload in both cases; the gating happens in the browser. This is privacy-by-default: if you share your URL on a different device, even you become a visitor (and won't see your own salary leak on that screen).

**Visitor sees:**
- Score + verdict tier + tagline
- Weakest module name (no number)
- Big "Take your own" CTA

**Visitor never sees:** salary, hourly rate, market comparison, individual answers, module scores, full diagnosis paragraph, helpline footer (visitor isn't in distress about their job — friend is).

---

## 10. Privacy model

### Never collected
- Name · email · phone · company name · company domain · LinkedIn · any identifier that could deanonymise

### Collected (anonymously)
- City · role · total YoE · salary (fixed + variable) · weekly hours band · 20 answers · `user_uuid` (localStorage-generated)
- Server-generated session short-ID (6-char base62)

### Confidentiality copy is in-character
Dr. K's voice carries the privacy promise. *"I don't know your name. I won't be told even if I asked."* — not legal boilerplate.

---

## 11. Share card

**Format:** 1080×1080 PNG generated server-side via `@vercel/og`.

**Contains:**
- Verdict tier (large)
- Score (large)
- Tagline
- Weakest module name
- URL (e.g. `shouldiquit.app/r/xk29q`)

**Never contains:** salary, hourly rate, market comparison, individual answers, demographics, diagnosis paragraph.

**Pre-filled share text:**
> *Just got diagnosed: LEAVE NOW 🔥 (28/100). The Manager problem.*
> *Take yours (5 min, anonymous): shouldiquit.app*

**Share priority:**
1. Web Share API (native share sheet → WhatsApp, Telegram, Signal, Messages on iOS/Android)
2. Save image to camera roll (Instagram Story)
3. Copy link

**LinkedIn dropped** — boss risk.

---

## 12. Helpline footer

Always-shown, single line at bottom of every result:

> *If you're struggling with more than work: iCall 9152987821 · Vandrevala 1860-2662-345*

Not conditional. Not tone-matched. Always there.

---

## 13. LLM diagnosis system

- **Model:** Claude (Sonnet 4.6 or Opus 4.7), live API call on result page
- **Output:** ~120-word paragraph + 3 numbered specific actions
- **Voice:** direct second-person ("you…"). No narrator, no signature. Sharp, opinionated, Indian English, conversational. Never corporate ("leverage", "synergy", "journey", "actionable").
- **Latency budget:** ~2-3 seconds (show loading shimmer on diagnosis section)
- **Inputs to prompt:** demographics + salary + all 20 answers + module scores + master score + tier + market salary comparison + weakest module
- **Voice anchoring:** 3-4 few-shot examples in system prompt — written in the direct second-person style. User to draft these once questions are written.
- **Fallback if API fails:** templated paragraph keyed off weakest module + tier (~30 templates total: 6 modules × 5 tiers)

---

## 14. Visual direction

**Aesthetic:** Riso zine (v2 restrained). Cream paper, dark blue ink, pink-red accent.

**Palette:**
- Paper: `#f4ecd6`
- Ink: `#0e3870`
- Accent: `#e8576b`
- Background dot texture: `rgba(14,56,112,0.04)` 3×3px

**Typography:**
- Display: **Rubik Mono One** — used sparingly, only for: verdict tier, score numbers, product wordmark
- Body: **Rubik** 400/500 — everything else
- Italic Rubik for direct-address callouts and pull quotes

**Restraint rules (lessons from v1):**
- Pink-red appears max 3 times per screen — kickers, accent strokes, sig dashes. NOT as block fills.
- Solid headlines only — no mix-blend-mode ghost duplicates by default
- Borders thin (1-1.5px), only on inputs and key cards
- Box shadows only on primary CTA
- Verdict block on result page is the **single** big pink-red moment per session

**Mobile-first:**
- Max content width: 440px
- Full-width tap targets, single-question screens
- Sticky-bottom CTAs
- Single-column vertical scroll on result

Mockups at `mockups/journey/` (9 screens, riso v2).

---

## 15. Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand or React Context (quiz state is small) |
| Hosting | Vercel |
| Database | Supabase (Postgres) |
| Share card image | `@vercel/og` |
| LLM | Claude API (Anthropic SDK) |
| Analytics | Plausible (privacy-friendly, no cookies) |

**No auth.** No login. No email capture. Identity = anonymous UUID in localStorage.

---

## 16. Data model

```sql
-- sessions: one row per quiz completion
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                    -- 6-char base62 URL slug
  user_uuid UUID NOT NULL,                -- matches localStorage
  city TEXT NOT NULL,
  role TEXT NOT NULL,
  yoe INT NOT NULL,
  salary_fixed_lakhs NUMERIC(6,2),
  salary_variable_lakhs NUMERIC(6,2),
  hours_per_week_band TEXT,               -- '35-40', '41-50', '51-60', '60+'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- computed scores
  master_score INT,
  module_work INT,
  module_manager INT,
  module_people INT,
  module_growth INT,
  module_money INT,
  module_state INT,
  verdict_tier TEXT,                      -- 'LEAVE_NOW' | 'START_LOOKING' | ...
  weakest_module TEXT,

  -- LLM output cached
  diagnosis_paragraph TEXT,
  diagnosis_actions JSONB                 -- array of 3 strings
);

-- answers: one row per question per session
CREATE TABLE answers (
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,              -- 'q1', 'q2', ...
  choice_index INT NOT NULL,              -- 0-3
  PRIMARY KEY (session_id, question_id)
);

CREATE INDEX idx_sessions_user_uuid ON sessions(user_uuid);
CREATE INDEX idx_sessions_bucket ON sessions(role, city, yoe);
```

**RLS policies:**
- `INSERT` allowed from any anonymous client
- `SELECT` allowed on any row by short-ID lookup (visitor view computed in app, not DB)
- `UPDATE` disallowed
- `DELETE` disallowed (TTL via cron job in Phase 2 if needed)

---

## 17. Benchmark data

Shipped as `/lib/benchmarks.json`, compiled from 8 source files in `/data`:

| File | Cells | Status |
|---|---|---|
| `salaries-bangalore.json` | 80 (20 roles × 4 YoE × 4 percentiles) | ✓ done |
| `salaries-chennai.json` | 80 | ✓ done |
| `salaries-hyderabad.json` | 80 | ✓ done |
| `salaries-gurgaon.json` | 80 | ✓ done |
| `salaries-mumbai.json` | 80 | ✓ done |
| `city-context.json` | 5 cities (gig pay, COL, hiring trends) | ✓ done |
| `market-temperature.json` | 100 (20 roles × 5 cities) | ✓ done |
| `role-profiles.json` | 20 roles (career path, quit reasons, tenure) | ✓ done |

**Confidence flags on every cell** (high / medium / low). Honest about which numbers are direct vs derived.

**Refresh cadence:** quarterly. Hand-curated for v1, automated (Naukri scrape) in Phase 2.

**Data quality acknowledgment:** Indian public salary data is noisy. AmbitionBox is self-reported (overstates). Levels.fyi is narrow (top-tier companies). v1 dataset is directionally right, not bank-grade. Acceptable for a quiz; not acceptable for a salary report.

---

## 18. Phase 1 vs Phase 2

### Phase 1 (launch)
- All 9 screens
- 20 questions + scoring + 5 verdict tiers
- Live LLM diagnosis with templated fallback
- Share card via `@vercel/og`
- Anonymous response storage in Supabase
- Hand-curated `benchmarks.json`
- Riso zine v2 visual direction
- Mobile-first, no desktop-specific work

### Phase 2 (post-launch)
- Internal percentile data (once N > 100 per role×city×YoE bucket — replaces benchmarks for those buckets)
- WhatsApp 90-day re-check nudge (opt-in)
- Compare-with-friends group mechanic
- Sector segmentation (fintech vs SaaS vs IT-services)
- Naukri/LinkedIn scrape for live market temperature
- Quarterly automated benchmark refresh

---

## 19. Out of scope

Explicitly **not** doing in v1:
- Authentication, accounts, login
- Email capture (even optional)
- Payment / monetization (free product)
- Multi-language (English-only, India)
- Desktop-optimized layouts (mobile-first; desktop works but isn't tuned)
- Sector-level salary segmentation
- Job board integration / affiliate links
- LinkedIn share (boss risk)
- "Predict your manager's score" feature
- Archetype labels (cut — no diagnostic value)

---

## 20. Open items blocking implementation

1. **The 20 questions written in product's direct voice** — second-person, sharp, no narrator. User to provide 2-3 sample lines to lock the voice register, then I draft the rest.
2. **3-4 sample diagnosis paragraphs** — written in target voice, used as few-shot examples in the LLM prompt.
3. **Q20 module assignment** — which module gets the second flex question (likely Money since it's highest-weighted).
4. **Domain registration** — `shouldiquit.app` or alternative.
5. ~~Compile `benchmarks.json`~~ — done (`data/benchmarks.json`).

---

## 21. Source mockups

- All 32 question-screen aesthetic explorations: `mockups/index.html`
- Locked riso-v2 journey (9 screens): `mockups/journey/index.html`
- Live server (during development): `http://192.168.1.6:5174/journey/`

---

## 22. References

- Original spec: provided by user at start of session (extensive PRD)
- Data agents' outputs: 8 files in `/data/`
- Brainstorming session: this conversation
- Mockup iteration history: `mockups/` (32 directions explored, riso-v2 locked)

---

*End of design spec.*
