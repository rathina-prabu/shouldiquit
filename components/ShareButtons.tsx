"use client"
import { useState } from "react"

interface Props {
  shareUrl: string
  tier: string
  score: number
  weakestModule: string
}

const TIER_TEXT: Record<string, string> = {
  STAY_THRIVE: "STAY & THRIVE ✅",
  STAY_FIX: "STAY & FIX 🤔",
  ITS_COMPLICATED: "IT'S COMPLICATED 🤷",
  START_LOOKING: "START LOOKING 🚪",
  LEAVE_NOW: "LEAVE NOW 🔥",
}

const MODULE_NAMES: Record<string, string> = {
  work: "Work",
  manager: "Manager",
  people: "People",
  growth: "Growth",
  money: "Money",
  wellbeing: "Wellbeing",
}

export function ShareButtons({ shareUrl, tier, score, weakestModule }: Props) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null)
  const moduleName = MODULE_NAMES[weakestModule] ?? weakestModule
  const text = `Just got diagnosed: ${TIER_TEXT[tier] ?? tier} (${score}/100). The ${moduleName} problem.\n\nTake yours (5 min, anonymous): ${shareUrl}`

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url: shareUrl })
        return
      } catch {
        // user cancelled or unsupported, fall through to copy
      }
    }
    await navigator.clipboard.writeText(text)
    setCopied("text")
    setTimeout(() => setCopied(null), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied("link")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mt-1 mb-5 flex gap-2 justify-center">
      <button
        onClick={share}
        className="flex-1 border border-ink px-3.5 py-2.5 text-[13px] font-medium hover:bg-ink hover:text-paper transition-colors"
      >
        📱 {copied === "text" ? "Copied!" : "Share"}
      </button>
      <button
        onClick={copyLink}
        className="flex-1 border border-ink px-3.5 py-2.5 text-[13px] font-medium hover:bg-ink hover:text-paper transition-colors"
      >
        🔗 {copied === "link" ? "Copied!" : "Copy link"}
      </button>
    </div>
  )
}
