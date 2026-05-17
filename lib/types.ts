export type City = "Bangalore" | "Chennai" | "Hyderabad" | "Gurgaon" | "Mumbai" | "Others"

export type Role =
  | "Engineer (IC)"
  | "Engineering Manager"
  | "DevOps / SRE"
  | "QA"
  | "Data Scientist"
  | "Product Manager"
  | "Project / Program Manager"
  | "Designer"
  | "Sales"
  | "Marketing / Growth"
  | "Customer Success"
  | "Business Ops"

export type YoeBand = "0-3" | "4-7" | "8-12" | "13+"

export type WorkType = "remote" | "hybrid_fixed" | "hybrid_flex" | "office"

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  remote: "Fully remote",
  hybrid_fixed: "Hybrid (fixed days)",
  hybrid_flex: "Hybrid (flexible)",
  office: "Fully in office",
}

export type ModuleName = "work" | "manager" | "people" | "growth" | "money" | "wellbeing"

export type AccumulatorName = "intent_to_quit" | "cynicism" | "agency"

export type Dimension = ModuleName | AccumulatorName

export type VerdictTier =
  | "STAY_THRIVE"
  | "STAY_FIX"
  | "ITS_COMPLICATED"
  | "START_LOOKING"
  | "LEAVE_NOW"

export interface Choice {
  label: string
  /** Substring of `label` to render in accent color (the punchline / lead phrase). */
  highlight?: string
  scores: Partial<Record<Dimension, number>>
}

export interface Question {
  id: string
  module: ModuleName
  prompt: string
  choices: [Choice, Choice, Choice, Choice]
}

export interface SetupData {
  city: City
  role: Role
  yoe: number
  work_type: WorkType
}

export interface SalaryData {
  fixed_lakhs: number | null
  variable_lakhs: number | null
  skipped?: boolean
}

export interface Answer {
  question_id: string
  choice_index: 0 | 1 | 2 | 3
}

export interface Scores {
  modules: Record<ModuleName, number>
  master: number
  tier: VerdictTier
  weakest_module: ModuleName
  intent_to_quit: number
  cynicism: number
  agency: number
}
