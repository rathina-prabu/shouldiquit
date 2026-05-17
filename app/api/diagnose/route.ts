import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { templatedDiagnosis } from "@/lib/claude"
import type { ModuleName, VerdictTier } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Diagnosis is template-driven (no AI calls). 30 hand-written templates cover
// every (weakest_module × verdict_tier) pair. The Claude SDK wiring in
// lib/claude.ts is preserved for a future switch but not invoked.
export async function POST(req: NextRequest) {
  let session_id: string | undefined
  try {
    const body = (await req.json()) as { session_id?: string }
    session_id = body.session_id
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 })
  }
  if (!session_id) {
    return NextResponse.json({ error: "missing session_id" }, { status: 400 })
  }

  const supabase = supabaseServer()
  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", session_id)
    .single()

  if (sessionErr || !session) {
    return NextResponse.json({ error: "session not found" }, { status: 404 })
  }

  // Return cached if already computed for this session.
  if (session.diagnosis_paragraph) {
    return NextResponse.json({
      diagnosis: session.diagnosis_paragraph,
      actions: session.diagnosis_actions ?? [],
      source: "cached",
    })
  }

  const result = templatedDiagnosis(
    session.weakest_module as ModuleName,
    session.verdict_tier as VerdictTier,
  )

  // Cache for next visit (visitor view + result page rerenders).
  await supabase
    .from("sessions")
    .update({
      diagnosis_paragraph: result.diagnosis,
      diagnosis_actions: result.actions,
    })
    .eq("id", session_id)

  return NextResponse.json({ ...result, source: "template" })
}
