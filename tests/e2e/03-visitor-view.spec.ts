import { test, expect } from "@playwright/test"

test.describe("Visitor view (someone else's URL)", () => {
  let sessionId: string

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Senior Product Manager", yoe: 8 },
        salary: { fixed_lakhs: 26, variable_lakhs: 3 },
        user_uuid: "33333333-3333-4333-8333-333333333333",
        answers: [
          ...Array.from({ length: 3 }, (_, i) => ({
            question_id: `q${i + 1}`,
            choice_index: 0,
          })),
          ...Array.from({ length: 4 }, (_, i) => ({
            question_id: `q${i + 4}`,
            choice_index: 3,
          })),
          ...Array.from({ length: 4 }, (_, i) => ({
            question_id: `q${i + 8}`,
            choice_index: 0,
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            question_id: `q${i + 12}`,
            choice_index: 3,
          })),
          ...Array.from({ length: 2 }, (_, i) => ({
            question_id: `q${i + 15}`,
            choice_index: 3,
          })),
          ...Array.from({ length: 2 }, (_, i) => ({
            question_id: `q${i + 17}`,
            choice_index: 3,
          })),
        ],
      },
    })
    expect(res.ok()).toBe(true)
    const body = await res.json()
    sessionId = body.id
    expect(sessionId).toMatch(/^[A-Za-z0-9]{6}$/)
  })

  test("visitor without matching UUID sees the stripped view", async ({ page }) => {
    // Make sure localStorage is empty so we can't be the taker
    await page.goto("/")
    await page.evaluate(() => window.localStorage.clear())
    await page.goto(`/r/${sessionId}`)

    await expect(page.getByText(/Visitor view/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Someone shared this/i)).toBeVisible()
    await expect(page.locator("text=/Their recommendation/i")).toBeVisible()
    // CTA to take own quiz visible
    await expect(page.getByText(/Take yours/i).first()).toBeVisible()
    await expect(page.getByText(/Their salary, answers and diagnosis are not shown/i)).toBeVisible()

    // Visitor must NOT see salary, money section, full diagnosis paragraph, or share buttons
    await expect(page.getByText(/Your salary/i)).toHaveCount(0)
    await expect(page.getByText(/Uber driver/i)).toHaveCount(0)
    await expect(page.getByText(/Your diagnosis/i)).toHaveCount(0)
    await expect(page.getByText(/iCall 9152987821/)).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Copy link/ })).toHaveCount(0)
  })

  test("visitor with mismatched UUID sees the stripped view (UUID set, but different)", async ({
    page,
  }) => {
    await page.goto("/")
    await page.evaluate(() => {
      window.localStorage.setItem(
        "siq-user-uuid",
        "99999999-9999-4999-8999-999999999999",
      )
    })
    await page.goto(`/r/${sessionId}`)

    await expect(page.getByText(/Visitor view/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/Their salary, answers and diagnosis are not shown/i)).toBeVisible()
  })

  test("taker with matching UUID sees the full view", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      window.localStorage.setItem(
        "siq-user-uuid",
        "33333333-3333-4333-8333-333333333333",
      )
    })
    await page.goto(`/r/${sessionId}`)

    await expect(page.getByText(/Confidential/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/The Money/i)).toBeVisible()
    await expect(page.getByText(/Your salary/i)).toBeVisible()
    await expect(page.getByText(/Your diagnosis/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/This week, try/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/iCall 9152987821/)).toBeVisible()
    await expect(page.getByRole("button", { name: /Copy link/ })).toBeVisible()
    await expect(page.getByText(/Visitor view/i)).toHaveCount(0)
  })
})
