import { describe, it, expect, beforeEach } from "vitest"
import { useQuizStore } from "@/store/quiz-store"

describe("quiz store", () => {
  beforeEach(() => {
    useQuizStore.setState({ setup: null, answers: [], salary: null })
  })
  it("starts empty", () => {
    const s = useQuizStore.getState()
    expect(s.setup).toBeNull()
    expect(s.answers).toEqual([])
    expect(s.salary).toBeNull()
  })
  it("records an answer", () => {
    useQuizStore.getState().answer("q1", 2)
    expect(useQuizStore.getState().answers).toEqual([{ question_id: "q1", choice_index: 2 }])
  })
  it("overwrites a previous answer for the same question", () => {
    useQuizStore.getState().answer("q1", 0)
    useQuizStore.getState().answer("q1", 3)
    expect(useQuizStore.getState().answers).toHaveLength(1)
    expect(useQuizStore.getState().answers[0].choice_index).toBe(3)
  })
  it("stores setup data", () => {
    useQuizStore.getState().setSetup({ city: "Bangalore", role: "Software Engineer", yoe: 5 })
    expect(useQuizStore.getState().setup?.city).toBe("Bangalore")
  })
  it("stores salary data", () => {
    useQuizStore.getState().setSalary({ fixed_lakhs: 20, variable_lakhs: 4 })
    expect(useQuizStore.getState().salary?.fixed_lakhs).toBe(20)
  })
})
