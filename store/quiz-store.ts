import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Answer, SetupData, SalaryData } from "@/lib/types"

interface QuizState {
  setup: SetupData | null
  answers: Answer[]
  salary: SalaryData | null
  quizIndex: number
  _hasHydrated: boolean
  setSetup: (s: SetupData) => void
  answer: (question_id: string, choice_index: 0 | 1 | 2 | 3) => void
  setSalary: (s: SalaryData) => void
  setQuizIndex: (i: number) => void
  reset: () => void
  setHasHydrated: (h: boolean) => void
}

const memStore: Record<string, string> = {}
const memStorage: Storage = {
  get length() {
    return Object.keys(memStore).length
  },
  key: (i: number) => Object.keys(memStore)[i] ?? null,
  getItem: (k: string) => (k in memStore ? memStore[k] : null),
  setItem: (k: string, v: string) => {
    memStore[k] = String(v)
  },
  removeItem: (k: string) => {
    delete memStore[k]
  },
  clear: () => {
    for (const k of Object.keys(memStore)) delete memStore[k]
  },
}

function pickStorage(): Storage {
  if (typeof globalThis === "undefined") return memStorage
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage
    if (ls && typeof ls.setItem === "function" && typeof ls.getItem === "function") {
      return ls
    }
  } catch {
    // ignore
  }
  return memStorage
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      setup: null,
      answers: [],
      salary: null,
      quizIndex: 0,
      _hasHydrated: false,
      setSetup: (s) => set({ setup: s }),
      answer: (question_id, choice_index) =>
        set((state) => ({
          answers: [
            ...state.answers.filter((a) => a.question_id !== question_id),
            { question_id, choice_index },
          ],
        })),
      setSalary: (s) => set({ salary: s }),
      setQuizIndex: (i) => set({ quizIndex: i }),
      reset: () => set({ setup: null, answers: [], salary: null, quizIndex: 0 }),
      setHasHydrated: (h) => set({ _hasHydrated: h }),
    }),
    {
      name: "siq-quiz-state",
      storage: createJSONStorage(pickStorage),
      partialize: (state) => ({
        setup: state.setup,
        answers: state.answers,
        salary: state.salary,
        quizIndex: state.quizIndex,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

export function useHasHydrated(): boolean {
  // Triggers a re-render when hydration finishes.
  return useQuizStore((s) => s._hasHydrated)
}
