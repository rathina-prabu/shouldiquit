import type { Question } from "./types"

export const QUESTIONS: Question[] = [
  // Module 1: THE WORK (3 questions)
  {
    id: "q1", module: "work",
    prompt: "The nature of your work, usually:",
    choices: [
      { label: "A meaty mix. Real challenges, things to figure out.", highlight: "A meaty mix", scores: { work: 5 } },
      { label: "Mostly repetitive, occasional spike of something interesting.", highlight: "Mostly repetitive", scores: { work: 3 } },
      { label: "Directionless. You do work, no one's quite sure why.", highlight: "Directionless", scores: { work: 1, cynicism: 2 } },
      { label: "Pure execution of someone else's blueprint. No thinking.", highlight: "Pure execution", scores: { work: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q2", module: "work",
    prompt: "Skill development at this job:",
    choices: [
      { label: "Going wide, picking up new skills regularly.", highlight: "Going wide", scores: { work: 5, growth: 3 } },
      { label: "Going deep, sharpening a few skills into real expertise.", highlight: "Going deep", scores: { work: 5, growth: 3 } },
      { label: "Plateaued. No real skill movement in a while.", highlight: "Plateaued", scores: { work: 1, cynicism: 2 } },
      { label: "Going backwards, losing edges you had when you joined.", highlight: "Going backwards", scores: { work: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q3", module: "work",
    prompt: "Who actually notices the work you do?",
    choices: [
      { label: "Customers.", highlight: "Customers", scores: { work: 5 } },
      { label: "Leadership / the wider org.", highlight: "Leadership", scores: { work: 4 } },
      { label: "Just my manager.", highlight: "Just my manager", scores: { work: 2 } },
      { label: "Honestly, nobody.", highlight: "Honestly, nobody", scores: { work: 0, cynicism: 3 } },
    ],
  },
  // Module 2: THE MANAGER (4 questions)
  {
    id: "q4", module: "manager",
    prompt: "Manager takes a sick day. You...",
    choices: [
      { label: "Send them a \"feel better\" note. And mean it.", highlight: "\"feel better\" note", scores: { manager: 5 } },
      { label: "Carry on. They're fine, you're fine.", highlight: "Carry on", scores: { manager: 3 } },
      { label: "Quiet relief. The day just got easier.", highlight: "Quiet relief", scores: { manager: 1, cynicism: 2 } },
      { label: "Praying it's a broken leg. Both ideally.", highlight: "broken leg. Both ideally", scores: { manager: 0, cynicism: 3, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q5", module: "manager",
    prompt: "How does your manager treat off-hours?",
    choices: [
      { label: "Respects them. No pings after work hours.", highlight: "Respects them", scores: { manager: 5 } },
      { label: "Slacks at 10pm but writes \"no rush\" and means it.", highlight: "\"no rush\" and means it", scores: { manager: 4 } },
      { label: "Pings whenever. Expects replies fast.", highlight: "Pings whenever", scores: { manager: 1, intent_to_quit: 1 } },
      { label: "Phone calls. At 11pm. On a Sunday. About something that could've waited.", highlight: "11pm. On a Sunday", scores: { manager: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q6", module: "manager",
    prompt: "The feedback you get from them:",
    choices: [
      { label: "Sharp and specific. You leave 1:1s with something to do.", highlight: "Sharp and specific", scores: { manager: 5 } },
      { label: "\"Keep doing what you're doing.\" Said warmly. Useless.", highlight: "Useless", scores: { manager: 3 } },
      { label: "Silent when it works. Loud when something breaks.", highlight: "Loud when something breaks", scores: { manager: 1, cynicism: 2 } },
      { label: "\"Be more proactive.\" \"Create visibility.\" Same words, every year.", highlight: "Same words, every year", scores: { manager: 0, cynicism: 4 } },
    ],
  },
  {
    id: "q7", module: "manager",
    prompt: "When your work goes up to leadership, credit:",
    choices: [
      { label: "They name you. By name. Unprompted.", highlight: "By name. Unprompted", scores: { manager: 5 } },
      { label: "Mentioned when relevant. Fair share.", highlight: "Fair share", scores: { manager: 4 } },
      { label: "\"The team did great work.\" Your specific bit, invisible.", highlight: "Your specific bit, invisible", scores: { manager: 1, cynicism: 2 } },
      { label: "They take it. Personally. Like you weren't even in the room.", highlight: "They take it. Personally", scores: { manager: 0, cynicism: 4, intent_to_quit: 3 } },
    ],
  },
  // Module 3: THE PEOPLE (4 questions)
  {
    id: "q8", module: "people",
    prompt: "Friends at work:",
    choices: [
      { label: "Multiple. You'd still hang out with them even if you quit tomorrow.", highlight: "Multiple", scores: { people: 5 } },
      { label: "One real one. Your work-survival lifeline. Mostly at work though.", highlight: "One real one", scores: { people: 4 } },
      { label: "Friendly with everyone. Close to no one.", highlight: "Close to no one", scores: { people: 2 } },
      { label: "Pretty sure there's a team WhatsApp without you in it.", highlight: "WhatsApp without you", scores: { people: 0, cynicism: 3 } },
    ],
  },
  {
    id: "q9", module: "people",
    prompt: "Politics at work:",
    choices: [
      { label: "What politics? People mostly just work.", highlight: "What politics?", scores: { people: 5 } },
      { label: "Some politics. You know the landmines.", highlight: "Some politics", scores: { people: 3 } },
      { label: "Active warzone. Half your energy goes to surviving it.", highlight: "Active warzone", scores: { people: 1, intent_to_quit: 2 } },
      { label: "Every resignation story here starts with the politics.", highlight: "Every resignation story", scores: { people: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q10", module: "people",
    prompt: "Mentorship:",
    choices: [
      { label: "Someone senior is invested in your growth. They actually check in.", highlight: "actually check in", scores: { people: 5, growth: 3 } },
      { label: "A few people you can ping. Informal but real.", highlight: "Informal but real", scores: { people: 3, growth: 2 } },
      { label: "The senior who said \"reach out anytime\" has never replied.", highlight: "never replied", scores: { people: 1, growth: 1, cynicism: 2 } },
      { label: "Nobody here is worth learning from. ChatGPT is your mentor.", highlight: "ChatGPT is your mentor", scores: { people: 0, growth: 0, cynicism: 4, intent_to_quit: 2 } },
    ],
  },
  {
    id: "q11", module: "people",
    prompt: "When you think \"HR\" at your company:",
    choices: [
      { label: "Genuinely on your side. They've fought for you behind the scenes.", highlight: "Genuinely on your side", scores: { people: 4 } },
      { label: "Diwali emails. Engagement surveys. Background noise.", highlight: "Background noise", scores: { people: 3 } },
      { label: "\"Open door policy.\" Nobody home when you knock.", highlight: "Nobody home when you knock", scores: { people: 1, cynicism: 2 } },
      { label: "They take leadership's side. Every time.", highlight: "Every time", scores: { people: 0, cynicism: 3 } },
    ],
  },
  // Module 4: THE GROWTH (3 questions)
  {
    id: "q12", module: "growth",
    prompt: "Promotion conversation:",
    choices: [
      { label: "Clear criteria, clear timeline. You know what to hit.", highlight: "Clear criteria, clear timeline", scores: { growth: 5, agency: 2 } },
      { label: "Discussed broadly. No dates yet, but it's on the radar.", highlight: "No dates yet", scores: { growth: 3 } },
      { label: "\"You need more impact.\" Ask what impact means. Silence.", highlight: "Silence", scores: { growth: 1, cynicism: 3 } },
      { label: "The cycle closed without you. You found out from someone else's promo announcement.", highlight: "cycle closed without you", scores: { growth: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q13", module: "growth",
    prompt: "Voice in meetings:",
    choices: [
      { label: "People wait for your take. They act on it.", highlight: "wait for your take", scores: { growth: 5, agency: 2 } },
      { label: "Heard. Sometimes acted on. Mostly polite.", highlight: "Mostly polite", scores: { growth: 3 } },
      { label: "Polite nods. Then ignored. You've started noticing the pattern.", highlight: "Polite nods. Then ignored", scores: { growth: 1, cynicism: 2 } },
      { label: "Anything you say gets shot down. So you stopped speaking up.", highlight: "stopped speaking up", scores: { growth: 0, cynicism: 4, agency: -2 } },
    ],
  },
  {
    id: "q14", module: "growth",
    prompt: "Work-life balance:",
    choices: [
      { label: "Real. You log off and have a life.", highlight: "log off and have a life", scores: { growth: 5, wellbeing: 3 } },
      { label: "A few late evenings each week to finish things. Weekends stay yours.", highlight: "Weekends stay yours", scores: { growth: 3, wellbeing: 2 } },
      { label: "Work bleeds into evenings often. Weekends sometimes too.", highlight: "Work bleeds into evenings", scores: { growth: 1, wellbeing: 0, cynicism: 2 } },
      { label: "Laptop on every trip. On-call through weddings and weekend getaways.", highlight: "On-call through weddings", scores: { growth: 0, wellbeing: 0, cynicism: 3, intent_to_quit: 3 } },
    ],
  },
  // Module 5: THE MONEY (2 questions)
  {
    id: "q15", module: "money",
    prompt: "Last hike at appraisal:",
    choices: [
      { label: "Solid double-digit hike. Above inflation. Made you feel valued.", highlight: "double-digit hike", scores: { money: 5 } },
      { label: "Standard hike. Around market rate. Nothing to complain about.", highlight: "Standard hike", scores: { money: 4 } },
      { label: "Below inflation. You did the math. You're earning less in real terms.", highlight: "Below inflation", scores: { money: 1, cynicism: 2, intent_to_quit: 1 } },
      { label: "Zero hike. \"It's been a tough year for the company.\"", highlight: "Zero hike", scores: { money: 0, cynicism: 4, intent_to_quit: 4 } },
    ],
  },
  {
    id: "q16", module: "money",
    prompt: "Compared to peers at your level, your pay is:",
    choices: [
      { label: "Higher. You quietly know it.", highlight: "Higher", scores: { money: 5, agency: 2 } },
      { label: "About the same. The system feels fair enough.", highlight: "About the same", scores: { money: 4 } },
      { label: "Lower. Same work, same title. The gap stings.", highlight: "Lower", scores: { money: 1, intent_to_quit: 3, cynicism: 2 } },
      { label: "No clue. Nobody here talks pay. You've stopped guessing.", highlight: "stopped guessing", scores: { money: 0, cynicism: 4, agency: -2 } },
    ],
  },
  // Module 6: THE STATE OF YOU / wellbeing (2 questions)
  {
    id: "q17", module: "wellbeing",
    prompt: "Sunday evening, your body:",
    choices: [
      { label: "Looking forward. Tomorrow has something you actually want to do.", highlight: "Looking forward", scores: { wellbeing: 5 } },
      { label: "It's Monday. So what.", highlight: "So what", scores: { wellbeing: 3 } },
      { label: "Mood drops around 7 PM. The week starts arriving.", highlight: "Mood drops", scores: { wellbeing: 1, intent_to_quit: 2 } },
      { label: "Can't sleep. Tomorrow's meetings already running in your head.", highlight: "Can't sleep", scores: { wellbeing: 0, intent_to_quit: 3 } },
    ],
  },
  {
    id: "q18", module: "wellbeing",
    prompt: "Outside of your job:",
    choices: [
      { label: "There's a full \"you\": friends, hobbies, plans of your own.", highlight: "a full \"you\"", scores: { wellbeing: 5 } },
      { label: "Less than there used to be. But the \"you\" is still there.", highlight: "the \"you\" is still there", scores: { wellbeing: 3 } },
      { label: "Even when you're enjoying something, thoughts of work pop in. The mood crashes.", highlight: "thoughts of work pop in", scores: { wellbeing: 1, cynicism: 2 } },
      { label: "Mentally, you're still at the office. Always.", highlight: "still at the office", scores: { wellbeing: 0, intent_to_quit: 3, cynicism: 2 } },
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
