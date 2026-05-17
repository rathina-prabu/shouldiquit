import benchmarksJson from "../data/benchmarks.json"
import type { City, Role, YoeBand } from "./types"

/**
 * Estimated net daily take-home for a corporate-area chaiwala who *also* sells
 * samosas — base chai (700-1000 cups × ₹10-15 × ~50% margin) + samosa add-on
 * (~250-400 samosas × ₹15-20 × ~50% margin = ₹2k-4k/day extra). Picked from
 * tech-park / CBD locations (Bangalore: Whitefield/Indiranagar, Mumbai: BKC/
 * Andheri, Gurgaon: Cyber Hub, Hyderabad: HiTech City, Chennai: OMR). Sources:
 *  - businesstoday.in (tea stall ₹18L/yr → ₹5k/day, chai-only)
 *  - marketingmind.in (₹3-5k/day chai common; ₹15k top operators with snacks)
 *  - dnaindia.com (₹90L/yr top tier)
 */
const CHAIWALA_DAILY_INR: Record<City, number> = {
  Bangalore: 5340,
  Mumbai: 6285,
  Gurgaon: 6395,
  Hyderabad: 4810,
  Chennai: 3805,
  Others: 3860, // tier-2 cities + remote — mirror Chennai (same fallback used for salaries)
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
  const allSalaries = (benchmarksJson as unknown as { salaries: Record<string, Record<string, Record<string, SalaryCell>>> }).salaries
  const underlying = resolveUnderlyingRoles(role, band)

  // "Others" (catch-all for non-metro / remote workers) has no city-specific
  // dataset — fall back to Chennai numbers, which sit in the middle of the
  // metro range and reasonably approximate non-metro India.
  const resolvedCity = city === "Others" ? "Chennai" : city
  const cityRoles = allSalaries?.[resolvedCity]
  if (!cityRoles) return undefined

  const cells = underlying
    .map((r) => cityRoles[r]?.[band])
    .filter((c): c is SalaryCell => Boolean(c))

  if (cells.length === 0) return undefined
  if (cells.length === 1) return cells[0]
  return averageCells(cells)
}

export function lookupCityContext(city: City) {
  const resolvedCity = city === "Others" ? "Chennai" : city
  return (benchmarksJson as unknown as { city_context: Record<string, unknown> }).city_context?.[resolvedCity]
}

export function getChaiwalaDaily(city: City): number {
  return CHAIWALA_DAILY_INR[city] ?? 3500
}

/**
 * India New Tax Regime — FY 2025-26 (AY 2026-27).
 * Applies:
 *  - Standard deduction ₹75,000 (salaried)
 *  - Slabs: 0-4L: 0%, 4-8L: 5%, 8-12L: 10%, 12-16L: 15%, 16-20L: 20%,
 *           20-24L: 25%, >24L: 30%
 *  - Section 87A rebate: zero tax if taxable income ≤ ₹12L
 *  - Surcharge: 10% (50L-1Cr), 15% (1-2Cr), 25% (>2Cr, capped under new regime)
 *  - Health & Education Cess: 4% on tax + surcharge
 * Skips marginal relief, HRA, 80C and other deductions (most don't apply
 * under new regime by default; standard deduction is the main one).
 */
export function postTaxAnnualLakhs(grossLakhs: number): number {
  const gross = (grossLakhs || 0) * 100000
  if (gross <= 0) return 0

  const standardDeduction = 75000
  const taxableIncome = Math.max(0, gross - standardDeduction)

  const slabs: Array<{ upTo: number; rate: number }> = [
    { upTo: 400000, rate: 0 },
    { upTo: 800000, rate: 0.05 },
    { upTo: 1200000, rate: 0.1 },
    { upTo: 1600000, rate: 0.15 },
    { upTo: 2000000, rate: 0.2 },
    { upTo: 2400000, rate: 0.25 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.3 },
  ]

  let tax = 0
  let prevLimit = 0
  for (const slab of slabs) {
    if (taxableIncome > prevLimit) {
      const slabIncome = Math.min(taxableIncome, slab.upTo) - prevLimit
      tax += slabIncome * slab.rate
    }
    prevLimit = slab.upTo
  }

  // Section 87A full rebate up to ₹12L taxable income (new regime)
  if (taxableIncome <= 1200000) tax = 0

  // Surcharge on tax
  let surcharge = 0
  if (gross > 20000000) surcharge = tax * 0.25
  else if (gross > 10000000) surcharge = tax * 0.15
  else if (gross > 5000000) surcharge = tax * 0.1

  const cess = (tax + surcharge) * 0.04
  const totalTax = tax + surcharge + cess
  return (gross - totalTax) / 100000
}

export function computeRealDailyRate(fixedLakhs: number, variableLakhs: number): number {
  const totalLakhs = (fixedLakhs || 0) + (variableLakhs || 0)
  const postTaxLakhs = postTaxAnnualLakhs(totalLakhs)
  return Math.round((postTaxLakhs * 100000) / WORKING_DAYS_PER_YEAR)
}

/**
 * Salary offset applied to the Money module score (heavily asymmetric).
 * Being underpaid bites; being well-paid lifts only modestly — a high salary
 * doesn't fix a miserable job, but a low salary makes a decent one worse.
 *   - below p25   → -25  (severely underpaid)
 *   - p25..p50    → -12  (underpaid)
 *   - p50..p75    →   0  (fair)
 *   - p75..p90    →  +4  (well paid)
 *   - above p90   →  +7  (top of market)
 */
export function computeSalaryOffset(
  totalLakhs: number,
  city: City,
  role: Role,
  yoe: number,
): number {
  const cell = lookupSalary(city, role, yoe)
  if (!cell) return 0
  if (totalLakhs < cell.p25) return -25
  if (totalLakhs < cell.p50) return -12
  if (totalLakhs < cell.p75) return 0
  if (totalLakhs < cell.p90) return 4
  return 7
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

/**
 * The 'Market median' in our dataset is product-company-skewed (Razorpay, Flipkart,
 * Swiggy, GCC tier). Services / IT consulting medians (TCS, Infosys, Wipro,
 * Cognizant) run substantially lower — the gap is biggest at fresher level and
 * narrows with seniority. Returns an estimate of the services p50.
 */
const SERVICES_MULTIPLIER: Record<YoeBand, number> = {
  "0-3": 0.40,
  "4-7": 0.45,
  "8-12": 0.55,
  "13+": 0.60,
}

export function servicesMedian(productMedian: number, yoe: number): number {
  const band = yoeToBand(yoe)
  return Math.round(productMedian * SERVICES_MULTIPLIER[band])
}
