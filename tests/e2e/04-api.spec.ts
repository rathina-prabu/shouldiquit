import { test, expect } from "@playwright/test"

const VALID_PAYLOAD = {
  setup: { city: "Bangalore", role: "Product Manager", yoe: 8 },
  salary: { fixed_lakhs: 26, variable_lakhs: 3 },
  user_uuid: "44444444-4444-4444-8444-444444444444",
  answers: Array.from({ length: 18 }, (_, i) => ({
    question_id: `q${i + 1}`,
    choice_index: 1,
  })),
}

test.describe("POST /api/sessions", () => {
  test("happy: valid payload returns 200 + id + score + tier", async ({ request }) => {
    const res = await request.post("/api/sessions", { data: VALID_PAYLOAD })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toMatch(/^[A-Za-z0-9]{6}$/)
    expect(typeof body.master_score).toBe("number")
    expect(body.master_score).toBeGreaterThan(0)
    expect(body.master_score).toBeLessThan(101)
    expect([
      "STAY_THRIVE",
      "STAY_FIX",
      "ITS_COMPLICATED",
      "START_LOOKING",
      "LEAVE_NOW",
    ]).toContain(body.verdict_tier)
  })

  test("400 when setup is missing", async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: { ...VALID_PAYLOAD, setup: undefined },
    })
    expect(res.status()).toBe(400)
  })

  test("400 when answers array is empty", async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: { ...VALID_PAYLOAD, answers: [] },
    })
    expect(res.status()).toBe(400)
  })

  test("400 when user_uuid is missing", async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: { ...VALID_PAYLOAD, user_uuid: undefined },
    })
    expect(res.status()).toBe(400)
  })

  test("400 on malformed JSON", async ({ request }) => {
    const res = await request.post("/api/sessions", {
      data: "not-json",
      headers: { "Content-Type": "application/json" },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe("POST /api/diagnose", () => {
  let sessionId: string

  test.beforeAll(async ({ request }) => {
    const r = await request.post("/api/sessions", {
      data: { ...VALID_PAYLOAD, user_uuid: "55555555-5555-4555-8555-555555555555" },
    })
    const b = await r.json()
    sessionId = b.id
  })

  test("happy: returns diagnosis + 3 actions (templated fallback because no Claude key)", async ({
    request,
  }) => {
    const res = await request.post("/api/diagnose", {
      data: { session_id: sessionId },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(typeof body.diagnosis).toBe("string")
    expect(body.diagnosis.length).toBeGreaterThan(50)
    expect(Array.isArray(body.actions)).toBe(true)
    expect(body.actions.length).toBe(3)
    expect(body.actions.every((a: string) => typeof a === "string" && a.length > 0)).toBe(true)
  })

  test("second call returns cached diagnosis", async ({ request }) => {
    const first = await request.post("/api/diagnose", { data: { session_id: sessionId } })
    const firstBody = await first.json()
    const second = await request.post("/api/diagnose", { data: { session_id: sessionId } })
    const secondBody = await second.json()
    expect(secondBody.diagnosis).toBe(firstBody.diagnosis)
    expect(secondBody.source).toBe("cached")
  })

  test("404 when session id doesn't exist", async ({ request }) => {
    const res = await request.post("/api/diagnose", {
      data: { session_id: "ZZZZZZ" },
    })
    expect(res.status()).toBe(404)
  })

  test("400 when session_id is missing", async ({ request }) => {
    const res = await request.post("/api/diagnose", { data: {} })
    expect(res.status()).toBe(400)
  })
})

test.describe("GET /api/og/[id]", () => {
  let sessionId: string

  test.beforeAll(async ({ request }) => {
    const r = await request.post("/api/sessions", {
      data: { ...VALID_PAYLOAD, user_uuid: "66666666-6666-4666-8666-666666666666" },
    })
    const b = await r.json()
    sessionId = b.id
  })

  test("returns 1080x1080 PNG", async ({ request }) => {
    const res = await request.get(`/api/og/${sessionId}`)
    expect(res.status()).toBe(200)
    expect(res.headers()["content-type"]).toMatch(/image\/png/)
    const buf = await res.body()
    expect(buf.length).toBeGreaterThan(10000)
    // PNG magic number
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50) // P
    expect(buf[2]).toBe(0x4e) // N
    expect(buf[3]).toBe(0x47) // G
    // Width and height (big-endian 32-bit) live at bytes 16-23
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    expect(width).toBe(1080)
    expect(height).toBe(1080)
  })

  test("404 for unknown id", async ({ request }) => {
    const res = await request.get("/api/og/ZZZZZZ")
    expect(res.status()).toBe(404)
  })
})
