import { describe, it, expect } from "vitest"
import { computeScores, deriveVerdict, findWeakestModule } from "@/lib/scoring"
import { QUESTIONS } from "@/lib/questions"
import type { Answer } from "@/lib/types"

const allAs = (): Answer[] => QUESTIONS.map((q) => ({ question_id: q.id, choice_index: 0 }))
const allDs = (): Answer[] => QUESTIONS.map((q) => ({ question_id: q.id, choice_index: 3 }))
const allBs = (): Answer[] => QUESTIONS.map((q) => ({ question_id: q.id, choice_index: 1 }))

describe("computeScores", () => {
  it("returns 100 across every module for all-A answers", () => {
    const s = computeScores(allAs())
    expect(s.modules.work).toBe(100)
    expect(s.modules.manager).toBe(100)
    expect(s.modules.people).toBe(100)
    expect(s.modules.growth).toBe(100)
    expect(s.modules.money).toBe(100)
    expect(s.modules.wellbeing).toBe(100)
    expect(s.master).toBe(100)
    expect(s.tier).toBe("STAY_THRIVE")
  })
  it("returns 0 across every module for all-D answers", () => {
    const s = computeScores(allDs())
    expect(s.modules.work).toBe(0)
    expect(s.modules.manager).toBe(0)
    expect(s.modules.people).toBe(0)
    expect(s.modules.growth).toBe(0)
    expect(s.modules.money).toBe(0)
    expect(s.modules.wellbeing).toBe(0)
    expect(s.master).toBe(0)
    expect(s.tier).toBe("LEAVE_NOW")
  })
  it("accumulates intent_to_quit and cynicism on D answers", () => {
    const s = computeScores(allDs())
    expect(s.intent_to_quit).toBeGreaterThan(15)
    expect(s.cynicism).toBeGreaterThan(20)
  })
  it("all-B answers produce a middle-band score", () => {
    const s = computeScores(allBs())
    expect(s.master).toBeGreaterThan(40)
    expect(s.master).toBeLessThan(85)
  })
  it("weakest module is money when only Q15 is set to D", () => {
    const answers = allAs().map((a) =>
      a.question_id === "q15" || a.question_id === "q16" ? { ...a, choice_index: 3 as const } : a,
    )
    const s = computeScores(answers)
    expect(s.weakest_module).toBe("money")
    expect(s.modules.money).toBeLessThan(s.modules.work)
  })
})

describe("deriveVerdict", () => {
  it("100 → STAY_THRIVE", () => expect(deriveVerdict(100)).toBe("STAY_THRIVE"))
  it("75 → STAY_THRIVE", () => expect(deriveVerdict(75)).toBe("STAY_THRIVE"))
  it("60 → STAY_FIX", () => expect(deriveVerdict(60)).toBe("STAY_FIX"))
  it("45 → ITS_COMPLICATED", () => expect(deriveVerdict(45)).toBe("ITS_COMPLICATED"))
  it("30 → START_LOOKING", () => expect(deriveVerdict(30)).toBe("START_LOOKING"))
  it("10 → LEAVE_NOW", () => expect(deriveVerdict(10)).toBe("LEAVE_NOW"))
})

describe("findWeakestModule", () => {
  it("returns the lowest-scoring module", () => {
    expect(
      findWeakestModule({ work: 80, manager: 30, people: 60, growth: 70, money: 50, wellbeing: 90 }),
    ).toBe("manager")
  })
})
