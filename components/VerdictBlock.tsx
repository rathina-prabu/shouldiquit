import type { VerdictTier } from "@/lib/types"

const TIER_TEXT: Record<VerdictTier, string> = {
  STAY_THRIVE: "Stay & Thrive",
  STAY_FIX: "Stay & Fix",
  ITS_COMPLICATED: "It's Complicated",
  START_LOOKING: "Start Looking",
  LEAVE_NOW: "Leave Now",
}

const TIER_EMOJI: Record<VerdictTier, string> = {
  STAY_THRIVE: "✅",
  STAY_FIX: "🤔",
  ITS_COMPLICATED: "🤷",
  START_LOOKING: "🚪",
  LEAVE_NOW: "🔥",
}

const TIER_TAGLINES: Record<VerdictTier, string> = {
  STAY_THRIVE: "You're winning. Close the tabs. Touch grass.",
  STAY_FIX: "Mostly fine. Fix the one broken thing.",
  ITS_COMPLICATED: "The middle. You know it. The data confirms it.",
  START_LOOKING: "Update the CV. You don't need to bolt today, but start.",
  LEAVE_NOW: "The math is done. Open LinkedIn.",
}

export function VerdictBlock({ tier, score }: { tier: VerdictTier; score: number }) {
  return (
    <div className="bg-accent text-paper py-7 px-5 -mx-6 mb-3 text-center">
      <div className="text-[13px] tracking-[0.04em] opacity-80 mb-2 italic">
        Should I Quit?
      </div>
      <h1 className="font-display text-[30px] leading-[1.05] tracking-tight uppercase flex items-baseline justify-center flex-wrap gap-x-3">
        <span>{TIER_TEXT[tier]}</span>
        <span className="text-[28px]" aria-hidden>{TIER_EMOJI[tier]}</span>
      </h1>
      <div className="flex justify-center items-baseline gap-1.5 font-display mt-4">
        <span className="text-[60px] leading-[0.9] tracking-[-2px]">{score}</span>
        <span className="text-[18px] opacity-70">/ 100</span>
      </div>
      <div className="mt-3 italic text-[15px] leading-snug opacity-95 px-3">
        &ldquo;{TIER_TAGLINES[tier]}&rdquo;
      </div>
    </div>
  )
}
