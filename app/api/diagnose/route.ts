import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { templatedDiagnoses } from "@/lib/claude"
import type { ModuleName, VerdictTier } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Diagnosis is template-driven (no AI calls). 30 hand-written templates cover
// every (module × verdict_tier) pair. We now return one block per weak module
// (score < 60), sorted weakest-first, so users see *every* problem area —
// not just the single lowest score.
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

  // Return cached blocks if already computed for this session.
  // `diagnosis_actions` now stores the structured blocks array (JSONB).
  if (
    Array.isArray(session.diagnosis_actions) &&
    session.diagnosis_actions.length > 0 &&
    typeof session.diagnosis_actions[0] === "object"
  ) {
    return NextResponse.json({
      blocks: session.diagnosis_actions,
      source: "cached",
    })
  }

  // If the taker skipped salary, the money module is a thin 2-question signal
  // that's also been zeroed out in the verdict weighting — don't surface a
  // 'money is your weak area' diagnosis block for these users.
  const salaryProvided = session.salary_fixed_lakhs != null
  const moduleScores: Record<ModuleName, number> = {
    work: session.module_work,
    manager: session.module_manager,
    people: session.module_people,
    growth: session.module_growth,
    money: salaryProvided ? session.module_money : 101,
    wellbeing: session.module_wellbeing,
  }

  const blocks = templatedDiagnoses(
    moduleScores,
    session.verdict_tier as VerdictTier,
  )

  // Cache. Put structured blocks in diagnosis_actions (JSONB) and a flat
  // concatenated text in diagnosis_paragraph for any legacy consumer / search.
  const flatText = blocks
    .map((b) => `${b.label}\n${b.diagnosis}`)
    .join("\n\n")
  await supabase
    .from("sessions")
    .update({
      diagnosis_paragraph: flatText,
      diagnosis_actions: blocks,
    })
    .eq("id", session_id)

  return NextResponse.json({ blocks, source: "template" })
}
