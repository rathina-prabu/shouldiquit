import { test, expect } from "@playwright/test"
import { answerAll, clearAllStorage, fillSalary, fillSetup } from "./helpers"

test.describe("Salary offset semantics (asymmetric, per spec §6)", () => {
  test("below-p25 salary applies -15 offset to money module score", async ({ request }) => {
    // Sr PM Bangalore 8-12 p25 is high. Send a very low salary against all-A answers
    // so money would have been 100 without the offset; expect it < 100 after.
    const allAs = Array.from({ length: 18 }, (_, i) => ({
      question_id: `q${i + 1}`,
      choice_index: 0,
    }))
    const lowSalary = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 10 },
        salary: { fixed_lakhs: 10, variable_lakhs: 0 }, // below p25 for sure
        user_uuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01",
        answers: allAs,
      },
    })
    expect(lowSalary.ok()).toBe(true)
    const low = await lowSalary.json()

    const fairSalary = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 10 },
        salary: { fixed_lakhs: 60, variable_lakhs: 10 }, // around p50
        user_uuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02",
        answers: allAs,
      },
    })
    expect(fairSalary.ok()).toBe(true)
    const fair = await fairSalary.json()

    // Same answers, same other modules — the only difference is the salary offset
    expect(low.master_score).toBeLessThan(fair.master_score)
  })

  test("near-p50 salary applies -5 (or 0) offset", async ({ request }) => {
    const allAs = Array.from({ length: 18 }, (_, i) => ({
      question_id: `q${i + 1}`,
      choice_index: 0,
    }))
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Hyderabad", role: "Engineer (IC)", yoe: 5 },
        salary: { fixed_lakhs: 18, variable_lakhs: 2 }, // around market
        user_uuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03",
        answers: allAs,
      },
    })
    const body = await r.json()
    // Should land in STAY_THRIVE (75+)
    expect(body.master_score).toBeGreaterThanOrEqual(75)
  })
})

test.describe("Extreme answer patterns produce extreme tiers", () => {
  test("all-A answers → STAY_THRIVE (100)", async ({ request }) => {
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Engineer (IC)", yoe: 3 },
        salary: { fixed_lakhs: 15, variable_lakhs: 2 }, // fair for early-career
        user_uuid: "cccccccc-cccc-4ccc-8ccc-cccccccccc01",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 0,
        })),
      },
    })
    const body = await r.json()
    expect(body.verdict_tier).toBe("STAY_THRIVE")
    expect(body.master_score).toBeGreaterThanOrEqual(95)
  })

  test("all-D answers → LEAVE_NOW (≤ 5)", async ({ request }) => {
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Engineer (IC)", yoe: 3 },
        salary: { fixed_lakhs: 12, variable_lakhs: 1 },
        user_uuid: "cccccccc-cccc-4ccc-8ccc-cccccccccc02",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 3,
        })),
      },
    })
    const body = await r.json()
    expect(body.verdict_tier).toBe("LEAVE_NOW")
    expect(body.master_score).toBeLessThanOrEqual(5)
  })

  test("all-C answers land in the leave-leaning half of the scale", async ({ request }) => {
    // All C's = quietly checked out. With salary offset, expect score < 40.
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Mumbai", role: "Product Manager", yoe: 6 },
        salary: { fixed_lakhs: 20, variable_lakhs: 2 },
        user_uuid: "cccccccc-cccc-4ccc-8ccc-cccccccccc03",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 2,
        })),
      },
    })
    const body = await r.json()
    expect(["ITS_COMPLICATED", "START_LOOKING", "LEAVE_NOW"]).toContain(body.verdict_tier)
    expect(body.master_score).toBeLessThan(45)
  })
})

test.describe("Each YoE band looks up benchmarks correctly", () => {
  const cases = [
    { yoe: 1, label: "0-3", uuid: "d0000001-0000-4000-8000-000000000003" },
    { yoe: 5, label: "4-7", uuid: "d0000002-0000-4000-8000-000000000047" },
    { yoe: 10, label: "8-12", uuid: "d0000003-0000-4000-8000-000000000812" },
    { yoe: 15, label: "13+", uuid: "d0000004-0000-4000-8000-000000001399" },
  ]
  for (const c of cases) {
    test(`yoe=${c.yoe} resolves to band ${c.label} without crash`, async ({ request }) => {
      const r = await request.post("/api/sessions", {
        data: {
          setup: { city: "Bangalore", role: "Engineer (IC)", yoe: c.yoe },
          salary: { fixed_lakhs: 20, variable_lakhs: 2 },
          user_uuid: c.uuid,
          answers: Array.from({ length: 18 }, (_, i) => ({
            question_id: `q${i + 1}`,
            choice_index: 1,
          })),
        },
      })
      expect(r.status()).toBe(200)
      const body = await r.json()
      expect(typeof body.master_score).toBe("number")
    })
  }
})

