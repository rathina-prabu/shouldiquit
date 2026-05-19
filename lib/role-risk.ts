import roleRiskJson from "../data/role-risk.json"
import type { Role } from "./types"
import { yoeToBand } from "./benchmarks"

interface RoleRiskFile {
  ai_replaceability: Record<string, Record<string, number>>
  layoff_impact: Record<string, number>
  upskill_path: Record<string, string>
}

const data = roleRiskJson as unknown as RoleRiskFile

/**
 * AI replaceability for a role + YoE, 0-100. Higher = more exposed.
 * Returns null if role unknown.
 */
export function aiRiskFor(role: Role, yoe: number): number | null {
  const band = yoeToBand(yoe)
  return data.ai_replaceability[role]?.[band] ?? null
}

/**
 * Current layoff impact for a role, 0-100. Higher = harder hit.
 */
export function layoffImpactFor(role: Role): number | null {
  return data.layoff_impact[role] ?? null
}

/**
 * Map the user's Q19 choice index to a perceived AI-risk band (0-100).
 *  0 → "Low"               → 15
 *  1 → "Medium"            → 50
 *  2 → "High"              → 75
 *  3 → "Already happening" → 95
 */
export function perceivedAiRiskFromChoice(choiceIndex: number | null | undefined): number | null {
  if (choiceIndex == null) return null
  const map = [15, 50, 75, 95]
  return map[choiceIndex] ?? null
}

/**
 * Map the user's Q20 choice (AI usage at work) to a 0-100 adaptation score.
 *  0 → "Most of my core work"           → 90  (heavy adopter)
 *  1 → "Some of my core work"           → 60  (moderate adopter)
 *  2 → "Just side work — emails, etc."  → 25  (minimal)
 *  3 → "AI isn't allowed in my org"     → 0   (no adaptation possible; org is behind)
 */
export function aiUsageFromChoice(choiceIndex: number | null | undefined): number | null {
  if (choiceIndex == null) return null
  const map = [90, 60, 25, 0]
  return map[choiceIndex] ?? null
}

/**
 * Special detector: did the user explicitly say AI is forbidden in their org?
 * This carries different semantics than 'I just don't use it personally' — it
 * means the user has no path to adapt while staying.
 */
export function isAiBlockedByOrg(choiceIndex: number | null | undefined): boolean {
  return choiceIndex === 3
}

/**
 * Direct master-score adjustment based on the user's AI adoption (Q20).
 * Symmetric in spirit with the salary offset — rewards heavy adopters,
 * penalises org-level bans. Combined with the Q20 quiz score (growth module),
 * total AI signal range: ~+10 (heavy adopter) to ~-15 (org-banned).
 *
 *   A. Most of my core work       → +8  (you're future-proofed)
 *   B. Some of my core work       → +4  (decent adoption)
 *   C. Just side work / emails    →  0  (neutral)
 *   D. AI isn't allowed in org    → -12 (structural quit-driver)
 *
 * Why heavier negative: org banning AI is structural (can't be fixed from
 * inside); heavy personal adoption is individual (good but expected baseline
 * in 2026).
 */
export function aiSignalMasterAdjust(q20ChoiceIndex: number | null | undefined): number {
  if (q20ChoiceIndex == null) return 0
  const map = [8, 4, 0, -12]
  return map[q20ChoiceIndex] ?? 0
}

/** @deprecated Use aiSignalMasterAdjust. Kept temporarily for older callers. */
export function orgAiBlockPenalty(q20ChoiceIndex: number | null | undefined): number {
  return isAiBlockedByOrg(q20ChoiceIndex) ? -12 : 0
}

/**
 * Personal AI exposure: how exposed *this individual* is to AI replacement,
 * accounting for how much they've adapted. Heavy AI users in at-risk roles
 * effectively have lower personal exposure than non-users in the same role.
 *
 *   personalRisk = roleAiRisk × (1 - aiUsage / 200)
 *
 * Examples (roleRisk = 85):
 *   aiUsage 90 (heavy) → multiplier 0.55 → raw 47, floored to 55 (see below)
 *   aiUsage 60         → multiplier 0.70 → personal 60
 *   aiUsage 25         → multiplier 0.875 → personal 74
 *   aiUsage 0  (none)  → multiplier 1.00 → personal 85
 *
 * Floor for very-high-risk roles: when roleRisk >= 80 (VERY HIGH band — junior
 * QA, junior Customer Success), personalRisk is floored at 55. Adopting AI
 * inside a role that's being *entirely* automated isn't enough on its own —
 * the user still deserves the "plan your pivot" nudge.
 *
 * When aiUsage is null (old session, pre-Q20), default to 25 (minimal use)
 * — a conservative guess that's neither best nor worst case.
 */
