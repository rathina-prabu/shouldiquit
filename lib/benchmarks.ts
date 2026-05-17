import benchmarksJson from "../data/benchmarks.json"
import type { City, Role, YoeBand } from "./types"

const UBER_DRIVER_DAILY_INR: Record<City, number> = {
  Bangalore: 600,
  Mumbai: 700,
  Gurgaon: 650,
  Chennai: 500,
  Hyderabad: 550,
  Others: 600, // tier-2 cities + remote — use Bangalore baseline as a reasonable Indian average
}

const WORKING_DAYS_PER_YEAR = 250

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

/**
 * Map a user-facing 7-track role + YoE band to the underlying role(s) in benchmarks.json.
 * The dataset is keyed by 20 narrower titles; we resolve to the title that's representative
 * at that YoE band, or to a list of titles to average across.
 */
function resolveUnderlyingRoles(track: Role, band: YoeBand): string[] {
  switch (track) {
    case "Engineer (IC)":
      if (band === "0-3") return ["Software Engineer"]
      if (band === "4-7") return ["Senior Software Engineer"]
      return ["Tech Lead"] // 8-12 and 13+ — most IC engineers at this band are Lead/Staff
    case "Engineering Manager":
      return ["Engineering Manager"]
    case "DevOps / SRE":
      return ["DevOps Engineer"]
    case "QA":
      return ["QA Engineer"]
    case "Data Scientist":
      if (band === "0-3" || band === "4-7") return ["Data Scientist"]
      return ["Senior Data Scientist"]
    case "Product Manager":
      if (band === "0-3") return ["Associate PM"]
      if (band === "4-7") return ["Product Manager"]
      return ["Senior Product Manager"]
    case "Project / Program Manager":
      return ["Project / Program Manager"]
    case "Designer":
      if (band === "0-3" || band === "4-7") return ["Designer"]
      return ["Senior Designer"]
    case "Sales":
      return ["Sales Lead"]
    case "Marketing / Growth":
      return ["Marketing Manager", "Growth Manager"]
    case "Customer Success":
      return ["Customer Success Manager"]
    case "Business Ops":
      return ["Finance Analyst", "HR Business Partner", "Operations Manager"]
  }
}

function averageCells(cells: SalaryCell[]): SalaryCell {
  const round = (n: number) => Math.round(n)
  return {
    p25: round(cells.reduce((s, c) => s + c.p25, 0) / cells.length),
    p50: round(cells.reduce((s, c) => s + c.p50, 0) / cells.length),
    p75: round(cells.reduce((s, c) => s + c.p75, 0) / cells.length),
    p90: round(cells.reduce((s, c) => s + c.p90, 0) / cells.length),
    confidence: "low",
    sources: ["aggregated across track"],
  }
}

export function lookupSalary(city: City, role: Role, yoe: number): SalaryCell | undefined {
  const band = yoeToBand(yoe)
  const cityRoles = (benchmarksJson as unknown as { salaries: Record<string, Record<string, Record<string, SalaryCell>>> }).salaries?.[city]
  if (!cityRoles) return undefined

  const underlying = resolveUnderlyingRoles(role, band)
  const cells = underlying
    .map((r) => cityRoles[r]?.[band])
    .filter((c): c is SalaryCell => Boolean(c))

  if (cells.length === 0) return undefined
  if (cells.length === 1) return cells[0]
  return averageCells(cells)
}

export function lookupCityContext(city: City) {
  return (benchmarksJson as unknown as { city_context: Record<string, unknown> }).city_context?.[city]
}

export function getUberDriverDaily(city: City): number {
  return UBER_DRIVER_DAILY_INR[city] ?? 600
}

export function computeRealDailyRate(fixedLakhs: number, variableLakhs: number): number {
  const totalLakhs = (fixedLakhs || 0) + (variableLakhs || 0)
  return Math.round((totalLakhs * 100000) / WORKING_DAYS_PER_YEAR)
}

/**
 * Salary offset applied to the Money module score (asymmetric):
 *  - below p25  → -15
 *  - p25..p50   → -5
 *  - p50..p75   →  0
 *  - above p75  →  0  (overpaid doesn't pull score toward stay)
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

export function salaryVsMarket(
  totalLakhs: number,
  city: City,
  role: Role,
  yoe: number,
): "below" | "near" | "above" | "unknown" {
  const cell = lookupSalary(city, role, yoe)
  if (!cell) return "unknown"
  if (totalLakhs < cell.p25) return "below"
  if (totalLakhs > cell.p75) return "above"
  return "near"
}
