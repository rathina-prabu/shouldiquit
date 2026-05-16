import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { computeScores, recomputeMasterWithMoneyOffset, deriveVerdict, findWeakestModule } from "@/lib/scoring"
import { computeSalaryOffset } from "@/lib/benchmarks"
import { generateShortId } from "@/lib/short-id"
import type { Answer, City, Role, SetupData, SalaryData } from "@/lib/types"

interface Payload {
  setup: SetupData
  answers: Answer[]
  salary: SalaryData
  user_uuid: string
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 })
  }

  const { setup, answers, salary, user_uuid } = body
  if (!setup || !Array.isArray(answers) || answers.length === 0 || !salary || !user_uuid) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }

  const scores = computeScores(answers)
  const offset = computeSalaryOffset(
    (salary.fixed_lakhs || 0) + (salary.variable_lakhs || 0),
    setup.city as City,
    setup.role as Role,
    setup.yoe,
  )
  const { adjMoney, adjMaster } = recomputeMasterWithMoneyOffset(scores.modules, offset)
  // Re-derive verdict + weakest module from offset-adjusted modules
  const adjModules = { ...scores.modules, money: adjMoney }
  const adjTier = deriveVerdict(adjMaster)
  const adjWeakest = findWeakestModule(adjModules)

  const id = generateShortId()
  const supabase = supabaseServer()

  const { error: sessionErr } = await supabase.from("sessions").insert({
    id,
    user_uuid,
    city: setup.city,
    role: setup.role,
    yoe: setup.yoe,
    salary_fixed_lakhs: salary.fixed_lakhs,
    salary_variable_lakhs: salary.variable_lakhs,
    master_score: adjMaster,
    module_work: scores.modules.work,
    module_manager: scores.modules.manager,
    module_people: scores.modules.people,
    module_growth: scores.modules.growth,
    module_money: adjMoney,
    module_wellbeing: scores.modules.wellbeing,
    verdict_tier: adjTier,
    weakest_module: adjWeakest,
    intent_to_quit: scores.intent_to_quit,
    cynicism: scores.cynicism,
    agency: scores.agency,
  })

  if (sessionErr) {
    return NextResponse.json({ error: sessionErr.message }, { status: 500 })
  }

  const { error: answersErr } = await supabase.from("answers").insert(
    answers.map((a) => ({
      session_id: id,
      question_id: a.question_id,
      choice_index: a.choice_index,
    })),
  )
  if (answersErr) {
    return NextResponse.json({ error: answersErr.message }, { status: 500 })
  }

  return NextResponse.json({ id, master_score: adjMaster, verdict_tier: adjTier })
}
