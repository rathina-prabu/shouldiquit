import type { Metadata } from "next"
import { supabaseServer } from "@/lib/supabase"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const { data } = await supabaseServer()
      .from("sessions")
      .select("verdict_tier, master_score")
      .eq("id", params.id)
      .single()
    if (!data) return { title: "Should I Quit?" }
    const tier = data.verdict_tier as string
    return {
      title: `Should I Quit? — ${tier} (${data.master_score}/100)`,
      description: "An anonymous 18-question diagnosis for Indian IT professionals wondering if it's time to leave.",
      openGraph: {
        title: `Should I Quit? — ${tier} (${data.master_score}/100)`,
        images: [{ url: `/api/og/${params.id}`, width: 1080, height: 1080 }],
      },
      twitter: {
        card: "summary_large_image",
        images: [`/api/og/${params.id}`],
      },
    }
  } catch {
    return { title: "Should I Quit?" }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
