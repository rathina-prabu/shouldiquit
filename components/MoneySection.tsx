import type { City, Role } from "@/lib/types"
import {
  lookupSalary,
  computeRealDailyRate,
  getChaiwalaDaily,
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
  const chaiwalaDaily = getChaiwalaDaily(city)
  const band = yoeToBand(yoe)

  return (
    <>
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-accent font-medium mb-3.5 pt-3.5 border-t border-ink/20">
        The Money
      </h2>
      <div className="flex flex-col">
        <Row
          label="Your salary"
          value={
            <span className="inline-flex items-baseline gap-2">
              <span>₹{Math.round(total * 10) / 10} L</span>
              {salaryCell && <SalaryIndicator salary={total} median={salaryCell.p50} />}
            </span>
          }
          highlight
        />
        {salaryCell && (
          <>
            <Row
              label="Product Company median"
              value={`₹${salaryCell.p50} L`}
              muted
            />
            <Row
              label="Service Company median"
              value={`₹${servicesMedian(salaryCell.p50, yoe)} L`}
              muted
            />
          </>
        )}
        <Row
          label="Your take-home / day (after tax)"
          value={`₹${realDaily.toLocaleString("en-IN")}`}
          highlight
        />
        <Row
          label="Chaiwala income per day"
          value={`₹${chaiwalaDaily.toLocaleString("en-IN")}`}
          muted
        />
      </div>
      <div className="mt-2 py-2.5 px-3 bg-accent/10 border-l-[3px] border-accent text-[13px] leading-relaxed">
        <ChaiwalaRatio realDaily={realDaily} chaiwalaDaily={chaiwalaDaily} city={city} />
      </div>
    </>
  )
}

/**
 * Visual cue next to the user's salary, benchmarked against the product-co median:
 *  < 1.33× median   → red ▼  (close to / below market)
 *  1.33×–1.60×      → amber ●  (comfortably above, but not exceptional)
 *  ≥ 1.60× median   → green ▲  (well above market)
 */
function SalaryIndicator({ salary, median }: { salary: number; median: number }) {
  if (!median || median <= 0) return null
  const ratio = salary / median

  if (ratio < 1.33) {
    return (
      <span
        className="text-[#e8576b] text-[15px] leading-none"
        aria-label="Salary is below or close to product-company market median"
        title="Below 33% over product median"
      >
        ▼
      </span>
    )
  }
  if (ratio < 1.6) {
    return (
      <span
        className="text-[#c9a227] text-[14px] leading-none"
        aria-label="Salary is moderately above product-company market median"
        title="33–60% over product median"
      >
        ●
      </span>
    )
  }
  return (
    <span
      className="text-[#5a8a5a] text-[15px] leading-none"
      aria-label="Salary is well above product-company market median"
      title="60%+ over product median"
    >
      ▲
    </span>
  )
}

/**
 * Chaiwala comparison expressed as a ratio (e.g. "1.5×"). The tone shifts
 * based on whether the user earns more or less than the chaiwala, and how
 * dramatic the gap is.
 */
function ChaiwalaRatio({
  realDaily,
  chaiwalaDaily,
  city,
}: {
  realDaily: number
  chaiwalaDaily: number
  city: string
}) {
  if (chaiwalaDaily <= 0) return null
  const ratio = realDaily / chaiwalaDaily
  if (ratio >= 1) {
    const formatted = ratio.toFixed(1).replace(/\.0$/, "")
    const flavour =
      ratio < 1.5
        ? "Barely."
        : ratio < 3
          ? "Better than the headline number suggests, isn't it?"
          : "After ~16 years of school + work to get here."
    return (
      <>
        You earn{" "}
        <strong className="font-medium text-accent">{formatted}× more</strong>
        {" "}per day than a chaiwala. {flavour}
      </>
    )
  }
  const inverse = chaiwalaDaily / realDaily
  const formatted = inverse.toFixed(1).replace(/\.0$/, "")
  return (
    <>
      A {city} chaiwala earns{" "}
      <strong className="font-medium text-accent">{formatted}× MORE</strong>
      {" "}per day than you. Read that again.
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
  value: React.ReactNode
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
