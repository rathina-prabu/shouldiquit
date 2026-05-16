import benchmarksJson from "../data/benchmarks.json"
import type { City, Role, YoeBand } from "./types"

const UBER_DRIVER_DAILY_INR: Record<City, number> = {
  Bangalore: 600,
  Mumbai: 700,
  Gurgaon: 650,
  Chennai: 500,
  Hyderabad: 550,
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

export function lookupSalary(city: City, role: Role, yoe: number): SalaryCell | undefined {
  const band = yoeToBand(yoe)
  const cityRoles = (benchmarksJson as any).salaries?.[city]
  if (!cityRoles) return undefined
  const bands = cityRoles[role]
  if (!bands) return undefined
  return bands[band] as SalaryCell | undefined
}

export function lookupCityContext(city: City) {
  return (benchmarksJson as any).city_context?.[city]
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
