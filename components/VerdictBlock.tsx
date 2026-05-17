import type { VerdictTier } from "@/lib/types"

const TIER_LABELS: Record<VerdictTier, string> = {
  STAY_THRIVE: "Stay & Thrive ✅",
  STAY_FIX: "Stay & Fix 🤔",
  ITS_COMPLICATED: "It's Complicated 🤷",
  START_LOOKING: "Start Looking 🚪",
  LEAVE_NOW: "Leave Now 🔥",
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
    <div className="bg-accent text-paper py-9 px-5 -mx-6 mb-8 text-center">
      <div className="text-[11px] tracking-[0.2em] uppercase opacity-75 mb-2.5 font-medium">
        Should I Quit?
      </div>
      <h1 className="font-display text-[32px] leading-[1] tracking-tight mb-4 uppercase break-words px-1">
        {TIER_LABELS[tier]}
      </h1>
      <div className="flex justify-center items-baseline gap-1.5 font-display">
        <span className="text-[60px] leading-[0.9] tracking-[-2px]">{score}</span>
        <span className="text-[18px] opacity-70">/ 100</span>
      </div>
      <div className="mt-4 italic text-[15px] leading-snug opacity-95 px-3">
        &ldquo;{TIER_TAGLINES[tier]}&rdquo;
      </div>
    </div>
  )
}
