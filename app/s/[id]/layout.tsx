import type { Metadata } from "next"
import { supabaseServer } from "@/lib/supabase"

/**
 * /s/[id] is the share-preview URL. WhatsApp/X/LinkedIn fetch this URL to
 * render the OG image (the verdict card). Humans visiting in a browser get
 * redirected to '/' by the page component — so the link feels like 'go to
 * shouldiquit.work' while still showing the verdict image in preview.
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  let title = "Should I Quit?"
  try {
    const { data } = await supabaseServer()
      .from("sessions")
      .select("verdict_tier, master_score")
      .eq("id", params.id)
      .single()
    if (data) {
      title = `Should I Quit? — ${data.verdict_tier} (${data.master_score}/100)`
    }
  } catch {
    /* fall back to default title */
  }
  const ogUrl = `/api/og/${params.id}`
  return {
    title,
    description:
      "An anonymous 18-question diagnosis for Indian IT professionals wondering if it's time to leave.",
    openGraph: {
      title,
      images: [{ url: ogUrl, width: 1080, height: 1080 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogUrl],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
