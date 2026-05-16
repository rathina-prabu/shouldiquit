import { test, expect } from "@playwright/test"
import {
  answerAll,
  clearAllStorage,
  expectOnResultPage,
  fillSalary,
  fillSetup,
  AnswerLetter,
} from "./helpers"

// Same persona answer patterns the validation subagents produced (see validation-results.md)
const PERSONAS = [
  {
    name: "HAPPY",
    setup: { city: "Bangalore", role: "Senior Software Engineer", yoe: 5 },
    salary: { fixed: 32, variable: 6 },
    answers: ["A","B","B","A","A","A","A","A","A","A","B","B","A","B","A","A","A","A"] as AnswerLetter[],
    expectMinScore: 75,
    expectTierText: /Stay & Thrive/i,
  },
  {
    name: "MEDIOCRE",
    setup: { city: "Hyderabad", role: "Engineering Manager", yoe: 9 },
    salary: { fixed: 38, variable: 4 },
    answers: ["B","B","C","B","B","B","C","B","B","C","B","B","B","B","B","B","B","B"] as AnswerLetter[],
    // STAY_FIX or ITS_COMPLICATED both acceptable
    expectMinScore: 40,
    expectMaxScore: 74,
    expectTierText: /Stay & Fix|It.s Complicated/i,
  },
  {
    name: "FRUSTRATED",
    setup: { city: "Gurgaon", role: "Senior Product Manager", yoe: 8 },
    salary: { fixed: 26, variable: 3 },
    answers: ["A","B","A","C","D","D","D","A","A","A","B","D","D","D","D","C","D","C"] as AnswerLetter[],
    expectMaxScore: 39,
    expectTierText: /Start Looking|Leave Now/i,
  },
] as const

for (const p of PERSONAS) {
  test(`Persona — ${p.name} → expected tier`, async ({ page }) => {
    await page.goto("/")
    await clearAllStorage(page)

    await page.goto("/start")
    await fillSetup(page, p.setup)
    await answerAll(page, p.answers)
    await page.waitForURL(/\/salary$/)
    await fillSalary(page, p.salary)
    await expectOnResultPage(page)

    // Read the master score from the verdict block
    const scoreEl = page.locator(".bg-accent").locator("text=/^\\d+$/")
    const scoreText = await scoreEl.first().textContent()
    const score = parseInt(scoreText ?? "", 10)
    expect(Number.isFinite(score)).toBe(true)

    if ("expectMinScore" in p && typeof p.expectMinScore === "number") {
      expect(score).toBeGreaterThanOrEqual(p.expectMinScore)
    }
    if ("expectMaxScore" in p && typeof p.expectMaxScore === "number") {
      expect(score).toBeLessThanOrEqual(p.expectMaxScore)
    }
    await expect(page.locator("h1").first()).toContainText(p.expectTierText)
  })
}
