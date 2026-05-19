import { QUESTIONS } from "./questions"
import type { Answer, ModuleName, Scores, VerdictTier, WorkType } from "./types"

// Weights tuned to a deliberate quit-driver priority order:
//   1. AI (Q20 + org-block) — external, sits above any module (~-17 max)
//   2. Money (+ salary offset window adds more on top)
//   3. Manager
//   4. Wellbeing (+ work-setup offset)
//   5. Work
//   6. Growth (lower weight because Q20's AI hit lives here separately)
//   7. People (team / colleagues — rarely the primary quit driver)
const MODULE_WEIGHTS: Record<ModuleName, number> = {
  money: 0.21,
  manager: 0.20,
  wellbeing: 0.16,
  work: 0.16,
  growth: 0.14,
  people: 0.13,
}

const MODULES: ModuleName[] = ["work", "manager", "people", "growth", "money", "wellbeing"]

export function computeScores(answers: Answer[]): Scores {
  const dimensionTotals: Record<string, number> = {}

  for (const a of answers) {
    const q = QUESTIONS.find((qq) => qq.id === a.question_id)
    if (!q) continue
    const choice = q.choices[a.choice_index]
    if (!choice) continue
    for (const [dim, pts] of Object.entries(choice.scores)) {
      dimensionTotals[dim] = (dimensionTotals[dim] || 0) + (pts as number)
    }
  }

  // Module maxes: sum over ALL questions of max contribution that question can make to that module
  // (preserves cross-module hits like q10 hitting both people + growth, q14 hitting both growth + wellbeing)
  const moduleMaxes: Record<ModuleName, number> = {
    work: 0, manager: 0, people: 0, growth: 0, money: 0, wellbeing: 0,
  }
  for (const q of QUESTIONS) {
    for (const m of MODULES) {
      const maxForThisQ = Math.max(...q.choices.map((c) => (c.scores[m] as number | undefined) ?? 0))
      moduleMaxes[m] += maxForThisQ
    }
  }

  const modules: Record<ModuleName, number> = {} as Record<ModuleName, number>
  for (const m of MODULES) {
    const earned = dimensionTotals[m] ?? 0
    const max = moduleMaxes[m] || 1
    const pct = Math.round((earned / max) * 100)
    modules[m] = Math.max(0, Math.min(100, pct))
  }

  const master = Math.max(
    0,
    Math.min(
      100,
      Math.round(MODULES.reduce((sum, m) => sum + MODULE_WEIGHTS[m] * modules[m], 0)),
    ),
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
  // Tightened tier boundaries (2026-05-19):
  //   >=80  STAY_THRIVE
  //   65-79 STAY_FIX
  //   45-64 ITS_COMPLICATED
  //   25-44 START_LOOKING
  //   <25   LEAVE_NOW
  if (master >= 80) return "STAY_THRIVE"
  if (master >= 65) return "STAY_FIX"
  if (master >= 45) return "ITS_COMPLICATED"
  if (master >= 25) return "START_LOOKING"
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

/**
 * Work-setup offset, in percentage points on the relevant modules.
 * Shrunk so the wellbeing *questions* still do the heavy lifting — setup
 * nudges by ~±1.5 master points instead of dominating.
 */
export function computeWorkTypeOffset(
  workType: WorkType | null | undefined,
): { wellbeing: number; work: number } {
  switch (workType) {
    case "remote":
      return { wellbeing: 8, work: 3 }
    case "hybrid_flex":
      return { wellbeing: 5, work: 0 }
    case "hybrid_fixed":
      return { wellbeing: 0, work: 0 }
    case "office":
      return { wellbeing: -8, work: 0 }
    default:
      return { wellbeing: 0, work: 0 }
  }
}

export function recomputeMasterWithOffsets(
  modules: Record<ModuleName, number>,
  moneyOffset: number,
  workTypeOffset: { wellbeing: number; work: number },
  /**
   * Direct master-score adjustment from Q20 AI signal (range -12 to +8).
   * Positive when user heavily adopts AI; negative when org bans it.
   * See aiSignalMasterAdjust() in lib/role-risk.ts.
   */
  aiAdjust = 0,
): {
  adjMoney: number
  adjWellbeing: number
  adjWork: number
  adjMaster: number
} {
  // When the salary number says "underpaid", the money quiz answers (hike,
  // peer pay) often confirm the same signal. Adding both penalties would
  // double-count. Soften the quiz contribution by giving the module a small
  // rebate before applying the salary offset.
  const quizRebate = moneyOffset < 0 ? 10 : 0
  const adjMoney = Math.max(0, Math.min(100, modules.money + quizRebate + moneyOffset))
  const adjWellbeing = Math.max(0, Math.min(100, modules.wellbeing + workTypeOffset.wellbeing))
  const adjWork = Math.max(0, Math.min(100, modules.work + workTypeOffset.work))
  const adjMaster = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        MODULE_WEIGHTS.work * adjWork +
          MODULE_WEIGHTS.manager * modules.manager +
          MODULE_WEIGHTS.people * modules.people +
          MODULE_WEIGHTS.growth * modules.growth +
          MODULE_WEIGHTS.money * adjMoney +
          MODULE_WEIGHTS.wellbeing * adjWellbeing +
          aiAdjust,
      ),
    ),
  )
  return { adjMoney, adjWellbeing, adjWork, adjMaster }
}

// Back-compat shim — keep old callers working until they migrate.
export function recomputeMasterWithMoneyOffset(
  modules: Record<ModuleName, number>,
  moneyOffset: number,
): { adjMoney: number; adjMaster: number } {
  const { adjMoney, adjMaster } = recomputeMasterWithOffsets(
    modules,
    moneyOffset,
    { wellbeing: 0, work: 0 },
  )
  return { adjMoney, adjMaster }
}
