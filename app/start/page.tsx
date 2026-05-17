"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore, useHasHydrated } from "@/store/quiz-store"
import { getOrCreateUserUuid } from "@/lib/user-uuid"
import type { City, Role, WorkType } from "@/lib/types"
import { WORK_TYPE_LABELS } from "@/lib/types"

const CITIES: City[] = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Gurgaon", "Others"]

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
  const hydrated = useHasHydrated()

  // Ensure the anonymous user_uuid exists in localStorage on first /start visit
  // (we no longer display it, but the result page's taker-vs-visitor match
  // depends on this UUID being set before the session is created).
  useEffect(() => {
    getOrCreateUserUuid()
  }, [])

  if (!hydrated) {
    return <RisoLayout topBarLeft="shouldiquit.work" topBarRight="The Basics" />
  }
  return <StartForm />
}

/**
 * Inner form — only mounts after Zustand has hydrated from localStorage, so
 * useState's lazy initializers correctly seed from any previously-saved setup.
 */
function StartForm() {
  const router = useRouter()
  const setSetup = useQuizStore((s) => s.setSetup)
  const reset = useQuizStore((s) => s.reset)
  const saved = useQuizStore.getState().setup

  const [role, setRole] = useState<Role>(saved?.role ?? "Engineer (IC)")
  const [yoeText, setYoeText] = useState<string>(String(saved?.yoe ?? 8))
  const [workType, setWorkType] = useState<WorkType>(saved?.work_type ?? "hybrid_flex")
  const [city, setCity] = useState<City>(saved?.city ?? "Bangalore")

  const isRemote = workType === "remote"
  const yoe = yoeText === "" ? 0 : parseInt(yoeText) || 0
  const [showSeniorWarning, setShowSeniorWarning] = useState(false)

  const submit = () => {
    if (yoe > 40) {
      setShowSeniorWarning(true)
      return
    }
    const next = {
      city: isRemote ? "Others" : city,
      role,
      yoe,
      work_type: workType,
    }
    // Only wipe quiz progress when the user has actually changed their setup.
    // If they came back to /start just to peek and didn't change anything,
    // preserve their answers + question index so they resume where they were.
    const current = useQuizStore.getState().setup
    const setupChanged =
      !current ||
      current.role !== next.role ||
      current.yoe !== next.yoe ||
      current.work_type !== next.work_type ||
      current.city !== next.city
    if (setupChanged) reset()
    setSetup(next)
    router.push("/quiz")
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.work" topBarRight="The Basics">
      <h1 className="font-display text-[30px] leading-tight tracking-tight mb-3 mt-2">
        Tell us about you.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Before the questions: a few details so we can place you against people like you.
      </p>

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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none"
          value={yoeText}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, "")
            // Normalize leading-zero entries: "02" → "2", "002" → "2", but keep "0" as-is.
            setYoeText(digits === "" ? "" : String(parseInt(digits)))
            // Hide the senior warning on any change so the user can adjust and retry.
            if (showSeniorWarning) setShowSeniorWarning(false)
          }}
        />
        {showSeniorWarning && (
          <div className="mt-2 text-[12.5px] text-accent italic leading-snug">
            Boss, you&apos;ve outgrown this quiz.
          </div>
        )}
      </Field>

      <Field label="Work setup">
        <select
          className="w-full bg-transparent border-0 border-b-[1.5px] border-ink py-2 text-[16px] font-medium focus:border-accent focus:outline-none appearance-none"
          value={workType}
          onChange={(e) => setWorkType(e.target.value as WorkType)}
        >
          {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((wt) => (
            <option key={wt} value={wt}>
              {WORK_TYPE_LABELS[wt]}
            </option>
          ))}
        </select>
      </Field>

      {!isRemote && (
        <Field label="Work location">
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
      )}

      <button
        onClick={submit}
        className="mt-10 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all text-center"
      >
        Start the questions →
      </button>
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
