import Link from "next/link"
import { RisoLayout } from "@/components/RisoLayout"
import { supabaseServer } from "@/lib/supabase"

// Padding so a brand-new install still has visible social proof.
// Pre-launch baseline; thinly veiled by also showing real takers on top.
const BASELINE = 142

// Re-fetch the live count every 5 minutes so the landing stays fresh without
// hammering Supabase on every visit. Vercel ISR caches the rendered HTML.
export const revalidate = 300

async function getTakerCount(): Promise<number> {
  try {
    const { count } = await supabaseServer()
      .from("sessions")
      .select("*", { count: "exact", head: true })
    return (count ?? 0) + BASELINE
  } catch {
    return BASELINE
  }
}

export default async function LandingPage() {
  const takers = await getTakerCount()
  return (
    <RisoLayout topBarLeft="shouldiquit.work" topBarRight="Anonymous">
      <div className="flex flex-col flex-1 justify-center">
        <div className="text-[13px] tracking-[0.2em] uppercase text-accent mb-5 font-medium">
          ~5 minutes
        </div>
        <h1 className="font-display text-[56px] leading-[0.95] tracking-[-2px] mb-6">
          Should<br />I Quit?
        </h1>
        <p className="text-[17px] leading-[1.45] mb-4 max-w-[340px]">
          It&apos;s a hard question. It keeps coming back. There&apos;s no one safe to ask.
        </p>
        <p className="text-[17px] leading-[1.45] mb-8 max-w-[340px]">
          <em className="text-accent font-medium not-italic">
            You walked in with this question and you&apos;ll leave with an honest answer.
          </em>
        </p>
        <Link
          href="/start"
          className="self-start bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all"
        >
          Start →
        </Link>
        <div className="mt-4 text-[12.5px] text-ink/65">
          <strong className="font-semibold text-accent">{takers.toLocaleString("en-IN")}</strong>{" "}
          have already taken it.
        </div>
      </div>
    </RisoLayout>
  )
}
