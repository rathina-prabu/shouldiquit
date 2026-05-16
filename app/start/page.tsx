"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RisoLayout } from "@/components/RisoLayout"
import { useQuizStore } from "@/store/quiz-store"
import { getShortUserId } from "@/lib/user-uuid"
import type { City, Role } from "@/lib/types"

const CITIES: City[] = ["Bangalore", "Mumbai", "Chennai", "Hyderabad", "Gurgaon"]

const ROLES: Role[] = [
  "Senior Product Manager", "Product Manager", "Associate PM",
  "Software Engineer", "Senior Software Engineer", "Engineering Manager", "Tech Lead",
  "Designer", "Senior Designer",
  "Data Scientist", "Senior Data Scientist",
  "DevOps Engineer", "QA Engineer",
  "Sales Lead", "Marketing Manager", "Growth Manager", "Customer Success Manager",
  "Finance Analyst", "HR Business Partner", "Operations Manager",
]

export default function StartPage() {
  const router = useRouter()
  const setSetup = useQuizStore((s) => s.setSetup)
  const reset = useQuizStore((s) => s.reset)
  const [city, setCity] = useState<City>("Bangalore")
  const [role, setRole] = useState<Role>("Senior Product Manager")
  const [yoe, setYoe] = useState<number>(8)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    setUserId(getShortUserId())
    reset()
  }, [reset])

  const submit = () => {
    setSetup({ city, role, yoe })
    router.push("/quiz")
  }

  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Step 1 of 3">
      <div className="text-[12px] tracking-[0.18em] uppercase text-accent mb-2 font-medium">
        — First, the basics —
      </div>
      <h1 className="font-display text-[30px] leading-tight tracking-tight mb-3">
        Tell us about you.
      </h1>
      <p className="text-[15px] leading-[1.55] mb-7">
        Three things to compare your situation.{" "}
        <strong className="font-medium">We never ask your name, email, or where you work.</strong>
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

      <div className="mt-8 p-4 border-l-[3px] border-accent bg-accent/[0.08] flex justify-between items-center">
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase text-accent font-medium mb-1">
            Your anonymous ID
          </div>
          <div className="font-display text-[16px]">{userId || "usr_….."}</div>
        </div>
        <div className="text-[11px] text-ink/60 text-right leading-tight">
          Generated.
          <br />
          No name attached.
        </div>
      </div>

      <button
        onClick={submit}
        className="mt-8 bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all text-center"
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
