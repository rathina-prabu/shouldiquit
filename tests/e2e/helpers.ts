import { Page, expect } from "@playwright/test"

export const ANSWER_LETTER_TO_INDEX = { A: 0, B: 1, C: 2, D: 3 } as const
export type AnswerLetter = keyof typeof ANSWER_LETTER_TO_INDEX

export const QUESTION_COUNT = 18

/**
 * Click the n-th answer option on the current quiz screen.
 * The QuestionCard renders exactly 4 buttons in order A, B, C, D.
 */
export async function pickAnswer(page: Page, letter: AnswerLetter): Promise<void> {
  const index = ANSWER_LETTER_TO_INDEX[letter]
  // The QuestionCard renders exactly 4 buttons (the answer options) — pick by index.
  await page.locator('button').nth(index).click()
}

export async function fillSetup(
  page: Page,
  opts: { city: string; role: string; yoe: number; workType?: "remote" | "hybrid_fixed" | "hybrid_flex" | "office" },
): Promise<void> {
  // Field order on /start: Role (select #0) → YoE → Work setup (select #1) → optional Work location (select #2)
  await page.selectOption('select >> nth=0', opts.role)
  const yoeInput = page.locator('input[type="number"]').first()
  await yoeInput.fill(String(opts.yoe))

  // Work setup dropdown (default: hybrid_flex)
  if (opts.workType && opts.workType !== "hybrid_flex") {
    await page.selectOption('select >> nth=1', opts.workType)
  }

  // Work location only appears when work setup is NOT remote
  if (opts.workType !== "remote") {
    await page.selectOption('select >> nth=2', opts.city)
  }

  await page.getByRole("button", { name: /Start the questions/ }).click()
}

export async function fillSalary(
  page: Page,
  opts: { fixed: number; variable: number },
): Promise<void> {
  const inputs = page.locator('input[type="number"]')
  await inputs.nth(0).fill(String(opts.fixed))
  await inputs.nth(1).fill(String(opts.variable))
  await page.getByRole("button", { name: /See the verdict/ }).click()
}

export async function answerAll(page: Page, letters: AnswerLetter[]): Promise<void> {
  if (letters.length !== QUESTION_COUNT) {
    throw new Error(`Need exactly ${QUESTION_COUNT} answers, got ${letters.length}`)
  }
  for (let i = 0; i < letters.length; i++) {
    await pickAnswer(page, letters[i])
  }
}

export async function clearAllStorage(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.evaluate(() => {
    try {
      window.localStorage.clear()
      window.sessionStorage.clear()
    } catch {
      /* noop */
    }
  })
}

export async function expectOnResultPage(page: Page): Promise<string> {
  await page.waitForURL(/\/r\/[A-Za-z0-9]{6}$/, { timeout: 30000 })
  await expect(page.locator("text=/100/").first()).toBeVisible({ timeout: 15000 })
  const match = page.url().match(/\/r\/([A-Za-z0-9]{6})$/)
  if (!match) throw new Error(`Expected /r/<id> URL, got ${page.url()}`)
  return match[1]
}
