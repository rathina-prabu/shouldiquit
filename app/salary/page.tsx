"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore, useHasHydrated } from "@/store/quiz-store"
import { getOrCreateUserUuid } from "@/lib/user-uuid"

export default function SalaryPage() {
  const router = useRouter()
  const setup = useQuizStore((s) => s.setup)
  const answers = useQuizStore((s) => s.answers)
  const setSalary = useQuizStore((s) => s.setSalary)
  const [fixedText, setFixedText] = useState<string>("18")
  const [variableText, setVariableText] = useState<string>("4")
  const fixed = parseFloat(fixedText) || 0
  const variable = parseFloat(variableText) || 0
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warn, setWarn] = useState<string | null>(null)
  const hydrated = useHasHydrated()

  // Sanity caps for the salary inputs. Values are *in lakhs* — anything past
  // ~200L is almost certainly someone typing rupees by mistake (e.g. 800000
  // when they mean 8L). Hard-cap fixed at 200L, variable at 100L.
  const FIXED_MAX = 200
  const VARIABLE_MAX = 100

  useEffect(() => {
    if (!hydrated) return
    if (!setup) router.replace("/start")
    else if (answers.length === 0) router.replace("/quiz")
  }, [hydrated, setup, answers, router])

  if (!hydrated) return null

  const total = (fixed || 0) + (variable || 0)

  const [showSkipDialog, setShowSkipDialog] = useState(false)

  const submitWithPayload = async (salaryPayload: {
    fixed_lakhs: number | null
    variable_lakhs: number | null
    skipped?: boolean
  }) => {
    setSubmitting(true)
    setError(null)
    setSalary(salaryPayload)
    try {
      const user_uuid = getOrCreateUserUuid()
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup, answers, salary: salaryPayload, user_uuid }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `HTTP ${res.status}`)
      }
      const { id } = await res.json()
      router.push(`/r/${id}`)
    } catch (err: unknown) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const submit = async () => {
    if (submitting) return
    // Block submission when values exceed sane lakh-scale bounds. The user
    // probably typed the rupee amount; show a clear correction instead of
    // silently scoring them as a crorepati.
    if (fixed > FIXED_MAX || variable > VARIABLE_MAX) {
      setWarn(
        `That looks like rupees, not lakhs. Try ${Math.round(fixed / 100000) || "8"} instead of ${fixed}.`,
      )
      return
    }
    setWarn(null)
    await submitWithPayload({ fixed_lakhs: fixed, variable_lakhs: variable })
  }

  const confirmSkip = async () => {
    setShowSkipDialog(false)
    await submitWithPayload({ fixed_lakhs: null, variable_lakhs: null, skipped: true })
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.work" topBarRight="The Big One">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        Almost done
      </div>
      <h1 className="font-display text-[28px] leading-tight tracking-tight mb-4">
        One last thing.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Your salary. One of the biggest inputs into the verdict.
      </p>

      <SalaryField label="Annual fixed (LPA)" value={fixedText} onChange={setFixedText} />
      <SalaryField
        label="Variable + bonus (LPA)"
        hint="Don't include ESOPs — they're not cash in hand."
        value={variableText}
        onChange={setVariableText}
      />

      <div className="mt-5 py-4 border-b border-ink flex justify-between items-center">
        <span className="text-[11px] tracking-[0.18em] uppercase text-ink/60">Total</span>
        <span className="font-display text-[28px] tracking-tight">₹{total} L</span>
      </div>

      {warn && (
        <div className="mt-4 p-3 border border-accent text-[12.5px] text-accent bg-accent/5 leading-snug">
          {warn}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 border border-accent text-[12px] text-accent bg-accent/5">
          Submit failed. {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-8 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? "Computing…" : "See the verdict →"}
      </button>

      <button
        type="button"
        onClick={() => setShowSkipDialog(true)}
        disabled={submitting}
        className="mt-4 self-start text-[12.5px] text-ink/60 hover:text-ink/90 underline decoration-ink/30 decoration-1 underline-offset-[4px] disabled:opacity-50"
      >
        Skip — I&apos;d rather not share my salary
      </button>

      {showSkipDialog && (
        <SkipDialog
          onCancel={() => setShowSkipDialog(false)}
          onConfirm={confirmSkip}
          submitting={submitting}
        />
      )}
    </RisoLayout>
  )
}

function SkipDialog({
  onCancel,
  onConfirm,
  submitting,
}: {
  onCancel: () => void
  onConfirm: () => void
  submitting: boolean
}) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-5 z-50">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-paper border-[1.5px] border-ink shadow-[6px_6px_0_#e8576b] max-w-[360px] w-full p-5"
      >
        <div className="text-[11px] tracking-[0.18em] uppercase text-accent mb-2 font-semibold">
          — Hold on —
        </div>
        <h3 className="font-display text-[22px] leading-tight mb-3">
          Skipping salary will make your verdict less accurate.
        </h3>
        <p className="text-[13.5px] leading-[1.55] text-ink/80 mb-2">
          Salary is one of the strongest signals. Without it we can&apos;t check
          you against the market, can&apos;t calculate your real take-home, and
          can&apos;t show you how you stack up.
        </p>
        <p className="text-[13.5px] leading-[1.55] text-ink/80 mb-5">
          Your salary stays anonymous. We don&apos;t know who you are.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-ink text-paper px-4 py-3 font-medium text-[13.5px] shadow-[3px_3px_0_#e8576b] disabled:opacity-50"
          >
            Go back, I&apos;ll add it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 border-[1.5px] border-ink/60 text-ink/80 px-4 py-3 text-[13.5px] hover:bg-ink/5 disabled:opacity-50"
          >
            {submitting ? "…" : "Skip anyway"}
          </button>
        </div>
      </div>
    </div>
  )
}

function SalaryField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (text: string) => void
}) {
  return (
    <div className="mb-4">
      <div className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-1.5 font-medium">
        {label}
      </div>
      <div className="flex items-center border-b-[1.5px] border-ink py-1.5 focus-within:border-accent">
        <span className="font-display text-[18px] text-accent mr-2">₹</span>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          value={value}
          onChange={(e) => {
            // Allow digits and a single decimal point
            let v = e.target.value.replace(/[^0-9.]/g, "")
            const firstDot = v.indexOf(".")
            if (firstDot >= 0) {
              v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "")
            }
            // Strip leading zeros on integer part: "02" → "2"; keep "0", "0.5"
            if (v && !v.startsWith(".")) {
              const dot = v.indexOf(".")
              if (dot === -1) {
                v = v === "0" ? "0" : String(parseInt(v) || 0)
              } else {
                const intPart = v.slice(0, dot)
                const fracPart = v.slice(dot)
                v = (intPart === "" || intPart === "0" ? "0" : String(parseInt(intPart) || 0)) + fracPart
              }
            }
            onChange(v)
          }}
          className="flex-1 bg-transparent border-0 outline-none font-display text-[22px]"
        />
        <span className="text-[11px] text-ink/55 tracking-[0.1em] uppercase">Lakhs</span>
      </div>
      {hint && (
        <div className="mt-1 text-[11.5px] text-ink/55 italic leading-snug">{hint}</div>
      )}
    </div>
  )
}
