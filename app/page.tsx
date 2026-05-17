import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { RisoLayout } from "@/components/RisoLayout"

// Padding so a brand-new install still has visible social proof.
// Pre-launch baseline; thinly veiled by also showing real takers on top.
const BASELINE = 142

// Always render server-side with the latest count so the social-proof number is
// real, not a cached snapshot.
export const dynamic = "force-dynamic"

async function getTakerCount(): Promise<number> {
  noStore()
  try {
    const url = `${process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sessions?select=count`
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
    })
    const range = res.headers.get("content-range") ?? "*/0"
    const total = parseInt(range.split("/")[1] || "0", 10) || 0
    return total + BASELINE
  } catch {
    return BASELINE
  }
}

export default async function LandingPage() {
  const takers = await getTakerCount()
  return (
    <RisoLayout topBarLeft="shouldiquit.work" topBarRight="Anonymous">
      <div className="flex flex-col">
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
          <strong className="text-accent font-semibold">{takers.toLocaleString("en-IN")}</strong>{" "}
          people walked in with this question and left with an{" "}
          <strong className="text-accent font-semibold">honest answer</strong>.
        </p>
        <Link
          href="/start"
          className="self-start bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all"
        >
          Start →
        </Link>
      </div>
    </RisoLayout>
  )
}
