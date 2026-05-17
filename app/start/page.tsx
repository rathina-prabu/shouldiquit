"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore } from "@/store/quiz-store"
import { getOrCreateUserUuid } from "@/lib/user-uuid"
import type { City, Role, WorkType } from "@/lib/types"
import { WORK_TYPE_LABELS } from "@/lib/types"

const CITIES: City[] = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Gurgaon"]

const ROLES: Role[] = [
  "Engineer (IC)",
  "Engineering Manager",
  "DevOps / SRE",
  "QA",
  "Data Scientist",
  "Product Manager",
  "Project / Program Manager",
  "Designer",
  "Sales",
  "Marketing / Growth",
  "Customer Success",
  "Business Ops",
]

export default function StartPage() {
  const router = useRouter()
  const setSetup = useQuizStore((s) => s.setSetup)
  const reset = useQuizStore((s) => s.reset)
  const [city, setCity] = useState<City>("Bangalore")
  const [role, setRole] = useState<Role>("Engineer (IC)")
  const [yoe, setYoe] = useState<number>(8)
  const [workType, setWorkType] = useState<WorkType>("hybrid_flex")

  // Ensure the anonymous user_uuid exists in localStorage on first /start visit,
  // even though we no longer display it. The result page's taker-vs-visitor match
  // depends on this UUID being set before the session is created.
  useEffect(() => {
    getOrCreateUserUuid()
  }, [])

  const submit = () => {
    // Start a fresh quiz: wipe previous run before storing the new setup.
    reset()
    setSetup({ city, role, yoe, work_type: workType })
    router.push("/quiz")
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Step 1 of 3">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        First, the basics
      </div>
      <h1 className="font-display text-[30px] leading-tight tracking-tight mb-3">
        Tell us about you.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Three things to compare your situation.
      </p>

      <Field label="Your city">
        <select
          className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none appearance-none"
          value={city}
          onChange={(e) => setCity(e.target.value as City)}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Your role">
        <select
          className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none appearance-none"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Total years of experience">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={50}
          className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none"
          value={yoe}
          onChange={(e) => setYoe(parseInt(e.target.value) || 0)}
        />
      </Field>

      <div className="mb-2 mt-2">
        <div className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-2 block font-medium">
          Work setup
        </div>
        <div className="flex flex-col gap-1.5">
          {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((wt) => {
            const selected = workType === wt
            return (
              <button
                key={wt}
                type="button"
                onClick={() => setWorkType(wt)}
                className={[
                  "border py-2.5 px-4 text-left text-[14.5px] flex items-center gap-3 transition-colors",
                  selected
                    ? "border-ink bg-ink/[0.04]"
                    : "border-ink/30 hover:border-ink hover:bg-ink/[0.03]",
                ].join(" ")}
                aria-pressed={selected}
              >
                <span
                  className={[
                    "h-3 w-3 rounded-full border-[1.5px] flex-shrink-0",
                    selected ? "border-accent bg-accent" : "border-ink/40",
                  ].join(" ")}
                />
                <span className="flex-1">{WORK_TYPE_LABELS[wt]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={submit}
        className="mt-10 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all text-center"
      >
        Start the questions →
      </button>
      <div className="text-[11px] text-center mt-3 text-ink/55 italic">
        18 questions · ~5 minutes
      </div>
    </RisoLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-[11px] tracking-[0.15em] uppercase text-ink/70 mb-1 block font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
