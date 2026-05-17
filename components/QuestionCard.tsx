import type { Question } from "@/lib/types"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedIndex?: 0 | 1 | 2 | 3
  onAnswer: (choiceIndex: 0 | 1 | 2 | 3) => void
  onPrevious?: () => void
  previousLabel?: string
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

export function QuestionCard({ question, questionNumber, totalQuestions, selectedIndex, onAnswer, onPrevious, previousLabel = "Previous", onNext }: Props) {
  const percentDone = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <>
      <div className="flex justify-between items-center text-[11px] tracking-[0.15em] uppercase text-ink/60 pb-3 border-b border-ink/20 mb-6">
        <a
          href="/"
          className="inline-block text-ink font-bold text-[11px] tracking-[0.14em] uppercase bg-accent/25 px-2 py-1 border-l-[3px] border-accent hover:bg-accent/30 transition-colors"
        >
          shouldiquit.work
        </a>
        <span className="text-accent font-medium">Q{questionNumber}</span>
      </div>
      <h1 className="font-display text-[28px] leading-[1.05] tracking-tight mb-6 mt-2">
        {question.prompt}
      </h1>
      {/* min-h reserves enough room for the tallest 4-option set; shorter
          questions get extra empty space below their options. This keeps the
          progress bar + nav row at the same vertical position across every
          question, instead of shifting with each option's line count. */}
      <div className="flex flex-col gap-1.5 min-h-[360px]">
        {question.choices.map((c, i) => {
          const isSelected = selectedIndex === i
          return (
            <button
              // Key includes question.id so React mounts fresh DOM nodes per
              // question — prevents the previous click's focus ring from
              // appearing 'selected' on the next question.
              key={`${question.id}-${i}`}
              onClick={() => onAnswer(i as 0 | 1 | 2 | 3)}
              aria-pressed={isSelected}
              className={[
                "border py-3 px-4 text-left text-[14.5px] leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                isSelected
                  ? "border-ink bg-ink/[0.06] hover:bg-ink/[0.09]"
                  : "border-ink/30 hover:border-ink hover:bg-ink/[0.04] active:bg-ink/[0.08]",
              ].join(" ")}
            >
              {renderLabel(c.label, c.highlight)}
            </button>
          )
        })}
      </div>
      <div className="mt-8">
        <div className="h-[2px] bg-ink/15">
          <div className="h-full bg-accent transition-all" style={{ width: `${percentDone}%` }} />
        </div>
        <div className="mt-4 flex justify-between items-center min-h-[20px]">
          {onPrevious ? (
            <button
              type="button"
              onClick={onPrevious}
              className="text-[12px] tracking-[0.12em] uppercase text-ink/70 hover:text-ink font-medium"
              aria-label={previousLabel}
            >
              ← {previousLabel}
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
      </div>
    </>
  )
}
