import { test, expect } from "@playwright/test"
import {
  answerAll,
  clearAllStorage,
  expectOnResultPage,
  fillSalary,
  fillSetup,
  pickAnswer,
} from "./helpers"

test.describe("Happy path — full user journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await clearAllStorage(page)
    await page.goto("/")
  })

  test("landing renders the hook and Start CTA", async ({ page }) => {
    await expect(page.locator("text=/Should/").first()).toBeVisible()
    await expect(page.locator("text=/I Quit/").first()).toBeVisible()
    await expect(page.getByText(/~5 minutes/i)).toBeVisible()
    await expect(page.getByText(/no one safe to ask/i)).toBeVisible()
    await expect(page.getByText(/walked in with this question/i)).toBeVisible()
    await expect(page.getByText(/leave with an honest answer/i)).toBeVisible()
    await expect(page.getByRole("link", { name: /Start →/ })).toBeVisible()
    // Old copy and removed privacy footer must NOT be shown
    await expect(page.getByText(/18 questions/i)).toHaveCount(0)
    await expect(page.getByText(/No name. No email/i)).toHaveCount(0)
    await expect(page.getByText(/Confidentiality is the whole point/i)).toHaveCount(0)
  })

  test("start page renders setup form with all 5 cities and 12 tracks + anon ID", async ({
    page,
  }) => {
    await page.goto("/start")
    await expect(page.getByText(/First, the basics/i)).toBeVisible()
    await expect(page.getByText(/Tell us about you/)).toBeVisible()
    const selects = page.locator("select")
    // Default work_type is hybrid_flex → both Role and Work location dropdowns visible
    await expect(selects).toHaveCount(2)
    // Role first, then Work location
    const roleOptions = await selects.nth(0).locator("option").allTextContents()
    expect(roleOptions).toEqual([
      "Engineer (IC)",
      "Engineering Manager",
      "DevOps / SRE",
      "QA",
      "Data Scientist",
      "Product Manager",
      "Project / Program Manager",
      "Designer",
      "Sales",
      "Marketing / Growth",
      "Customer Success",
      "Business Ops",
    ])
    const cityOptions = await selects.nth(1).locator("option").allTextContents()
    expect(cityOptions).toEqual([
      "Bangalore",
      "Mumbai",
      "Chennai",
      "Hyderabad",
      "Gurgaon",
      "Others",
    ])
    // Work setup radio block — all 4 options visible
    await expect(page.getByText("Fully remote", { exact: true })).toBeVisible()
    await expect(page.getByText("Hybrid (fixed days)", { exact: true })).toBeVisible()
    await expect(page.getByText("Hybrid (flexible)", { exact: true })).toBeVisible()
    await expect(page.getByText("Fully in office", { exact: true })).toBeVisible()
    // Anonymous ID block must NOT be shown to the user
    await expect(page.getByText(/Your anonymous ID/)).toHaveCount(0)
    await expect(page.locator("text=/^usr_[a-f0-9]{5}$/")).toHaveCount(0)
  })

  test("picking 'Fully remote' hides the Work location dropdown", async ({ page }) => {
    await page.goto("/start")
    // Initially both dropdowns visible
    await expect(page.locator("select")).toHaveCount(2)
    await page.getByRole("button", { name: "Fully remote", exact: true }).click()
    // After remote, only the Role dropdown remains
    await expect(page.locator("select")).toHaveCount(1)
    // Toggle back to hybrid — Work location returns
    await page.getByRole("button", { name: "Hybrid (flexible)", exact: true }).click()
    await expect(page.locator("select")).toHaveCount(2)
  })

  test("complete journey landing → quiz → salary → result (taker view)", async ({ page }) => {
    // Landing
    await page.getByRole("link", { name: /Start →/ }).click()
    await page.waitForURL(/\/start$/)

    // Intake
    await fillSetup(page, { city: "Bangalore", role: "Product Manager", yoe: 8 })
    await page.waitForURL(/\/quiz$/)

    // 18 questions — pick all B's
    await answerAll(page, Array(18).fill("B") as ("B")[])
    await page.waitForURL(/\/salary$/)

    // Salary
    await expect(page.getByText(/Almost done/i)).toBeVisible()
    await fillSalary(page, { fixed: 26, variable: 4 })

    // Result page
    const id = await expectOnResultPage(page)
    expect(id).toMatch(/^[A-Za-z0-9]{6}$/)

    // Verdict block visible
    await expect(page.locator("text=/Recommendation/i").first()).toBeVisible()
    // Money section visible
    await expect(page.getByText(/The Money/i)).toBeVisible()
    await expect(page.locator("text=/Your salary/i")).toBeVisible()
    // Uber row label is rendered as: "🚗 <City> Uber driver / day"
    await expect(page.locator("text=/Uber driver \\/ day/i")).toBeVisible()
    // Diagnosis loads (template fires since no Anthropic key)
    await expect(page.getByText(/Your diagnosis/i)).toBeVisible({ timeout: 15000 })
    await expect(page.locator('h2:has-text("This week, try")')).toBeVisible({ timeout: 15000 })
    // Share buttons
    await expect(page.getByText(/Share/i).first()).toBeVisible()
    await expect(page.getByRole("button", { name: /Copy link/ })).toBeVisible()
    // Helpline footer
    await expect(page.getByText(/iCall 9152987821/)).toBeVisible()
    await expect(page.getByText(/Vandrevala/)).toBeVisible()
  })

  test("progress counter increments correctly across all 18 questions", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Mumbai", role: "Engineer (IC)", yoe: 4 })

    for (let i = 1; i <= 18; i++) {
      // Header shows "<n> / 18"
      await expect(page.locator(`text=/^${i} / 18$/i`).first()).toBeVisible({ timeout: 5000 })
      await pickAnswer(page, "B")
    }
    await page.waitForURL(/\/salary$/)
  })

  test("salary total updates live as you type", async ({ page }) => {
    await page.goto("/start")
    await fillSetup(page, { city: "Chennai", role: "Designer", yoe: 6 })
    for (let i = 0; i < 18; i++) await pickAnswer(page, "B")
    await page.waitForURL(/\/salary$/)

    const inputs = page.locator('input[type="number"]')
    await inputs.nth(0).fill("18")
    await inputs.nth(1).fill("3")
    await expect(page.getByText(/^₹21 L$/)).toBeVisible()

    await inputs.nth(1).fill("12")
    await expect(page.getByText(/^₹30 L$/)).toBeVisible()
  })
})
