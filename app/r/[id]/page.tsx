"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabaseBrowser } from "@/lib/supabase"
import { RisoLayout } from "@/components/RisoLayout"
import { VerdictBlock } from "@/components/VerdictBlock"
import { MoneySection } from "@/components/MoneySection"
import { DiagnosisBlock } from "@/components/DiagnosisBlock"
import { ShareButtons } from "@/components/ShareButtons"
import { HelplineFooter } from "@/components/HelplineFooter"
import { getOrCreateUserUuid } from "@/lib/user-uuid"
import type { City, Role, VerdictTier, ModuleName } from "@/lib/types"
import { MODULE_LABELS } from "@/lib/questions"

interface Session {
  id: string
  user_uuid: string
  city: string
  role: string
  yoe: number
  salary_fixed_lakhs: number
  salary_variable_lakhs: number
  master_score: number
  module_work: number
  module_manager: number
  module_people: number
  module_growth: number
  module_money: number
  module_wellbeing: number
  verdict_tier: VerdictTier
  weakest_module: ModuleName
  diagnosis_paragraph: string | null
  diagnosis_actions: string[] | null
  created_at: string
}

interface DiagnosisData {
  diagnosis: string
  actions: string[]
}

const TIER_TAGLINES: Record<VerdictTier, string> = {
  STAY_THRIVE: "You're winning. Close the tabs. Touch grass.",
  STAY_FIX: "Mostly fine. Fix the one broken thing.",
  ITS_COMPLICATED: "The middle. You know it. The data confirms it.",
  START_LOOKING: "Update the CV. You don't need to bolt today, but start.",
  LEAVE_NOW: "The math is done. Open LinkedIn.",
}

const TIER_LABELS: Record<VerdictTier, string> = {
  STAY_THRIVE: "Stay & Thrive ✅",
  STAY_FIX: "Stay & Fix 🤔",
  ITS_COMPLICATED: "It's Complicated 🤷",
  START_LOOKING: "Start Looking 🚪",
  LEAVE_NOW: "Leave Now 🔥",
}

export default function ResultPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [session, setSession] = useState<Session | null>(null)
  const [missing, setMissing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null)
  const [isTaker, setIsTaker] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") setShareUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    supabaseBrowser()
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setMissing(true)
          return
        }
        const s = data as Session
        setSession(s)
        const myUuid = getOrCreateUserUuid()
        setIsTaker(Boolean(myUuid && myUuid === s.user_uuid))
        if (s.diagnosis_paragraph && Array.isArray(s.diagnosis_actions)) {
          setDiagnosis({ diagnosis: s.diagnosis_paragraph, actions: s.diagnosis_actions })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!session || !isTaker || diagnosis) return
    let cancelled = false
    fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: id }),
    })
      .then((r) => r.json())
      .then((data: DiagnosisData) => {
        if (!cancelled) setDiagnosis(data)
      })
      .catch(() => {
        // server will fall back internally; if even that fails, render empty
      })
    return () => {
      cancelled = true
    }
  }, [session, isTaker, id, diagnosis])

  if (missing) {
    return (
      <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Not found">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h1 className="font-display text-[32px] mb-3">This page didn&apos;t make it.</h1>
          <p className="text-[14px] mb-6">The session you were looking for isn&apos;t here.</p>
          <Link
            href="/"
            className="bg-ink text-paper px-5 py-3 text-[14px] font-medium shadow-[3px_3px_0_#e8576b]"
          >
            Take the quiz →
          </Link>
        </div>
      </RisoLayout>
    )
  }

  if (!session) {
    return (
      <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Loading…">
        <div className="flex-1 flex items-center justify-center text-[13px] text-ink/60">
          Reading the verdict…
        </div>
      </RisoLayout>
    )
  }

  const tier = session.verdict_tier
  const weakestLabel = MODULE_LABELS[session.weakest_module] ?? session.weakest_module

  if (!isTaker) {
    return (
      <RisoLayout topBarLeft={`shouldiquit.app/r/${session.id}`} topBarRight="Visitor view">
        <div className="text-[12px] tracking-[0.2em] uppercase text-accent text-center mb-2 font-medium">
          — Someone shared this —
        </div>
        <p className="text-[16px] leading-snug text-center mb-7">
          A friend took the quiz. The verdict on their job:{" "}
          <strong className="text-accent font-medium">{TIER_LABELS[tier]}</strong>
        </p>

        <div className="text-center py-7 px-4 border-t-[1.5px] border-b-[1.5px] border-ink mb-6">
          <div className="text-[11px] tracking-[0.2em] uppercase text-accent mb-3 font-medium">
            — Their recommendation —
          </div>
          <h1 className="font-display text-[34px] leading-[0.95] tracking-tight uppercase mb-3">
            {TIER_LABELS[tier]}
          </h1>
          <div className="font-display text-[54px] leading-none tracking-[-2px]">
            {session.master_score}
            <span className="text-[18px] text-accent ml-1">/100</span>
          </div>
          <div className="mt-4 text-[12px] tracking-[0.2em] uppercase text-ink/70 font-medium">
            Weakest: <strong className="text-accent font-medium">{weakestLabel}</strong>
          </div>
          <p className="mt-3 italic text-[14px] leading-snug px-4">
            &ldquo;{TIER_TAGLINES[tier]}&rdquo;
          </p>
        </div>

        <div className="text-center text-[12px] text-ink/60 italic mb-8 px-4 leading-relaxed">
          Their salary, answers and diagnosis are not shown. That&apos;s the whole point.
        </div>

        <div className="mt-auto pt-6 border-t border-dashed border-ink/30 text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase text-accent mb-2 font-medium">
            — Your turn —
          </div>
          <h2 className="font-display text-[32px] tracking-tight mb-3.5">Take yours.</h2>
          <p className="text-[14px] text-ink/75 mb-5">
            10 minutes. Anonymous. We won&apos;t ask your name either.
          </p>
          <Link
            href="/"
            className="inline-block bg-ink text-paper px-6 py-3.5 text-[14px] font-medium shadow-[3px_3px_0_#e8576b]"
          >
            Start →
          </Link>
        </div>
      </RisoLayout>
    )
  }

  // Taker view
  const userIdShort = "usr_" + session.user_uuid.replace(/-/g, "").slice(0, 5)
  return (
    <RisoLayout topBarLeft={userIdShort} topBarRight="Confidential">
      <VerdictBlock tier={tier} score={session.master_score} />
      <MoneySection
        city={session.city as City}
        role={session.role as Role}
        yoe={session.yoe}
        fixed_lakhs={session.salary_fixed_lakhs}
        variable_lakhs={session.salary_variable_lakhs}
      />
      <DiagnosisBlock
        diagnosis={diagnosis?.diagnosis ?? null}
        actions={diagnosis?.actions ?? null}
        loading={!diagnosis}
      />
      <ShareButtons
        shareUrl={shareUrl}
        tier={tier}
        score={session.master_score}
        weakestModule={session.weakest_module}
      />
      <HelplineFooter />
    </RisoLayout>
  )
}
