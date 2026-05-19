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

  // "This week, try" rules:
  //  - multiple weak modules → 1 action from each (weakest-first), max 3.
  //    Guarantees variety; never 3 actions from the same module.
  //  - single block → use that module's first 3 actions (otherwise the list
  //    would be a lonely one-liner).
  const allActions =
    blocks.length > 1
      ? blocks
          .map((b) => b.actions[0])
          .filter((a): a is string => Boolean(a))
          .slice(0, 3)
      : (blocks[0]?.actions ?? []).slice(0, 3)

  // Build a single concise summary line naming the weak areas.
  const labels = blocks.map((b) => b.label)
  const summary = buildSummary(labels)

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
        Your diagnosis
      </h2>
      <p className="text-[15px] leading-[1.55] mb-4">{summary}</p>

      {blocks.length > 0 && (
        <div className="flex flex-col">
          {blocks.map((b) => (
            <div
              key={b.module}
              className="flex justify-between items-center py-2 border-b border-ink/[0.12]"
            >
              <span className="text-[13.5px] text-ink">{b.label}</span>
              {typeof b.score === "number" && (
                <span className="font-display text-[14px] text-accent">
                  {b.score}/100
                </span>
              )}
            </div>
          ))}
        </div>
      )}

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

/**
 * Build a short summary sentence naming the user's weak areas. Honest about
 * how many there are; never longer than 2 sentences.
 */
function buildSummary(labels: string[]): string {
  if (labels.length === 0) {
    return "Nothing scored below par. The numbers say you're in good shape."
  }
  if (labels.length === 1) {
    return `${labels[0]} is the area pulling your score down. The rest is fine.`
  }
  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]} are the weak spots. Address these first.`
  }
  // 3+: list with Oxford comma
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1).join(", ")
  return `${labels.length} areas are pulling your score down: ${rest}, and ${last}. Tackle the weakest first.`
}
