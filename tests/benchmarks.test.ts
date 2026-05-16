import { describe, it, expect } from "vitest"
import {
  yoeToBand,
  lookupSalary,
  lookupCityContext,
  computeRealDailyRate,
  computeSalaryOffset,
  getUberDriverDaily,
  salaryVsMarket,
} from "@/lib/benchmarks"

describe("yoeToBand", () => {
  it("0 → 0-3", () => expect(yoeToBand(0)).toBe("0-3"))
  it("3 → 0-3", () => expect(yoeToBand(3)).toBe("0-3"))
  it("5 → 4-7", () => expect(yoeToBand(5)).toBe("4-7"))
  it("10 → 8-12", () => expect(yoeToBand(10)).toBe("8-12"))
  it("15 → 13+", () => expect(yoeToBand(15)).toBe("13+"))
})

describe("lookupSalary", () => {
  it("returns a cell for Sr PM Bangalore 8-12", () => {
    const s = lookupSalary("Bangalore", "Senior Product Manager", 10)
    expect(s).toBeDefined()
    expect(s!.p50).toBeGreaterThan(20)
  })
})

describe("lookupCityContext", () => {
  it("returns context for Bangalore", () => {
    const c = lookupCityContext("Bangalore")
    expect(c).toBeDefined()
    expect(c.gig_cab_hourly_inr).toBeGreaterThan(0)
  })
})

describe("getUberDriverDaily", () => {
  it("Bangalore = 600", () => expect(getUberDriverDaily("Bangalore")).toBe(600))
  it("Mumbai = 700", () => expect(getUberDriverDaily("Mumbai")).toBe(700))
})

describe("computeRealDailyRate", () => {
  it("(18 L + 4 L) / 250 days = 8800", () => {
    expect(computeRealDailyRate(18, 4)).toBe(8800)
  })
})

describe("computeSalaryOffset", () => {
  it("returns negative for below-p25 salary", () => {
    const offset = computeSalaryOffset(15, "Bangalore", "Senior Product Manager", 10)
    expect(offset).toBeLessThan(0)
  })
  it("returns 0 for above-p75 salary (asymmetric)", () => {
    const offset = computeSalaryOffset(120, "Bangalore", "Senior Product Manager", 10)
    expect(offset).toBe(0)
  })
})

describe("salaryVsMarket", () => {
  it("classifies a very low salary as below", () => {
    expect(salaryVsMarket(8, "Bangalore", "Senior Product Manager", 10)).toBe("below")
  })
  it("classifies a very high salary as above", () => {
    expect(salaryVsMarket(120, "Bangalore", "Senior Product Manager", 10)).toBe("above")
  })
})
