export interface DiagnosisBlockData {
  module: string
  label: string
  score?: number
  diagnosis: string
  actions: string[]
}

interface Props {
  blocks: DiagnosisBlockData[] | null
  loading: boolean
}

export function DiagnosisBlock({ blocks, loading }: Props) {
  if (loading || !blocks || blocks.length === 0) {
    return (
      <>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
          Your diagnosis
        </h2>
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-ink/15 rounded" />
          <div className="h-4 bg-ink/15 rounded w-5/6" />
          <div className="h-4 bg-ink/15 rounded w-4/6" />
          <div className="h-4 bg-ink/15 rounded w-3/6 mt-3" />
        </div>
      </>
    )
  }

  // Aggregate every block's actions into one combined "This week, try" list.
  const allActions = blocks.flatMap((b) => b.actions)

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
        Your diagnosis
      </h2>
      {blocks.length > 1 && (
        <p className="text-[12.5px] text-ink/60 italic mb-4 leading-snug">
          {blocks.length} areas scored below par. Weakest first.
        </p>
      )}
      <div className="flex flex-col gap-6">
        {blocks.map((b) => (
          <div key={b.module} className="pl-3.5 border-l-2 border-accent">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[11px] tracking-[0.18em] uppercase text-accent font-semibold">
                {b.label}
              </div>
              {typeof b.score === "number" && (
                <div className="text-[12px] text-ink/55 font-display">
                  {b.score}/100
                </div>
              )}
            </div>
            <div className="text-[15px] leading-[1.6] space-y-3 whitespace-pre-line">
              {b.diagnosis}
            </div>
          </div>
        ))}
      </div>
      {allActions.length > 0 && (
        <>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
            This week, try
          </h2>
          <div className="flex flex-col gap-3.5">
            {allActions.map((a, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="font-display text-[18px] text-accent min-w-[28px] leading-snug">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-[14.5px] leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
