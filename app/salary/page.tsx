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
  const [fixed, setFixed] = useState<number>(18)
  const [variable, setVariable] = useState<number>(4)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hydrated = useHasHydrated()

  useEffect(() => {
    if (!hydrated) return
    if (!setup) router.replace("/start")
    else if (answers.length === 0) router.replace("/quiz")
  }, [hydrated, setup, answers, router])

  if (!hydrated) return null

  const total = (fixed || 0) + (variable || 0)

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    setSalary({ fixed_lakhs: fixed, variable_lakhs: variable })
    try {
      const user_uuid = getOrCreateUserUuid()
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup,
          answers,
          salary: { fixed_lakhs: fixed, variable_lakhs: variable },
          user_uuid,
        }),
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

  return (
    <RisoLayout topBarLeft="shouldiquit.work" topBarRight="The Big One">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        Almost done
      </div>
      <h1 className="font-display text-[28px] leading-tight tracking-tight mb-4">
        One last thing.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Your salary. The biggest input into the verdict.
      </p>

      <SalaryField label="Annual fixed (CTC)" value={fixed} onChange={setFixed} />
      <SalaryField
        label="Variable + bonus"
        hint="Don't include ESOPs — they're not cash in hand."
        value={variable}
        onChange={setVariable}
      />

      <div className="mt-5 py-4 border-b border-ink flex justify-between items-center">
        <span className="text-[11px] tracking-[0.18em] uppercase text-ink/60">Total</span>
        <span className="font-display text-[28px] tracking-tight">₹{total} L</span>
      </div>

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
    </RisoLayout>
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
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="mb-4">
      <div className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-1.5 font-medium">
        {label}
      </div>
      <div className="flex items-center border-b-[1.5px] border-ink py-1.5 focus-within:border-accent">
        <span className="font-display text-[18px] text-accent mr-2">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