export function personalAiRisk(roleRisk: number, aiUsage: number | null): number {
  const usage = aiUsage ?? 25
  const raw = Math.round(roleRisk * (1 - usage / 200))
  // Floor: roles with extreme aiRisk (>=80) keep personalRisk at >= 55 so
  // they always trigger the at-risk branch in the matrix.
  if (roleRisk >= 80) return Math.max(raw, 55)
  return raw
}

export type PerceptionGap = "aligned" | "underestimating" | "overestimating"

export interface PerceptionReading {
  userPerception: number   // 0-100 from Q19
  actualAiRisk: number     // 0-100 from data
  layoffImpact: number     // 0-100 from data
  gap: PerceptionGap
  delta: number            // userPerception - actualAiRisk; negative = blind to risk
}

export function readPerception(
  role: Role,
  yoe: number,
  q19ChoiceIndex: number | null | undefined,
): PerceptionReading | null {
  const userPerception = perceivedAiRiskFromChoice(q19ChoiceIndex)
  const actualAiRisk = aiRiskFor(role, yoe)
  const layoffImpact = layoffImpactFor(role)
  if (userPerception == null || actualAiRisk == null || layoffImpact == null) return null
  const delta = userPerception - actualAiRisk
  let gap: PerceptionGap
  if (delta < -20) gap = "underestimating"
  else if (delta > 20) gap = "overestimating"
  else gap = "aligned"
  return { userPerception, actualAiRisk, layoffImpact, gap, delta }
}

/**
 * Map a numeric risk (0-100) to a coarse label and dot count for UI.
 */
export function riskBand(score: number): { label: "LOW" | "MEDIUM-LOW" | "MEDIUM" | "HIGH" | "VERY HIGH"; dots: number } {
  if (score <= 30) return { label: "LOW", dots: 1 }
  if (score <= 50) return { label: "MEDIUM-LOW", dots: 2 }
  if (score <= 65) return { label: "MEDIUM", dots: 3 }
  if (score <= 80) return { label: "HIGH", dots: 4 }
  return { label: "VERY HIGH", dots: 5 }
}

/**
 * Per-role upskill path. Returned for any role; the result page chooses
 * whether to surface it based on AI exposure.
 */
export function upskillPathFor(role: Role): string | null {
  return data.upskill_path[role] ?? null
}

import type { VerdictTier } from "./types"

/**
 * Action recommendation derived from (master score, AI risk, AI usage).
 * Independent of the verdict TIER number — the tier says "how good is your
 * job?", this says "what should you actually do about it given where AI
 * is going?".
 */
export type ActionRecommendation =
  | "STAY"
  | "STAY_UPSKILL"          // good-score variant (≥65): you have runway, use it
  | "STAY_UPSKILL_URGENT"   // middle-score variant (25-64): bad combo, wake-up call
  | "STAY_PIVOT"
  | "LEAVE_UPSKILL_FIRST"
  | "LEAVE_PIVOT"
  | "LEAVE"

export interface ActionAdvice {
  action: ActionRecommendation
  label: string         // short headline for the verdict block
  body: string          // 1-2 sentence explanation
}

/**
 * Short human-readable phrase per module, used when narrating which areas
 * are broken in the STAY-bucket body. Tuned for article handling — "the
 * money is" vs "growth is" reads naturally.
 */
const MODULE_PHRASES: Record<string, string> = {
  money: "money",
  manager: "manager",
  wellbeing: "state of you",
  growth: "growth",
  people: "people side",
  work: "work itself",
}

/**
 * List all modules below the narrate-aloud threshold (35), sorted weakest
 * first. Returns the natural-language phrase or null if nothing qualifies.
 */
