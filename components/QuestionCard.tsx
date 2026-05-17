import type { Question } from "@/lib/types"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (choiceIndex: 0 | 1 | 2 | 3) => void
  onPrevious?: () => void
  onNext?: () => void
}

function renderLabel(label: string, highlight?: string) {
  if (!highlight) return label
  const idx = label.indexOf(highlight)
  if (idx === -1) return label
  return (
    <>
      {label.slice(0, idx)}
      <span className="text-accent">{label.slice(idx, idx + highlight.length)}</span>
      {label.slice(idx + highlight.length)}
    </>
  )
}

export function QuestionCard({ question, questionNumber, totalQuestions, onAnswer, onPrevious, onNext }: Props) {
  const percentDone = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <>
      <div className="flex justify-between items-center text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-6">
        <span>shouldiquit.work</span>
        <span className="text-accent font-medium">Q{questionNumber}</span>
      </div>
      <h1 className="font-display text-[28px] leading-[1.05] tracking-tight mb-6 mt-2">
        {question.prompt}
      </h1>
      <div className="flex flex-col gap-1.5">
        {question.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i as 0 | 1 | 2 | 3)}
            className="border border-ink/30 hover:border-ink hover:bg-ink/[0.04] active:bg-ink/[0.08] py-3 px-4 text-left text-[14.5px] leading-snug transition-colors"
          >
            {renderLabel(c.label, c.highlight)}
          </button>
        ))}
      </div>
      <div className="mt-8 h-[2px] bg-ink/15">
        <div className="h-full bg-accent transition-all" style={{ width: `${percentDone}%` }} />
      </div>
      <div className="mt-4 flex justify-between items-center min-h-[20px]">
        {onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            className="text-[12px] tracking-[0.12em] uppercase text-ink/70 hover:text-ink font-medium"
            aria-label="Previous question"
          >
            ← Previous
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="text-[12px] tracking-[0.12em] uppercase text-ink/70 hover:text-ink font-medium"
            aria-label="Next question"
          >
            Next →
          </button>
        )}
      </div>
    </>
  )
}