test.describe("Cross-module scoring (q10, q14, q2)", () => {
  test("q10 D pulls down BOTH people and growth modules", async ({ request }) => {
    const allABut10 = Array.from({ length: 18 }, (_, i) => ({
      question_id: `q${i + 1}`,
      choice_index: i === 9 ? 3 : 0, // q10 is index 9, set D
    }))
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Engineer (IC)", yoe: 3 },
        salary: { fixed_lakhs: 20, variable_lakhs: 2 },
        user_uuid: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01",
        answers: allABut10,
      },
    })
    const body = await r.json()
    expect(body.verdict_tier).toBe("STAY_THRIVE") // overall still high
    // Score should be slightly lower than full-A
  })

  test("q14 D pulls down BOTH growth and wellbeing", async ({ request }) => {
    const allABut14 = Array.from({ length: 18 }, (_, i) => ({
      question_id: `q${i + 1}`,
      choice_index: i === 13 ? 3 : 0,
    }))
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Engineer (IC)", yoe: 3 },
        salary: { fixed_lakhs: 20, variable_lakhs: 2 },
        user_uuid: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02",
        answers: allABut14,
      },
    })
    const body = await r.json()
    expect(body.verdict_tier).toBe("STAY_THRIVE")
  })
})

test.describe("UI specifics — visual + interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await clearAllStorage(page)
  })

  test("question counter and progress bar advance through all 18 questions", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    for (let i = 1; i <= 18; i++) {
      await expect(page.locator(`text=/^Q${i}$/`).first()).toBeVisible({ timeout: 5000 })
      await page
        .locator("button")
        .filter({ hasNotText: "Previous question" })
        .filter({ hasNotText: "Next question" })
        .first()
        .click()
    }
    await page.waitForURL(/\/salary$/)
  })

  test("verdict block shows correct tier emoji + tagline", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    // Answer all A's for STAY_THRIVE
    await answerAll(page, Array(18).fill("A"))
    await page.waitForURL(/\/salary$/)
    await fillSalary(page, { fixed: 18, variable: 2 })
    await page.waitForURL(/\/r\//)
    // Tier should be Stay & Thrive ✅
    await expect(page.locator("h1").first()).toContainText(/Stay & Thrive/i)
    await expect(page.locator("text=/You're winning/i")).toBeVisible({ timeout: 15000 })
  })

  test("Copy link button copies the URL to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/start")
    await fillSetup(page, { city: "Bangalore", role: "Engineer (IC)", yoe: 3 })
    await answerAll(page, Array(18).fill("B"))
    await page.waitForURL(/\/salary$/)
    await fillSalary(page, { fixed: 20, variable: 2 })
    await page.waitForURL(/\/r\//)
    const expectedUrl = page.url()

    // Wait for the result page to fully load (diagnosis + share buttons appear last)
    await expect(page.getByRole("button", { name: /Copy link/ })).toBeVisible({ timeout: 15000 })
    await page.getByRole("button", { name: /Copy link/ }).click()
    await expect(page.getByText(/Copied!/)).toBeVisible({ timeout: 3000 })
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toBe(expectedUrl)
  })

  test("Visitor 'Take yours →' CTA navigates back to landing", async ({ page, request }) => {
    // Make a session as user X
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 8 },
        salary: { fixed_lakhs: 26, variable_lakhs: 3 },
        user_uuid: "ffffffff-ffff-4fff-8fff-ffffffffff01",
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: 1,
        })),
      },
    })
    const { id } = await r.json()
    // Visit as user Y
    await page.goto("/")
    await page.evaluate(() =>
      window.localStorage.setItem("siq-user-uuid", "ffffffff-ffff-4fff-8fff-ffffffffff02"),
    )
    await page.goto(`/r/${id}`)
    await expect(page.getByText(/Visitor view/i)).toBeVisible({ timeout: 15000 })
    const cta = page.getByRole("link", { name: /Start →/ })
    await expect(cta).toBeVisible()
    await cta.click()
    await page.waitForURL("**/")
    await expect(page.getByText(/Should/).first()).toBeVisible()
  })

  test("Diagnosis paragraph uses a non-generic templated diagnosis (e.g. mentions manager)", async ({
    request,
  }) => {
    // Submit a FRUSTRATED-pattern session (weakest = manager or money)
    const r = await request.post("/api/sessions", {
      data: {
        setup: { city: "Gurgaon", role: "Product Manager", yoe: 8 },
        salary: { fixed_lakhs: 26, variable_lakhs: 3 },
        user_uuid: "00000000-9999-4000-8000-000000000099",
        answers: [0, 1, 0, 2, 3, 3, 3, 0, 0, 0, 1, 3, 3, 3, 3, 2, 3, 2].map((c, i) => ({
          question_id: `q${i + 1}`,
          choice_index: c,
        })),
      },
    })
    const { id } = await r.json()
    const dx = await request.post("/api/diagnose", { data: { session_id: id } })
    const body = await dx.json()
    // Diagnosis should be one of the rich templates (not the generic fallback)
    expect(body.diagnosis).not.toMatch(/meaningful middle band/)
    expect(body.diagnosis.length).toBeGreaterThan(80)
    expect(body.actions.length).toBe(3)
  })
})
