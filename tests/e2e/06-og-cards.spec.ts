import { test, expect } from "@playwright/test"

// Verifies the OG share card renders for every possible verdict tier.
const TIER_PROFILES = [
  {
    tier: "STAY_THRIVE",
    // All A's = perfect score
    pick: 0,
    salary: { fixed_lakhs: 60, variable_lakhs: 10 },
  },
  {
    tier: "STAY_FIX",
    pick: 1, // all B's, near 60
    salary: { fixed_lakhs: 45, variable_lakhs: 5 },
  },
  {
    tier: "ITS_COMPLICATED",
    pick: 2, // all C's, ~30
    salary: { fixed_lakhs: 40, variable_lakhs: 5 },
  },
  {
    tier: "LEAVE_NOW",
    pick: 3, // all D's, 0
    salary: { fixed_lakhs: 10, variable_lakhs: 0 },
  },
] as const

for (const profile of TIER_PROFILES) {
  test(`OG card renders for tier ${profile.tier}`, async ({ request }) => {
    const session = await request.post("/api/sessions", {
      data: {
        setup: { city: "Bangalore", role: "Product Manager", yoe: 8 },
        salary: profile.salary,
        user_uuid: `00000000-0000-4000-8000-${Date.now().toString().padStart(12, "0").slice(-12)}`,
        answers: Array.from({ length: 18 }, (_, i) => ({
          question_id: `q${i + 1}`,
          choice_index: profile.pick,
        })),
      },
    })
    expect(session.ok()).toBe(true)
    const { id } = await session.json()

    const og = await request.get(`/api/og/${id}`)
    expect(og.status()).toBe(200)
    expect(og.headers()["content-type"]).toMatch(/image\/png/)
    const buf = await og.body()
    expect(buf.length).toBeGreaterThan(20000)
    expect(buf.readUInt32BE(16)).toBe(1080)
    expect(buf.readUInt32BE(20)).toBe(1080)
  })
}

test("OG metadata is set on /r/[id]", async ({ page, request }) => {
  // Create a session first
  const r = await request.post("/api/sessions", {
    data: {
      setup: { city: "Mumbai", role: "Engineer (IC)", yoe: 5 },
      salary: { fixed_lakhs: 30, variable_lakhs: 5 },
      user_uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      answers: Array.from({ length: 18 }, (_, i) => ({
        question_id: `q${i + 1}`,
        choice_index: 1,
      })),
    },
  })
  const { id } = await r.json()
  await page.goto(`/r/${id}`)
  // OG meta image should reference our route
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content")
  expect(ogImage).toContain(`/api/og/${id}`)
  // Title contains verdict tier
  const title = await page.title()
  expect(title).toMatch(/Should I Quit\? — (STAY|ITS|START|LEAVE)/)
})
