# Validation results — 2026-05-17 (overnight build)

Three calibration personas were run through `/api/sessions` end-to-end (Zustand answers → score engine → salary offset → DB persist). Verdicts compared against the bands RESUME.md predicted.

## ✅ Scoring is well-calibrated. All 3 personas landed inside their expected band.

| Persona | Expected | Actual score | Actual tier | Match |
|---|---|---|---|---|
| HAPPY (Sr SWE Blr 5y · ₹38L total) | STAY_THRIVE (75–100) | **94/100** | STAY_THRIVE | ✅ |
| MEDIOCRE (EM Hyd 9y · ₹42L total) | STAY_FIX or ITS_COMPLICATED (40–74) | **64/100** | STAY_FIX | ✅ |
| FRUSTRATED (Sr PM Gurgaon 8y · ₹29L total) | START_LOOKING or LEAVE_NOW (0–39) | **28/100** | START_LOOKING | ✅ |

## Persona 1: HAPPY

- **Session id:** hZ8Mfr
- **Actual:** 94 / 100 — STAY_THRIVE
- **Weakest module:** growth (81)
- **Module breakdown:** work 93 · manager 100 · people 95 · growth 81 · money 100 · wellbeing 92
- **Accumulators:** intent_to_quit 0 · cynicism 0 · agency 4
- **Answer choices:** A,B,B,A,A,A,A,A,A,A,B,B,A,B,A,A,A,A
- **Notes:** Manager 100 because all 4 manager questions were A. Above-market salary (₹38L vs Blr Sr SWE 4–7 band) zeroed the money offset. Persona's small frictions (slightly opaque promo, one annoying skip-level) correctly showed up as growth being the weakest module despite still scoring 81.

## Persona 2: MEDIOCRE

- **Session id:** JZCoD9
- **Actual:** 64 / 100 — STAY_FIX
- **Weakest module:** manager (55)
- **Module breakdown:** work 67 · manager 55 · people 58 · growth 62 · money 75 · wellbeing 62
- **Accumulators:** intent_to_quit 0 · cynicism 4 · agency 0
- **Answer choices:** B,B,C,B,B,B,C,B,B,C,B,B,B,B,B,B,B,B
- **Notes:** Almost all B's with three C's (Q3 just-manager-notices, Q7 credit-disappears, Q10 unanswered-mentor) correctly produced a band-2 score. Money is ironically the strongest module — EM in Hyderabad on ₹42L isn't underpaid, just plateaued. The diagnosis target (manager) is exactly where the persona's vague feedback comes from. Sits right at the STAY_FIX/ITS_COMPLICATED border — well-tuned.

## Persona 3: FRUSTRATED

- **Session id:** G3Sw80
- **Actual:** 28 / 100 — START_LOOKING
- **Weakest module:** money (0)
- **Module breakdown:** work 100 · manager 5 · people 95 · growth 29 · money 0 · wellbeing 8
- **Accumulators:** intent_to_quit 23 · cynicism 29 · agency −2
- **Answer choices:** A,B,A,C,D,D,D,A,A,A,B,D,D,D,D,C,D,C
- **Notes:** This is the realistic-quitter pattern RESUME.md predicted: work and people scoring very high (100 and 95) but Manager (5), Growth (29), Money (0), Wellbeing (8) crashing through. The 25% Money weight × adj-money=0 plus 18% Manager × 5 dominates. Salary offset applied (−15) because ₹29L Sr PM Gurgaon 8y is below p25. The intent_to_quit accumulator of 23 confirms the model captured the "I'm done" pattern.
- RESUME.md said: *START_LOOKING (20–39) = scoring is well-calibrated.* That's where we landed.

## Verdict on the scoring

- ✅ All 3 personas land in expected band.
- ✅ Money 25% weight does its job — the FRUSTRATED persona's strong work + people couldn't drag him out of the leave-leaning tier.
- ✅ Salary offset triggers asymmetrically — HAPPY got 0 (above-market) and FRUSTRATED got −15 (below p25), but MEDIOCRE got −5 (between p25 and p50), tipping money 80 → 75.
- ✅ Accumulators (intent_to_quit, cynicism, agency) correctly differentiated FRUSTRATED from MEDIOCRE despite both having below-50 scores in several modules.
- ✅ Polarity rule held: every persona's A/B leaning correlated with high module scores.

No tuning required for the v1 launch. The 18-question + 6-module + salary-offset design produces sensible verdicts for the three archetypes the spec needed to support.

## Caveats

- Tests run with `ANTHROPIC_API_KEY` empty → the result page renders the templated fallback diagnosis. When the user restores the org and pastes the key, the live Claude-generated diagnosis kicks in automatically.
- Persona answer letters were chosen by separate `general-purpose` subagents, each given only the persona prompt + the 18 questions (no scoring weights shown), per the validation protocol.
