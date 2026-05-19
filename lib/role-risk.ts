import roleRiskJson from "../data/role-risk.json"
import type { Role } from "./types"
import { yoeToBand } from "./benchmarks"

interface RoleRiskFile {
  ai_replaceability: Record<string, Record<string, number>>
  layoff_impact: Record<string, number>
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
 *  0 → "No, role is safe"            → 10
 *  1 → "Parts, core stays human"     → 35
 *  2 → "Most, writing on the wall"   → 65
 *  3 → "Already happening daily"     → 90
 */
export function perceivedAiRiskFromChoice(choiceIndex: number | null | undefined): number | null {
  if (choiceIndex == null) return null
  const map = [10, 35, 65, 90]
  return map[choiceIndex] ?? null
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
