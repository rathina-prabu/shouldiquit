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
  const answer = useQuizStore((s) => s.answer)
  const quizIndex = useQuizStore((s) => s.quizIndex)
  const setQuizIndex = useQuizStore((s) => s.setQuizIndex)
  const hydrated = useHasHydrated()

  useEffect(() => {
    if (hydrated && !setup) router.replace("/start")
  }, [hydrated, setup, router])

  if (!hydrated || !setup) return null

  // Guard: if quizIndex somehow exceeds the question list, snap back.
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

  // Back arrow is always available:
  //  • Q2+ → previous question
  //  • Q1   → back to /start (lets the user edit role/yoe/work setup/city)
  const goBack = () => {
    if (safeIndex > 0) setQuizIndex(safeIndex - 1)
    else router.push("/start")
  }

  return (
    <RisoLayout>
      <QuestionCard
        question={q}
        questionNumber={safeIndex + 1}
        totalQuestions={QUESTIONS.length}
        onAnswer={handleAnswer}
        onBack={goBack}
      />
    </RisoLayout>
  )
}
