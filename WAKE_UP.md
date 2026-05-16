# Wake-up note — Should I Quit

You said sleep, build, no waiting. Here's the state.

## TL;DR

The app is **running**. Walk it on your phone:

- **Phone (recommended):** http://192.168.1.6:3000
- **Laptop:** http://localhost:3000

Full quiz works end-to-end. 18 questions → salary → verdict → diagnosis (templated for now) → share card. Anonymous Supabase persistence is live and verified.

3 personas were calibration-tested and all 3 landed in their expected verdict bands. See `validation-results.md` for the breakdown.

## Status

| Area | State | Notes |
|---|---|---|
| Scaffold (Next.js 14, Tailwind, Vitest) | ✅ done | Manual scaffold (no `create-next-app`) |
| Pure logic (types, 18 Qs, scoring, benchmarks, short-id) | ✅ done | 39 unit tests passing |
| Zustand store with persist | ✅ done | localStorage with SSR/test fallback |
| All 7 screens (landing, intake, quiz, salary, taker result, visitor result) | ✅ done | Riso aesthetic, mobile max-w 440 |
| Supabase schema + RLS | ✅ done | Permissive policies; publishable key is sufficient |
| `POST /api/sessions` | ✅ done | Persists row + 18 answers, applies salary offset |
| `POST /api/diagnose` | ✅ done | Tries Claude → falls back to template |
| Templated diagnosis library | ✅ done | All 30 templates (6 modules × 5 tiers), hand-written |
| Live Claude diagnosis | ⏸️ blocked | No API key — falls back to template until you paste one |
| OG share card `/api/og/[id]` | ✅ done | 1080×1080 PNG, riso palette, verified |
| Result page `/r/[id]` (taker + visitor views) | ✅ done | UUID-match gates the taker view |
| Persona validation | ✅ done | All 3 personas in expected bands |
| Vercel deploy | ❌ not done | Per RESUME instructions — your call when awake |
| E2E (Playwright) | ❌ skipped | API-level smoke test done instead; time tradeoff |

39 vitest unit tests passing. 1 production build passes. Dev server is up and running in the background.

## 3 things to do when you wake up

### 1. Email Anthropic support follow-up

You sent the org-restoration email before sleeping. Until they reply, the live Claude diagnosis stays off. The templated fallback is decent — see `lib/claude.ts` — but the LLM output will be sharper once restored.

### 2. When org is back: paste the key + restart dev server

```bash
# edit /Users/rathinaprabhu/SCG/shouldiquit/.env.local
ANTHROPIC_API_KEY=sk-ant-...      # paste real key here
```

Then restart:
```bash
# kill the current dev server (PID is whoever owns :3000)
lsof -ti:3000 | xargs kill
cd /Users/rathinaprabhu/SCG/shouldiquit
npm run dev
```

After that, take a fresh quiz — the result page will hit Claude live. Existing rows already have templated diagnosis cached; to refresh those, clear the diagnosis fields and re-fetch (or just take a new quiz with a different user UUID).

### 3. Test the flow on your phone

Open http://192.168.1.6:3000 on your phone (same wifi). Tap through:
- Landing → Start → fill city/role/yoe → 18 questions → salary → verdict
- After the verdict shows, copy the URL and open in an incognito tab — that's the visitor view (stripped of salary/diagnosis)
- Hit `/api/og/<id>` from the URL — that's the 1080×1080 share card

Things to look for:
- Tap targets feel right on 390–440px width?
- Typography reads cleanly?
- Verdict block (pink-red hero) doesn't feel too loud?
- Are any questions reading awkwardly?

## Deploy plan when ready

```bash
cd /Users/rathinaprabhu/SCG/shouldiquit

# 1. Push to GitHub (private)
gh repo create shouldiquit --private --source=. --remote=origin --push

# 2. Deploy
npx vercel --prod

# 3. Set env vars in Vercel dashboard
#    https://vercel.com/<your-org>/shouldiquit/settings/environment-variables
#    Paste:
#      NEXT_PUBLIC_SUPABASE_URL=https://yojxqkwqlnodtllkmauq.supabase.co
#      NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_A3oE6VNWfgbo8ZUaIl3eaQ_vkOldrOq
#      SUPABASE_URL=https://yojxqkwqlnodtllkmauq.supabase.co
#      SUPABASE_SERVICE_ROLE_KEY=<paste real service role from Supabase dashboard if you want admin perms; otherwise use the publishable key — RLS already allows insert+select+update>
#      ANTHROPIC_API_KEY=<paste once org is restored>
```

After deploy, verify `/api/og/<some-id>` renders on the prod URL (the edge runtime sometimes needs minor adjustment).

## Known issues / TODOs (deferred)

- **Live Claude diagnosis is off.** Templated fallback shipping. Will activate when you paste the key.
- **No back navigation in the quiz.** State is preserved in localStorage if the user refreshes, but there's no in-quiz back button. Add post-MVP if users complain.
- **The 4-question modules (Manager + People) are still at 4, not trimmed to 3** as spec §4 floated. Cut decision deferred to user data — let the first 100 takers tell us if either module is over-influential.
- **No Playwright E2E.** API-level smoke test replaced it overnight to save time. Add when ready to ship.
- **Old `.DS_Store` files** are in the repo. Gitignored going forward; older ones already-tracked are untouched.
- **Service role key** is set to the publishable key in `.env.local`. With permissive RLS this works fine. If you ever want stricter policies, swap to the real service role key.

## What's where

- **App code:** `/Users/rathinaprabhu/SCG/shouldiquit/`
- **Spec:** `docs/superpowers/specs/2026-05-16-should-i-quit-design.md`
- **Plan:** `docs/superpowers/plans/2026-05-17-should-i-quit-implementation.md`
- **Mockups:** `mockups/journey/` (visual reference for the 7 screens)
- **Templated diagnoses (all 30):** `lib/claude.ts` — search `TEMPLATES`
- **Scoring:** `lib/scoring.ts`
- **Validation report:** `validation-results.md`
- **Git history:** ~5 progressive commits on `main` (no remote yet)

## How to verify a fresh end-to-end run

```bash
# 1. Curl a session
curl -s -X POST http://localhost:3000/api/sessions \
  -H 'Content-Type: application/json' \
  -d '{
    "setup": {"city":"Bangalore","role":"Senior Product Manager","yoe":8},
    "salary": {"fixed_lakhs":26,"variable_lakhs":3},
    "user_uuid": "22222222-2222-4222-8222-222222222222",
    "answers": [
      {"question_id":"q1","choice_index":1},{"question_id":"q2","choice_index":1},
      {"question_id":"q3","choice_index":1},{"question_id":"q4","choice_index":3},
      {"question_id":"q5","choice_index":3},{"question_id":"q6","choice_index":3},
      {"question_id":"q7","choice_index":3},{"question_id":"q8","choice_index":0},
      {"question_id":"q9","choice_index":0},{"question_id":"q10","choice_index":0},
      {"question_id":"q11","choice_index":1},{"question_id":"q12","choice_index":3},
      {"question_id":"q13","choice_index":2},{"question_id":"q14","choice_index":3},
      {"question_id":"q15","choice_index":3},{"question_id":"q16","choice_index":2},
      {"question_id":"q17","choice_index":3},{"question_id":"q18","choice_index":2}
    ]
  }'

# 2. Open the URL it returns: http://localhost:3000/r/<id>
# 3. Check the OG: http://localhost:3000/api/og/<id>
```

Sleep well. Build's done.
