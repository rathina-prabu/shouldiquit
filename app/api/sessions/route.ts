import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { computeScores, recomputeMasterWithOffsets, computeWorkTypeOffset, deriveVerdict, findWeakestModule } from "@/lib/scoring"
import { computeSalaryOffset, offsetEligibleTotal } from "@/lib/benchmarks"
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
  // Salary may be skipped — in that case fixed/variable are null and we don't
  // apply any salary-vs-market offset. The money module then reflects the
  // quiz answers alone.
  const salaryProvided =
    !salary.skipped &&
    salary.fixed_lakhs != null &&
    !Number.isNaN(salary.fixed_lakhs)
  const moneyOffset = salaryProvided
    ? computeSalaryOffset(
        offsetEligibleTotal(salary.fixed_lakhs as number, (salary.variable_lakhs ?? 0) as number),
        setup.city as City,
        setup.role as Role,
        setup.yoe,
      )
    : 0
  const workTypeOffset = computeWorkTypeOffset(setup.work_type)
  const { adjMoney, adjWellbeing, adjWork, adjMaster } = recomputeMasterWithOffsets(
    scores.modules,
    moneyOffset,
    workTypeOffset,
  )
  // Re-derive verdict + weakest module from offset-adjusted modules
  const adjModules = {
    ...scores.modules,
    money: adjMoney,
    wellbeing: adjWellbeing,
    work: adjWork,
  }
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
    work_type: setup.work_type ?? null,
    salary_fixed_lakhs: salaryProvided ? salary.fixed_lakhs : null,
    salary_variable_lakhs: salaryProvided ? salary.variable_lakhs ?? 0 : null,
    master_score: adjMaster,
    module_work: adjWork,
    module_manager: scores.modules.manager,
    module_people: scores.modules.people,
    module_growth: scores.modules.growth,
    module_money: adjMoney,
    module_wellbeing: adjWellbeing,
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
