"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { QuestionCard } from "@/components/QuestionCard"
import { useQuizStore } from "@/store/quiz-store"
import { QUESTIONS, MODULE_LABELS } from "@/lib/questions"

const SECTION_NUM: Record<string, number> = {
  work: 1, manager: 2, people: 3, growth: 4, money: 5, wellbeing: 6,
}

export default function QuizPage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const setup = useQuizStore((s) => s.setup)
  const answer = useQuizStore((s) => s.answer)

  useEffect(() => {
    if (!setup) router.replace("/start")
  }, [setup, router])

  if (!setup) return null

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

  const moduleLabel = `Section ${SECTION_NUM[q.module]} · ${MODULE_LABELS[q.module]}`

  return (
    <RisoLayout>
      <QuestionCard
        question={q}
        questionNumber={index + 1}
        totalQuestions={QUESTIONS.length}
        moduleLabel={moduleLabel}
        onAnswer={handleAnswer}
      />
    </RisoLayout>
  )
}
