import { describe, it, expect } from "vitest"
import { QUESTIONS } from "@/lib/questions"

describe("QUESTIONS", () => {
  it("has 20 questions", () => {
    expect(QUESTIONS).toHaveLength(20)
  })
  it("every question has exactly 4 choices", () => {
    QUESTIONS.forEach((q) => expect(q.choices).toHaveLength(4))
  })
  it("question IDs are unique", () => {
    const ids = new Set(QUESTIONS.map((q) => q.id))
    expect(ids.size).toBe(20)
  })
  it("module distribution matches locked spec (work 3, manager 4, people 4, growth 3, money 2, wellbeing 2)", () => {
    const counts: Record<string, number> = {}
    QUESTIONS.forEach((q) => {
      counts[q.module] = (counts[q.module] || 0) + 1
    })
    expect(counts.work).toBe(3)
    expect(counts.manager).toBe(4)
    expect(counts.people).toBe(4)
    expect(counts.growth).toBe(3)
    expect(counts.money).toBe(2)
    expect(counts.wellbeing).toBe(2)
  })
  it("every option A scores higher than option D on its primary module (polarity rule)", () => {
    QUESTIONS.forEach((q) => {
      const aScore = q.choices[0].scores[q.module] ?? 0
      const dScore = q.choices[3].scores[q.module] ?? 0
      expect(aScore).toBeGreaterThan(dScore)
    })
  })
})
