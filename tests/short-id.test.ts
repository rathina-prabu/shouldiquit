import { describe, it, expect } from "vitest"
import { generateShortId } from "@/lib/short-id"

describe("generateShortId", () => {
  it("returns 6 chars by default", () => {
    expect(generateShortId()).toHaveLength(6)
  })
  it("uses only base62 alphabet", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateShortId()).toMatch(/^[0-9a-zA-Z]{6}$/)
    }
  })
  it("returns mostly different IDs on 100 consecutive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateShortId()))
    expect(ids.size).toBeGreaterThan(95)
  })
})