function brokenModulesPhrase(
  modules: Record<string, number> | null | undefined,
): string | null {
  if (!modules) return null
  const broken = Object.entries(modules)
    .filter(([m, score]) => MODULE_PHRASES[m] && score < 35)
    .sort((a, b) => a[1] - b[1])
    .map(([m]) => MODULE_PHRASES[m])
  if (broken.length === 0) return null
  if (broken.length === 1) {
    return `The ${broken[0]} is the bit that's broken`
  }
  if (broken.length === 2) {
    return `The ${broken[0]} and the ${broken[1]} are the bits that are broken`
  }
  // 3+: Oxford comma, prefix every item with "the" for readability
  const articled = broken.map((p) => `the ${p}`)
  const last = articled[articled.length - 1]
  const rest = articled.slice(0, -1).join(", ")
  // Capitalise the first "the"
  const sentence = `${rest.charAt(0).toUpperCase() + rest.slice(1)}, and ${last} are all broken`
  return sentence
}

/**
 * The matrix. Driven by:
 *  - masterScore: how good is your current job (0-100)
 *  - aiRisk:      how exposed is your role to AI (0-100, from data)
 *  - aiUsage:     how well are YOU adapting (0-100, from Q20)
 *  - aiBlocked:   does the org explicitly forbid AI (Q20 = D)
 *
 * personalRisk replaces raw roleRisk in the matrix — heavy AI users earn
 * their personal exposure down. atRisk threshold: personalRisk >= 50.
 *
 * When aiBlocked, the matrix takes a special branch: user can't reduce risk
 * personally because the org won't let them. Recommendation always tilts
 * toward exiting the org.
 */
