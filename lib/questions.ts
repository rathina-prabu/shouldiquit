import type { Question } from "./types"

export const QUESTIONS: Question[] = [
  // Module 1: THE WORK (3 questions)
  {
    id: "q1", module: "work",
    prompt: "The nature of your work, most weeks:",
    choices: [
      { label: "A meaty mix — real challenges, things to figure out.", scores: { work: 5 } },
      { label: "Mostly repetitive, occasional spike of something interesting.", scores: { work: 3 } },
      { label: "Directionless — you do work, no one's quite sure why.", scores: { work: 1, cynicism: 2 } },
      { label: "Pure execution of someone else's blueprint. No thinking.", scores: { work: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q2", module: "work",
    prompt: "Skill development at this job:",
    choices: [
      { label: "Going wide — picking up new skills regularly.", scores: { work: 5, growth: 3 } },
      { label: "Going deep — sharpening a few skills into real expertise.", scores: { work: 5, growth: 3 } },
      { label: "Plateaued — no real skill movement in a while.", scores: { work: 1, cynicism: 2 } },
      { label: "Going backwards — losing edges you had when you joined.", scores: { work: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q3", module: "work",
    prompt: "Who actually notices the work you do?",
    choices: [
      { label: "Customers.", scores: { work: 5 } },
      { label: "Leadership / the wider org.", scores: { work: 4 } },
      { label: "Just my manager.", scores: { work: 2 } },
      { label: "Honestly, nobody.", scores: { work: 0, cynicism: 3 } },
    ],
  },
  // Module 2: THE MANAGER (4 questions)
  {
    id: "q4", module: "manager",
    prompt: "Manager takes a sick day. You...",
    choices: [
      { label: "Send them a \"feel better\" note. And mean it.", scores: { manager: 5 } },
      { label: "Carry on. They're fine, you're fine.", scores: { manager: 3 } },
      { label: "Quiet relief. The day just got easier.", scores: { manager: 1, cynicism: 2 } },
      { label: "Praying it's a broken leg. Both ideally.", scores: { manager: 0, cynicism: 3, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q5", module: "manager",
    prompt: "How does your manager treat off-hours?",
    choices: [
      { label: "Respects them. No pings after work hours.", scores: { manager: 5 } },
      { label: "Slacks at 10pm but writes \"no rush\" — and means it.", scores: { manager: 4 } },
      { label: "Pings whenever. Expects replies fast.", scores: { manager: 1, intent_to_quit: 1 } },
      { label: "Phone calls. At 11pm. On a Sunday. About something that could've waited.", scores: { manager: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q6", module: "manager",
    prompt: "The feedback you get from them:",
    choices: [
      { label: "Sharp and specific. You leave 1:1s with something to do.", scores: { manager: 5 } },
      { label: "\"Keep doing what you're doing.\" Said warmly. Useless.", scores: { manager: 3 } },
      { label: "Silent when it works. Loud when something breaks.", scores: { manager: 1, cynicism: 2 } },
      { label: "\"Be more proactive.\" \"Create visibility.\" Same words, every year.", scores: { manager: 0, cynicism: 4 } },
    ],
  },
  {
    id: "q7", module: "manager",
    prompt: "When your work goes up to leadership, credit:",
    choices: [
      { label: "They name you. By name. Unprompted.", scores: { manager: 5 } },
      { label: "Mentioned when relevant. Fair share.", scores: { manager: 4 } },
      { label: "\"The team did great work.\" Your specific bit, invisible.", scores: { manager: 1, cynicism: 2 } },
      { label: "They take it. Personally. Like you weren't even in the room.", scores: { manager: 0, cynicism: 4, intent_to_quit: 3 } },
    ],
  },
  // Module 3: THE PEOPLE (4 questions)
  {
    id: "q8", module: "people",
    prompt: "Friends at work:",
    choices: [
      { label: "Multiple. You'd still hang out with them even if you quit tomorrow.", scores: { people: 5 } },
      { label: "One real one. Your work-survival lifeline. Mostly at work though.", scores: { people: 4 } },
      { label: "Friendly with everyone. Close to no one.", scores: { people: 2 } },
      { label: "Pretty sure there's a team WhatsApp without you in it.", scores: { people: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q9", module: "people",
    prompt: "Politics at work:",
    choices: [
      { label: "What politics? People mostly just work.", scores: { people: 5 } },
      { label: "Some politics. You know the landmines.", scores: { people: 3 } },
      { label: "Active warzone. Half your energy goes to surviving it.", scores: { people: 1, intent_to_quit: 2 } },
      { label: "Every resignation story here starts with the politics.", scores: { people: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q10", module: "people",
    prompt: "Mentorship:",
    choices: [
      { label: "Someone senior is invested in your growth. They actually check in.", scores: { people: 5, growth: 3 } },
      { label: "A few people you can ping. Informal but real.", scores: { people: 3, growth: 2 } },
      { label: "The senior who said \"reach out anytime\" has never replied.", scores: { people: 1, growth: 1, cynicism: 2 } },
      { label: "Nobody here is worth learning from. ChatGPT is your mentor.", scores: { people: 0, growth: 0, cynicism: 4, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q11", module: "people",
    prompt: "When you think \"HR\" at your company:",
    choices: [
      { label: "Genuinely on your side. They've fought for you behind the scenes.", scores: { people: 4 } },
      { label: "Diwali emails. Engagement surveys. Background noise.", scores: { people: 3 } },
      { label: "\"Open door policy.\" Nobody home when you knock.", scores: { people: 1, cynicism: 2 } },
      { label: "They take leadership's side. Every time.", scores: { people: 0, cynicism: 3 } },
    ],
  },
  // Module 4: THE GROWTH (3 questions)
  {
    id: "q12", module: "growth",
    prompt: "Promotion conversation:",
    choices: [
      { label: "Clear criteria, clear timeline. You know what to hit.", scores: { growth: 5, agency: 2 } },
      { label: "Discussed broadly. No dates yet, but it's on the radar.", scores: { growth: 3 } },
      { label: "\"You need more impact.\" Ask what impact means. Silence.", scores: { growth: 1, cynicism: 3 } },
      { label: "The cycle closed without you. You found out from someone else's promo announcement.", scores: { growth: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q13", module: "growth",
    prompt: "Voice in meetings:",
    choices: [
      { label: "People wait for your take. They act on it.", scores: { growth: 5, agency: 2 } },
      { label: "Heard. Sometimes acted on. Mostly polite.", scores: { growth: 3 } },
      { label: "Polite nods. Then ignored. You've started noticing the pattern.", scores: { growth: 1, cynicism: 2 } },
      { label: "Anything you say gets shot down. So you stopped speaking up.", scores: { growth: 0, cynicism: 4, agency: -2 } },
    ],
  },
  {
    id: "q14", module: "growth",
    prompt: "Work-life balance:",
    choices: [
      { label: "Real. You log off and have a life.", scores: { growth: 5, wellbeing: 3 } },
      { label: "A few late evenings each week to finish things. Weekends stay yours.", scores: { growth: 3, wellbeing: 2 } },
      { label: "Work bleeds into evenings often. Weekends sometimes too.", scores: { growth: 1, wellbeing: 0, cynicism: 2 } },
      { label: "Laptop on every trip. On-call through weddings and weekend getaways.", scores: { growth: 0, wellbeing: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  // Module 5: THE MONEY (2 questions)
  {
    id: "q15", module: "money",
    prompt: "Last hike at appraisal:",
    choices: [
      { label: "Solid double-digit hike. Above inflation. Made you feel valued.", scores: { money: 5 } },
      { label: "Standard hike. Around market rate. Nothing to complain about.", scores: { money: 4 } },
      { label: "Below inflation. You did the math — you're earning less in real terms.", scores: { money: 1, cynicism: 2, intent_to_quit: 1 } },
      { label: "Zero hike. \"It's been a tough year for the company.\"", scores: { money: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q16", module: "money",
    prompt: "Compared to peers at your level, your pay is:",
    choices: [
      { label: "Higher. You quietly know it.", scores: { money: 5, agency: 2 } },
      { label: "About the same. The system feels fair enough.", scores: { money: 4 } },
      { label: "Lower. Same work, same title. The gap stings.", scores: { money: 1, intent_to_quit: 3, cynicism: 2 } },
      { label: "No clue. Nobody here talks pay. You've stopped guessing.", scores: { money: 0, cynicism: 4, agency: -2 } },
    ],
  },
  // Module 6: THE STATE OF YOU / wellbeing (2 questions)
  {
    id: "q17", module: "wellbeing",
    prompt: "Sunday evening, your body:",
    choices: [
      { label: "Looking forward. Tomorrow has something you actually want to do.", scores: { wellbeing: 5 } },
      { label: "It's Monday. So what.", scores: { wellbeing: 3 } },
      { label: "Mood drops around 7 PM. The week starts arriving.", scores: { wellbeing: 1, intent_to_quit: 2 } },
      { label: "Can't sleep. Tomorrow's meetings already running in your head.", scores: { wellbeing: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q18", module: "wellbeing",
    prompt: "Outside of your job:",
    choices: [
      { label: "There's a full \"you\" — friends, hobbies, plans of your own.", scores: { wellbeing: 5 } },
      { label: "Less than there used to be. But the \"you\" is still there.", scores: { wellbeing: 3 } },
      { label: "Even when you're enjoying something, thoughts of work pop in. The mood crashes.", scores: { wellbeing: 1, cynicism: 2 } },
      { label: "Mentally, you're still at the office. Always.", scores: { wellbeing: 0, intent_to_quit: 3, cynicism: 2 } },
    ],
  },
]

export const MODULE_LABELS: Record<string, string> = {
  work: "The Work",
  manager: "The Manager",
  people: "The People",
  growth: "The Growth",
  money: "The Money",
  wellbeing: "The State of You",
}
