import Link from "next/link"
import { RisoLayout } from "@/components/RisoLayout"

export default function LandingPage() {
  return (
    <RisoLayout topBarLeft="shouldiquit.app" topBarRight="Anonymous">
      <div className="flex flex-col flex-1 justify-center">
        <div className="text-[13px] tracking-[0.2em] uppercase text-accent mb-5 font-medium">
          — 10 minutes · 18 questions —
        </div>
        <h1 className="font-display text-[56px] leading-[0.95] tracking-[-2px] mb-6">
          Should<br />I Quit?
        </h1>
        <p className="text-[17px] leading-[1.45] mb-8 max-w-[340px]">
          An app that asks you 18 questions and answers one.{" "}
          <em className="text-accent font-medium not-italic">
            We don&apos;t know who you are. That&apos;s the point.
          </em>
        </p>
        <Link
          href="/start"
          className="self-start bg-ink text-paper px-6 py-4 font-medium text-[15px] tracking-[0.05em] shadow-[3px_3px_0_#e8576b] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#e8576b] transition-all"
        >
          Start →
        </Link>
        <div className="mt-4 text-[12px] text-ink/55">
          Free · No login · One go
        </div>
      </div>
      <div className="mt-auto pt-8 border-t border-dashed border-ink/30 text-[12px] text-ink/65 leading-relaxed">
        No name. No email. No company.{" "}
        <strong className="text-ink font-medium">Confidentiality is the whole point.</strong>
      </div>
    </RisoLayout>
  )
}