export function recommendAction(
  masterScore: number,
  aiRisk: number,
  aiUsage: number | null,
  aiBlocked = false,
  /**
   * Optional adjusted module scores. When provided, the STAY-bucket body
   * narrates which modules are below 35 ("the manager and the growth are
   * broken"). Without it, the body falls back to generic wording.
   */
  modules?: Record<string, number> | null,
): ActionAdvice {
  // ── Special branch: org forbids AI. Override the matrix entirely. ──
  // Four sub-buckets so the framing matches the actual job-quality tier.
  if (aiBlocked) {
    if (masterScore < 25) {
      return {
        action: "LEAVE_PIVOT",
        label: "Leave — your org is the bottleneck",
        body: "Your org forbids AI in a role being automated industry-wide. The job is bad on top of that. This is structural — you can't fix it from the inside. Move to a company that lets you learn the tools that are eating your role. Even a lateral move beats staying.",
      }
    }
    if (masterScore < 45) {
      // 25-44 = START_LOOKING — the job isn't great either.
      return {
        action: "LEAVE_PIVOT",
        label: "Plan your exit — the org is falling behind",
        body: "Your org's AI ban means you're not keeping up with the market — and the job isn't great either. Two reasons stacking. Start interviewing seriously this week. Aim for a company that lets you learn AI in core work; you'll fall further behind every month you stay here.",
      }
    }
    if (masterScore < 65) {
      // 45-64 = ITS_COMPLICATED — middling job.
      return {
        action: "LEAVE_PIVOT",
        label: "Plan your exit — the org is falling behind",
        body: "Your org's AI ban means you're not keeping up with the market — even though the job itself is mediocre. Start interviewing seriously. Aim for a company that lets you learn AI in core work. You'll fall further behind every month you stay.",
      }
    }
    // Good job (>=65) but org blocks AI. Stay short-term, plan exit.
    return {
      action: "STAY_PIVOT",
      label: "Stay short, but plan your exit",
      body: "Your job is good today. Your org's AI ban means you're falling behind the market in skills. The job is fine, but the trajectory isn't. Use the next 6-12 months to negotiate AI access, learn on the side, and start interviewing at companies that don't forbid the tools you need.",
    }
  }

  const personalRisk = personalAiRisk(aiRisk, aiUsage)
  const roleAtRisk = personalRisk >= 50
  // If aiUsage is unknown (no Q20 answer — only happens for pre-Q20 sessions),
  // assume minimal use → user is treated as not yet adapting.
  const adapting = (aiUsage ?? 0) >= 50
  const heavilyAdapting = (aiUsage ?? 0) >= 80

  // Buckets aligned with verdict tiers (2026-05-19):
  //   <25     LEAVE_NOW           → leave bucket
  //   25-64   START_LOOKING / ITS_COMPLICATED → middle bucket
  //   65+     STAY_FIX / STAY_THRIVE → stay bucket

  // Bucket 1: bad job (score < 25 = LEAVE_NOW tier). Default = leave.
  if (masterScore < 25) {
    if (roleAtRisk) {
      if (heavilyAdapting) {
        return {
          action: "LEAVE_PIVOT",
          label: "Leave & pivot",
          body:
            "The job is bad AND your role is being automated. Good news: you're already adapting. Don't take the same title at the next company — use your AI fluency to move into a less-exposed role.",
        }
      }
      if (adapting) {
        return {
          action: "LEAVE_PIVOT",
          label: "Leave & pivot",
          body:
            "Bad job + role being thinned. You've started using AI — keep going, and aim your next move at a role one step ahead of the automation.",
        }
      }
      return {
        action: "LEAVE_UPSKILL_FIRST",
        label: "Don't leave yet — upskill first",
        body:
          "Your job is bad and your role is being automated, but you're not yet using AI in your work. Jumping ship now means landing in the same place. Spend the next 60-90 days learning the AI tools that are eating your role — then move.",
      }
    }
    return {
      action: "LEAVE",
      label: "Leave",
      body:
        "Your role is still in demand in the market. The job is the problem, not your career path. Open LinkedIn.",
    }
  }

  // Bucket 2: middle ground (25-64 = START_LOOKING + ITS_COMPLICATED). Stay, but with intent.
  if (masterScore < 65) {
    if (roleAtRisk) {
      if (adapting) {
        return {
          action: "STAY_PIVOT",
          label: "Stay & pivot internally",
          body:
            "The job is meh and your role is changing fast. You're already adapting — use the safety of this job to engineer an internal move into a less-exposed role. Internal moves are easier than external.",
        }
      }
      // Splice broken-modules narration if any modules are below 35 — the
      // user deserves to hear *both* "AI is coming for your role" AND "your
      // job has these specific broken parts".
      const brokenUrgent = brokenModulesPhrase(modules)
      const jobFraming = brokenUrgent
        ? `The job is mediocre — ${brokenUrgent.toLowerCase()}.`
        : "The job is mediocre."
      return {
        action: "STAY_UPSKILL_URGENT",
        label: "Stay & upskill — urgently",
        body:
          `${jobFraming} Worse: your role is being thinned by AI and you haven't started using AI yet. Use this paycheck as runway: pick two tools from below and put them in your daily workflow this week. 90 days, then re-take this quiz.`,
      }
    }
    // STAY-bucket body narrates which modules are below 35 if any.
    const broken = brokenModulesPhrase(modules)
    if (broken) {
      const isMany = (broken.match(/and/g) || []).length >= 2
      const closer = isMany
        ? "— that's a lot. Fix them in order before considering leaving."
        : "— fix " + (broken.includes(" and ") ? "those" : "that") + " before considering leaving."
      return {
        action: "STAY",
        label: "Stay & address the issues",
        body: `The role itself is fine. ${broken} ${closer}`,
      }
    }
    return {
      action: "STAY",
      label: "Stay & address the issues",
      body:
        "The role itself is fine. The job has some fixable issues. Have the harder conversations before considering leaving.",
    }
  }

  // Bucket 3: good job (55+). Stay is default. Modify if role is at risk.
  if (roleAtRisk) {
    if (heavilyAdapting) {
      return {
        action: "STAY_PIVOT",
        label: "Stay & lead the change",
        body:
          "You've got a good job AND you're already using AI heavily. You're in the best possible position to pivot internally toward what's coming. Be the person who shapes how AI gets adopted — don't wait.",
      }
    }
    if (adapting) {
      return {
        action: "STAY_PIVOT",
        label: "Stay & pivot",
        body:
          "Good job, role is changing, you've started using AI. Use this comfortable seat to pivot to a role one step ahead of the automation — internally if you can.",
      }
    }
    return {
      action: "STAY_UPSKILL",
      label: "Stay & upskill",
      body:
        "You have a good job. Don't waste it. Your role is being thinned by AI but you have the most precious thing: time. Spend an hour a day learning the tools below. The runway is real — use it before the market forces you to.",
    }
  }
  return {
    action: "STAY",
    label: "Stay",
    body:
      "Good job, safe role. Keep doing what you're doing — but stay curious about where the work is heading.",
  }
}
