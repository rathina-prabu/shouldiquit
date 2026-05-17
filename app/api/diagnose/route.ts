import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { diagnose, templatedDiagnosis } from "@/lib/claude"
import { QUESTIONS } from "@/lib/questions"
import { salaryVsMarket } from "@/lib/benchmarks"
import type { City, Role, ModuleName, VerdictTier, WorkType } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

  // Return cached if already diagnosed
  if (session.diagnosis_paragraph) {
    return NextResponse.json({
      diagnosis: session.diagnosis_paragraph,
      actions: session.diagnosis_actions ?? [],
      source: "cached",
    })
  }

  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("session_id", session_id)

  const top_extreme_answers = (answers ?? [])
    .filter((a: { choice_index: number }) => a.choice_index === 3)
    .map((a: { question_id: string }) => {
      const q = QUESTIONS.find((qq) => qq.id === a.question_id)
      return q?.choices[3].label ?? ""
    })
    .filter(Boolean)
    .slice(0, 5)

  const total =
    (session.salary_fixed_lakhs ?? 0) + (session.salary_variable_lakhs ?? 0)
  const vsMarket = salaryVsMarket(
    total,
    session.city as City,
    session.role as Role,
    session.yoe,
  )

  let result
  let source: "claude" | "template" = "template"
  try {
    result = await diagnose({
      city: session.city,
      role: session.role,
      yoe: session.yoe,
      work_type: (session.work_type ?? null) as WorkType | null,
      tier: session.verdict_tier as VerdictTier,
      master: session.master_score,
      modules: {
        work: session.module_work,
        manager: session.module_manager,
        people: session.module_people,
        growth: session.module_growth,
        money: session.module_money,
        wellbeing: session.module_wellbeing,
      },
      weakest_module: session.weakest_module as ModuleName,
      salary_vs_market: vsMarket,
      intent_to_quit: session.intent_to_quit ?? 0,
      cynicism: session.cynicism ?? 0,
      agency: session.agency ?? 0,
      top_extreme_answers,
    })
    source = "claude"
  } catch (err) {
    console.warn("[diagnose] Claude API unavailable, falling back to template:", err)
    result = templatedDiagnosis(
      session.weakest_module as ModuleName,
      session.verdict_tier as VerdictTier,
    )
  }

  // Cache for next visit (and visitor view fetches)
  await supabase
    .from("sessions")
    .update({
      diagnosis_paragraph: result.diagnosis,
      diagnosis_actions: result.actions,
    })
    .eq("id", session_id)

  return NextResponse.json({ ...result, source })
}
