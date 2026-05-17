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

async function writeClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      /* fall through */
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

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ShareButtons({ shareUrl, tier, score, weakestModule: _weakestModule }: Props) {
  const [copied, setCopied] = useState<"link" | "native" | null>(null)
  const [sharing, setSharing] = useState(false)

  // 'Take yours' should drop friends on the landing page so they start fresh,
  // not on the sharer's visitor view.
  let landingUrl = shareUrl
  try {
    landingUrl = new URL("/", shareUrl).toString()
  } catch {
    /* shareUrl may be empty during first paint */
  }
  const tierLine = `${TIER_TEXT[tier] ?? tier} (${score}/100)`

  // Long-form message for WhatsApp / native share / copy-text.
  const message = `Should I Quit my Job?\n\nMy verdict: ${tierLine}\n\nTake yours (5 min, anonymous): ${landingUrl}`
  // Tighter version for X (280-char tweet budget).
  const xMessage = `Should I quit my job?\n\nVerdict: ${tierLine}\n\nTake yours:`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xMessage)}&url=${encodeURIComponent(landingUrl)}`
  const linkedInWeb = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(landingUrl)}`
  const linkedInApp = `linkedin://shareArticle?mini=true&url=${encodeURIComponent(landingUrl)}&title=${encodeURIComponent("Should I Quit?")}`

  const openLinkedIn = (e: React.MouseEvent) => {
    if (!isMobile()) return
    e.preventDefault()
    let appOpened = false
    const onBlur = () => {
      appOpened = true
    }
    window.addEventListener("blur", onBlur, { once: true })
    window.location.href = linkedInApp
    setTimeout(() => {
      window.removeEventListener("blur", onBlur)
      if (!appOpened) {
        window.location.href = linkedInWeb
      }
    }, 1200)
  }

  // Pull the verdict OG card image so we can attach it to the native share.
  async function fetchVerdictImage(): Promise<File | null> {
    const match = shareUrl.match(/\/r\/([A-Za-z0-9]+)/)
    if (!match) return null
    try {
      const res = await fetch(`/api/og/${match[1]}`, { cache: "no-store" })
      if (!res.ok) return null
      const blob = await res.blob()
      return new File([blob], "should-i-quit-verdict.png", { type: "image/png" })
    } catch {
      return null
    }
  }

  const nativeShare = async () => {
    if (sharing) return
    setSharing(true)
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        const data: ShareData = {
          title: "Should I Quit?",
          text: message,
          url: landingUrl,
        }
        const image = await fetchVerdictImage()
        if (image && navigator.canShare?.({ files: [image] })) {
          data.files = [image]
        }
        try {
          await navigator.share(data)
          return
        } catch {
          /* user cancelled or unsupported — fall through to clipboard */
        }
      }
      const ok = await writeClipboard(message)
      if (ok) {
        setCopied("native")
        setTimeout(() => setCopied(null), 2000)
      }
    } finally {
      setSharing(false)
    }
  }

  const copyLink = async () => {
    const ok = await writeClipboard(shareUrl)
    if (ok) {
      setCopied("link")
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const outlineCls =
    "flex-1 flex items-center justify-center py-2.5 border border-ink/30 hover:border-ink hover:bg-ink/[0.04] transition-colors"
  const filledCls =
    "flex-1 flex items-center justify-center py-2.5 transition-opacity hover:opacity-90"

  return (
    <div className="mt-1 mb-6 flex flex-col gap-3">
      <div className="text-[12px] leading-relaxed text-ink/70 text-center px-2">
        Recipients see <strong className="text-ink font-medium">only your verdict + score</strong>.
        Your salary and answers stay private.
      </div>
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share to WhatsApp"
          className={`${filledCls} bg-[#25D366]`}
        >
          <IconWhatsAppFilled />
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share to X"
          className={`${filledCls} bg-ink`}
        >
          <IconXFilled />
        </a>
        <a
          href={linkedInWeb}
          onClick={openLinkedIn}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share to LinkedIn"
          className={`${filledCls} bg-[#0A66C2]`}
        >
          <IconLinkedInFilled />
        </a>
        <button
          type="button"
          onClick={nativeShare}
          aria-label="Share with image"
          disabled={sharing}
          className={outlineCls}
        >
          {sharing ? (
            <span className="text-[11px] text-ink/60">…</span>
          ) : copied === "native" ? (
            <span className="text-[12px] text-ink">Copied!</span>
          ) : (
            <IconShare />
          )}
        </button>
      </div>
      <button
        onClick={copyLink}
        className="text-[12.5px] tracking-[0.05em] text-ink/70 hover:text-ink underline decoration-accent/60 decoration-1 underline-offset-[4px] py-1 self-center"
      >
        {copied === "link" ? "Link copied ✓" : "or copy the link"}
      </button>
    </div>
  )
}

function IconWhatsAppFilled() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#ffffff"
        d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L0 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.276l-.999 3.648 3.973-1.044zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
      />
    </svg>
  )
}

function IconXFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#f4ecd6"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

function IconLinkedInFilled() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#ffffff"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}

function IconShare() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0e3870"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
