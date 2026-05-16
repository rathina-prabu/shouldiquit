interface Props {
  diagnosis: string | null
  actions: string[] | null
  loading: boolean
}

export function DiagnosisBlock({ diagnosis, actions, loading }: Props) {
  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
        Your diagnosis
      </h2>
      {loading || !diagnosis ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-ink/15 rounded" />
          <div className="h-4 bg-ink/15 rounded w-5/6" />
          <div className="h-4 bg-ink/15 rounded w-4/6" />
          <div className="h-4 bg-ink/15 rounded w-3/6 mt-3" />
        </div>
      ) : (
        <div className="pl-3.5 border-l-2 border-accent text-[15px] leading-[1.6] space-y-3 whitespace-pre-line">
          {diagnosis}
        </div>
      )}
      {actions && actions.length > 0 && (
        <>
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
            This week, try
          </h2>
          <div className="flex flex-col gap-3.5">
            {actions.map((a, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="font-display text-[18px] text-accent min-w-[28px] leading-snug">
                  0{i + 1}
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
