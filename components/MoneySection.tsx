import type { City, Role } from "@/lib/types"
import {
  lookupSalary,
  computeRealDailyRate,
  getUberDriverDaily,
  yoeToBand,
  servicesMedian,
} from "@/lib/benchmarks"

interface Props {
  city: City
  role: Role
  yoe: number
  fixed_lakhs: number
  variable_lakhs: number
}

export function MoneySection({ city, role, yoe, fixed_lakhs, variable_lakhs }: Props) {
  const total = (fixed_lakhs || 0) + (variable_lakhs || 0)
  const salaryCell = lookupSalary(city, role, yoe)
  const realDaily = computeRealDailyRate(fixed_lakhs, variable_lakhs)
  const uberDaily = getUberDriverDaily(city)
  const delta = realDaily - uberDaily
  const band = yoeToBand(yoe)

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-3.5 border-t border-ink/20">
        The Money
      </h2>
      <div className="flex flex-col">
        <Row label="Your salary" value={`₹${Math.round(total * 10) / 10} L`} highlight />
        {salaryCell && (
          <>
            <Row
              label={`Product Company median · ${role} · ${city} · ${band} yr`}
              value={`₹${salaryCell.p50} L`}
            />
            <Row
              label="Service Company median"
              value={`₹${servicesMedian(salaryCell.p50, yoe)} L`}
              muted
            />
          </>
        )}
        <Row label="Your real take-home / day" value={`₹${realDaily.toLocaleString("en-IN")}`} highlight />
        <Row
          label={`🚗 ${city} Uber driver / day`}
          value={`₹${uberDaily.toLocaleString("en-IN")}`}
          muted
        />
      </div>
      <div className="mt-2 py-2.5 px-3 bg-accent/10 border-l-[3px] border-accent text-[13px] leading-relaxed">
        {delta >= 0 ? (
          <>
            You earn{" "}
            <strong className="font-medium text-accent">
              ₹{delta.toLocaleString("en-IN")} more
            </strong>{" "}
            per day than an Uber driver. ☠️
          </>
        ) : (
          <>
            You earn{" "}
            <strong className="font-medium text-accent">
              ₹{Math.abs(delta).toLocaleString("en-IN")} LESS
            </strong>{" "}
            per day than an Uber driver. ☠️☠️
          </>
        )}
      </div>
    </>
  )
}

function Row({
  label,
  value,
  highlight,
  muted,
}: {
  label: string
  value: string
  highlight?: boolean
  muted?: boolean
}) {
  const cls = ["flex justify-between items-center py-2.5 border-b border-ink/[0.12] text-[14px]"]
  if (highlight) cls.push("font-medium text-ink")
  if (muted) cls.push("text-ink/60 text-[13px]")
  return (
    <div className={cls.join(" ")}>
      <span className="pr-3 leading-snug">{label}</span>
      <span className="font-display text-[15px] whitespace-nowrap">{value}</span>
    </div>
  )
}
