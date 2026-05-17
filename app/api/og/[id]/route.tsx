import { ImageResponse } from "@vercel/og"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

const TIER_TEXT: Record<string, string> = {
  STAY_THRIVE: "Stay & Thrive",
  STAY_FIX: "Stay & Fix",
  ITS_COMPLICATED: "It's Complicated",
  START_LOOKING: "Start Looking",
  LEAVE_NOW: "Leave Now",
}

const TIER_TAGLINES: Record<string, string> = {
  STAY_THRIVE: "You're winning. Close the tabs. Touch grass.",
  STAY_FIX: "Mostly fine. Fix the one broken thing.",
  ITS_COMPLICATED: "The middle. You know it. The data confirms it.",
  START_LOOKING: "Update the CV. You don't need to bolt today, but start.",
  LEAVE_NOW: "The math is done. Open LinkedIn.",
}

const PAPER = "#f4ecd6"
const INK = "#0e3870"
const ACCENT = "#e8576b"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  const { data: session } = await supabase
    .from("sessions")
    .select("master_score, verdict_tier")
    .eq("id", params.id)
    .single()

  if (!session) {
    return new Response("not found", { status: 404 })
  }

  const tier = (session.verdict_tier as string) || ""
  const tierText = TIER_TEXT[tier] ?? tier
  const tagline = TIER_TAGLINES[tier] ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "70px 70px",
          background: PAPER,
          color: INK,
          fontFamily: "system-ui, -apple-system, sans-serif",
          border: `6px solid ${INK}`,
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          <div style={{ display: "flex" }}>shouldiquit.work</div>
          <div style={{ display: "flex", color: ACCENT, fontWeight: 600 }}>Anonymous</div>
        </div>

        {/* CENTER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 8,
              color: ACCENT,
              marginBottom: 36,
              fontWeight: 600,
            }}
          >
            — FINAL RECOMMENDATION —
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: -4,
              color: INK,
              textTransform: "uppercase",
              maxWidth: 900,
              textAlign: "center",
            }}
          >
            {tierText}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 200,
                fontWeight: 900,
                lineHeight: 1,
                color: INK,
              }}
            >
              {String(session.master_score)}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 60,
                color: ACCENT,
                marginLeft: 12,
              }}
            >
              /100
            </div>
          </div>
          {tagline ? (
            <div
              style={{
                display: "flex",
                marginTop: 36,
                fontSize: 26,
                fontStyle: "italic",
                color: INK,
                maxWidth: 800,
                lineHeight: 1.35,
                opacity: 0.85,
              }}
            >
              {`"${tagline}"`}
            </div>
          ) : null}
        </div>

        {/* BOTTOM */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 26,
            borderTop: `2px solid rgba(14,56,112,0.25)`,
            fontSize: 26,
            opacity: 0.85,
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", color: ACCENT, fontWeight: 600 }}>
              shouldiquit
            </div>
            <div style={{ display: "flex" }}>.work/r/{params.id}</div>
          </div>
          <div style={{ display: "flex", fontWeight: 600 }}>Take yours →</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  )
}
