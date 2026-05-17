"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { QuestionCard } from "@/components/QuestionCard"
import { useQuizStore, useHasHydrated } from "@/store/quiz-store"
import { QUESTIONS } from "@/lib/questions"

export default function QuizPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const setup = useQuizStore((s) => s.setup)
  const answer = useQuizStore((s) => s.answer)
  const hydrated = useHasHydrated()

  useEffect(() => {
    if (hydrated && !setup) router.replace("/start")
  }, [hydrated, setup, router])

  if (!hydrated || !setup) return null

  const q = QUESTIONS[index]
  if (!q) return null

  const handleAnswer = (choiceIndex: 0 | 1 | 2 | 3) => {
    answer(q.id, choiceIndex)
    if (index + 1 >= QUESTIONS.length) {
      router.push("/salary")
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <RisoLayout>
      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={QUESTIONS.length}
        onAnswer={handleAnswer}
      />
    </RisoLayout>
  )
}
