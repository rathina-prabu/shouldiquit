"use client"
import { useState } from "react"

interface Props {
  shareUrl: string
  tier: string
  score: number
  weakestModule: string
}

// navigator.clipboard.writeText only exists in secure contexts (https or
// localhost). On a phone hitting http://192.168.x:3000 over LAN it's undefined.
// Falls back to a hidden <textarea> + document.execCommand('copy') which works
// everywhere.
async function writeClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // fall through
    }
  }
  if (typeof document === "undefined") return false
  const ta = document.createElement("textarea")
  ta.value = value
  ta.style.position = "fixed"
  ta.style.top = "-9999px"
  ta.style.left = "-9999px"
  ta.style.opacity = "0"
  ta.setAttribute("readonly", "")
  document.body.appendChild(ta)
  ta.select()
  ta.setSelectionRange(0, value.length)
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
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
    const ok = await writeClipboard(text)
    if (ok) {
      setCopied("text")
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const copyLink = async () => {
    const ok = await writeClipboard(shareUrl)
    if (ok) {
      setCopied("link")
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div className="mt-1 mb-6 flex flex-col items-center gap-3">
      <div className="text-[12px] leading-relaxed text-ink/70 text-center px-2">
        Recipients see <strong className="text-ink font-medium">only your verdict + score</strong>.
        Your salary and answers stay private.
      </div>
      <button
        onClick={share}
        className="w-full bg-ink text-paper px-5 py-3.5 font-medium text-[15px] tracking-[0.04em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all flex items-center justify-center gap-2"
      >
        <span>{copied === "text" ? "Copied to clipboard ✓" : "Share this verdict"}</span>
        {copied !== "text" && <span aria-hidden>📱</span>}
      </button>
      <button
        onClick={copyLink}
        className="text-[12.5px] tracking-[0.05em] text-ink/70 hover:text-ink underline decoration-accent/60 decoration-1 underline-offset-[4px] py-1"
      >
        {copied === "link" ? "Link copied ✓" : "or copy the link"}
      </button>
    </div>
  )
}
