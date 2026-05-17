"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { QuestionCard } from "@/components/QuestionCard"
import { useQuizStore, useHasHydrated } from "@/store/quiz-store"
import { QUESTIONS } from "@/lib/questions"

export default function QuizPage() {
  const router = useRouter()
  const setup = useQuizStore((s) => s.setup)
  const answers = useQuizStore((s) => s.answers)
  const answer = useQuizStore((s) => s.answer)
  const quizIndex = useQuizStore((s) => s.quizIndex)
  const setQuizIndex = useQuizStore((s) => s.setQuizIndex)
  const hydrated = useHasHydrated()

  useEffect(() => {
    if (hydrated && !setup) router.replace("/start")
  }, [hydrated, setup, router])

  if (!hydrated || !setup) return null

  const safeIndex = Math.max(0, Math.min(quizIndex, QUESTIONS.length - 1))
  const q = QUESTIONS[safeIndex]
  if (!q) return null

  const handleAnswer = (choiceIndex: 0 | 1 | 2 | 3) => {
    answer(q.id, choiceIndex)
    if (safeIndex + 1 >= QUESTIONS.length) {
      router.push("/salary")
    } else {
      setQuizIndex(safeIndex + 1)
    }
  }

  // Previous: always available.
  //  • Q1   → "← About Me" returns to /start (lets the user edit Role/YoE/etc.)
  //  • Q2+  → "← Previous" decrements the index
  const onPrevious =
    safeIndex > 0
      ? () => setQuizIndex(safeIndex - 1)
      : () => router.push("/start")
  const previousLabel = safeIndex > 0 ? "Previous" : "About Me"

  // Next: visible if the user has already been past the CURRENT question.
  // Concretely, the user has answered at least `safeIndex + 1` questions, meaning
  // they reached at least index safeIndex + 1 before going back. Doesn't require
  // the upcoming question itself to be answered (matches the case where the user
  // finished Q3 → landed on Q4 → went Previous → expects Next on Q3).
  const canGoNext =
    safeIndex < QUESTIONS.length - 1 && answers.length > safeIndex
  const onNext = canGoNext ? () => setQuizIndex(safeIndex + 1) : undefined

  // Previously selected answer (if revisiting) — mildly indicated in the UI.
  const previousAnswer = answers.find((a) => a.question_id === q.id)?.choice_index

  return (
    <RisoLayout>
      <QuestionCard
        question={q}
        questionNumber={safeIndex + 1}
        totalQuestions={QUESTIONS.length}
        selectedIndex={previousAnswer}
        onAnswer={handleAnswer}
        onPrevious={onPrevious}
        previousLabel={previousLabel}
        onNext={onNext}
      />
    </RisoLayout>
  )
}
