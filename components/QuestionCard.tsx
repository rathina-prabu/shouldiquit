import type { Question } from "@/lib/types"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  moduleLabel: string
  onAnswer: (choiceIndex: 0 | 1 | 2 | 3) => void
}

export function QuestionCard({ question, questionNumber, totalQuestions, moduleLabel, onAnswer }: Props) {
  const remaining = totalQuestions - questionNumber
  const percentDone = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <>
      <div className="flex justify-between text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-6">
        <span>{moduleLabel}</span>
        <span>
          <span className="text-accent font-medium">{questionNumber}</span> / {totalQuestions}
        </span>
      </div>
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-3 font-medium">
        — Q{questionNumber} —
      </div>
      <h1 className="font-display text-[28px] leading-[1.05] tracking-tight mb-3">
        {question.prompt}
      </h1>
      <div className="text-[11px] tracking-[0.15em] uppercase text-ink/55 mb-3 mt-8 font-medium">Pick one</div>
      <div className="flex flex-col gap-1.5">
        {question.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i as 0 | 1 | 2 | 3)}
            className="border border-ink/30 hover:border-ink hover:bg-ink/[0.04] active:bg-ink/[0.08] py-3 px-4 text-left text-[14.5px] flex items-start gap-3 transition-colors"
          >
            <span className="font-display text-accent text-[12px] min-w-[20px] pt-0.5">0{i + 1}</span>
            <span className="flex-1 leading-snug">{c.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="flex-1 h-[2px] bg-ink/15">
          <div className="h-full bg-accent transition-all" style={{ width: `${percentDone}%` }} />
        </div>
        <span className="text-[11px] tracking-[0.15em] uppercase text-ink/55">{remaining} left</span>
      </div>
    </>
  )
}
