import type { Role } from "@/lib/types"
import {
  aiRiskFor,
  layoffImpactFor,
  perceivedAiRiskFromChoice,
  readPerception,
  riskBand,
} from "@/lib/role-risk"
import { yoeToBand } from "@/lib/benchmarks"

interface Props {
  role: Role
  yoe: number
  q19ChoiceIndex: number | null | undefined
}

const PERCEPTION_LABEL: Record<number, string> = {
  0: "Safe — needs human judgment",
  1: "Parts of it, core stays human",
  2: "Most of it, writing on the wall",
  3: "Already happening, daily",
}

export function MarketSection({ role, yoe, q19ChoiceIndex }: Props) {
  const aiRisk = aiRiskFor(role, yoe)
  const layoff = layoffImpactFor(role)
  if (aiRisk == null || layoff == null) return null

  const aiBand = riskBand(aiRisk)
  const layoffBand = riskBand(layoff)
  const perception = readPerception(role, yoe, q19ChoiceIndex)
  const userLabel =
    q19ChoiceIndex != null && q19ChoiceIndex in PERCEPTION_LABEL
      ? PERCEPTION_LABEL[q19ChoiceIndex]
      : null

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-5 mt-5 border-t border-ink/20">
        The Market
      </h2>
      <div className="flex flex-col">
        <RiskRow
          label="AI replacement risk"
          score={aiRisk}
          band={aiBand}
          sub={`${role}, ${yoeToBand(yoe)} band`}
        />
        <RiskRow
          label="Current layoff wave"
          score={layoff}
          band={layoffBand}
          sub="2025-26, India IT"
        />
      </div>

      {perception && userLabel && (
        <PerceptionPanel
          userLabel={userLabel}
          perception={perception}
          role={role}
        />
      )}
    </>
  )
}

function RiskRow({
  label,
  score,
  band,
  sub,
}: {
  label: string
  score: number
  band: { label: string; dots: number }
  sub: string
}) {
  const tone =
    band.dots >= 4
      ? "text-accent"
      : band.dots === 3
        ? "text-[#c9a227]"
        : "text-[#5a8a5a]"
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-ink/[0.12]">
      <div className="pr-3 leading-snug">
        <div className="text-[14px] font-medium text-ink">{label}</div>
        <div className="text-[11.5px] text-ink/55 italic mt-0.5">{sub}</div>
      </div>
      <div className="flex flex-col items-end whitespace-nowrap">
        <div className={`font-display text-[14px] tracking-wide ${tone}`}>
          {"●".repeat(band.dots)}
          <span className="text-ink/25">{"○".repeat(5 - band.dots)}</span>
        </div>
        <div className={`text-[11px] uppercase tracking-[0.12em] mt-0.5 ${tone}`}>
          {band.label}
        </div>
      </div>
    </div>
  )
}

function PerceptionPanel({
  userLabel,
  perception,
  role,
}: {
  userLabel: string
  perception: ReturnType<typeof readPerception>
  role: Role
}) {
  if (!perception) return null
  const { gap, delta, userPerception, actualAiRisk } = perception

  let headline: string
  let body: string

  if (gap === "underestimating") {
    headline = "You're underreading the AI risk."
    body =
      delta < -50
        ? `You said your role is safe. The data says ${actualAiRisk}% of ${role} work in your YoE band is exposed. That's a gap of ${Math.abs(delta)} points — you might be missing what's coming.`
        : `Your read: roughly ${userPerception}%. Data: ${actualAiRisk}%. Not a crisis-level gap, but you're sitting more comfortable than the market is.`
  } else if (gap === "overestimating") {
    headline = "You may be more secure than you feel."
    body =
      delta > 50
        ? `You think your role is largely going away. The data says ${actualAiRisk}% for ${role} at your YoE — significant, but not catastrophic. Your judgment matters more than you're crediting it.`
        : `Your read: ${userPerception}%. Data: ${actualAiRisk}%. Mild over-anxiety — your role is more defensible than the doom narrative suggests.`
  } else {
    headline = "You read the market correctly."
    body = `Your read (${userPerception}%) and the data (${actualAiRisk}%) line up. You're not in denial, you're not catastrophising — clear-eyed about where ${role} sits.`
  }

  return (
    <div className="mt-3 py-3 px-3.5 bg-accent/[0.06] border-l-[3px] border-accent">
      <div className="text-[11px] tracking-[0.2em] uppercase text-accent font-semibold mb-1.5">
        — Your read vs the data —
      </div>
      <div className="text-[14.5px] font-medium leading-snug mb-1.5">{headline}</div>
      <div className="text-[12.5px] leading-[1.5] text-ink/80 mb-2">{body}</div>
      <div className="text-[11.5px] text-ink/55 italic leading-snug">
        You said: <span className="text-ink/80">&ldquo;{userLabel}&rdquo;</span>
      </div>
    </div>
  )
}
