export type City = "Bangalore" | "Chennai" | "Hyderabad" | "Gurgaon" | "Mumbai"

export type Role =
  | "Senior Product Manager" | "Product Manager" | "Associate PM"
  | "Software Engineer" | "Senior Software Engineer" | "Engineering Manager" | "Tech Lead"
  | "Designer" | "Senior Designer"
  | "Data Scientist" | "Senior Data Scientist"
  | "DevOps Engineer" | "QA Engineer"
  | "Sales Lead" | "Marketing Manager" | "Growth Manager" | "Customer Success Manager"
  | "Finance Analyst" | "HR Business Partner" | "Operations Manager"

export type YoeBand = "0-3" | "4-7" | "8-12" | "13+"

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
}

export interface SalaryData {
  fixed_lakhs: number
  variable_lakhs: number
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
