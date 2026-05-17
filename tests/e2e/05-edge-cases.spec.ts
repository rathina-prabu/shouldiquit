import { test, expect } from "@playwright/test"
import { answerButtons, clearAllStorage, fillSetup, pickAnswer } from "./helpers"

test.describe("Edge cases and navigation guards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await clearAllStorage(page)
  })

  test("direct nav to /quiz without setup redirects to /start", async ({ page }) => {
    await page.goto("/quiz")
    await page.waitForURL(/\/start$/, { timeout: 5000 })
  })

  test("direct nav to /salary without answers redirects to /start", async ({ page }) => {
    await page.goto("/salary")
    // No setup → bounces to /start (the salary page checks setup first)
    await page.waitForURL(/\/start$/, { timeout: 5000 })
  })

  test("direct nav to /salary with setup but no answers redirects to /quiz", async ({ page }) => {
    await page.goto("/start")
    await page.evaluate(() => {
      const raw = window.localStorage.getItem("siq-quiz-state")
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 }
      parsed.state.setup = { city: "Bangalore", role: "Engineer (IC)", yoe: 5 }
      parsed.state.answers = []
      window.localStorage.setItem("siq-quiz-state", JSON.stringify(parsed))
    })
    await page.goto("/salary")
    await page.waitForURL(/\/quiz$/, { timeout: 5000 })
  })

  test("/r/<garbage> shows the friendly not-found UI", async ({ page }) => {
    await page.goto("/r/ZZZZZZ")
    await expect(page.getByText(/didn.t make it/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("link", { name: /Take the quiz/ })).toBeVisible()
  })

  test("Previous and Next buttons are hidden on the very first visit to Q1", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    await expect(page.locator(`text=/^Q1$/`).first()).toBeVisible()
    await expect(page.getByRole("button", { name: "Previous question" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Next question" })).toHaveCount(0)
  })

  test("after finishing Q3 → Q4, Previous returns to Q3 AND Next is visible (the bug)", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    // Answer Q1, Q2, Q3 → land on Q4
    await answerButtons(page).first().click()
    await answerButtons(page).first().click()
    await answerButtons(page).first().click()
    await expect(page.locator(`text=/^Q4$/`).first()).toBeVisible()
    // Previous → Q3
    await page.getByRole("button", { name: "Previous question" }).click()
    await expect(page.locator(`text=/^Q3$/`).first()).toBeVisible()
    // Both Previous AND Next should be visible (user was past Q3)
    await expect(page.getByRole("button", { name: "Previous question" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Next question" })).toBeVisible()
    // Next → Q4
    await page.getByRole("button", { name: "Next question" }).click()
    await expect(page.locator(`text=/^Q4$/`).first()).toBeVisible()
  })

  test("on Q2 after only answering Q1, Next is NOT visible (Q2 itself not answered)", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    await answerButtons(page).first().click() // answer Q1
    await expect(page.locator(`text=/^Q2$/`).first()).toBeVisible()
    await expect(page.getByRole("button", { name: "Previous question" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Next question" })).toHaveCount(0)
  })

  test("quiz progress survives refresh — resumes at the same question", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    // Answer 4 questions, land on Q5
    for (let i = 0; i < 4; i++) {
      await answerButtons(page).first().click()
    }
    await expect(page.locator(`text=/^Q5$/`).first()).toBeVisible()
    // Refresh — should stay on Q5
    await page.reload()
    await expect(page.locator(`text=/^Q5$/`).first()).toBeVisible({ timeout: 10000 })
  })

  test("quiz state persists across refresh mid-quiz", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Mumbai", role: "Engineer (IC)", yoe: 7 })
    await pickAnswer(page, "A")
    await pickAnswer(page, "A")
    // Now we're on Q3
    await page.reload()
    // After reload, /quiz page resets question index to 0 (in-memory state),
    // but Zustand persisted answers should still hold q1 and q2.
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("siq-quiz-state"),
    )
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!) as { state: { answers: unknown[] } }
    expect(parsed.state.answers.length).toBeGreaterThanOrEqual(2)
  })

  test("anonymous user_uuid is created and persists across page nav", async ({ page }) => {
    await page.goto("/start")
    const uuid1 = await page.evaluate(() => window.localStorage.getItem("siq-user-uuid"))
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    await page.goto("/")
    await page.goto("/start")
    const uuid2 = await page.evaluate(() => window.localStorage.getItem("siq-user-uuid"))
    expect(uuid2).toBe(uuid1)
  })

  test("zero salary submission still produces a verdict (no crash)", async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Engineer (IC)", yoe: 2 },
        salary: { fixed_lakhs: 0, variable_lakhs: 0 },
        user_uuid: "77777777-7777-4777-8777-777777777777",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 1,
        })),
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(typeof body.master_score).toBe("number")
  })

  test("very high salary above p75 receives no positive offset (asymmetric rule)", async ({
    request,
  }) => {
    const veryHigh = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 10 },
        salary: { fixed_lakhs: 200, variable_lakhs: 50 },
        user_uuid: "88888888-8888-4888-8888-888888888888",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 1, // all B's
        })),
      },
    })
    const veryHighBody = await veryHigh.json()
    const normal = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 10 },
        salary: { fixed_lakhs: 50, variable_lakhs: 10 }, // p50-ish
        user_uuid: "88888888-8888-4888-8888-888888888889",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 1,
        })),
      },
    })
    const normalBody = await normal.json()
    // Both should be in the same tier — overpaid doesn't lift the master score
    expect(veryHighBody.verdict_tier).toBe(normalBody.verdict_tier)
    // Spec: "people don't stay just because they're paid well; asymmetric by design"
    expect(veryHighBody.master_score).toBeLessThanOrEqual(normalBody.master_score + 1)
  })
})
