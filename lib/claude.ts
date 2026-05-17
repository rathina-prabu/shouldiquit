import Anthropic from "@anthropic-ai/sdk"
import type { ModuleName, VerdictTier, WorkType } from "./types"
import { WORK_TYPE_LABELS } from "./types"

interface DiagnoseInput {
  city: string
  role: string
  yoe: number
  work_type: WorkType | null
  tier: VerdictTier
  master: number
  modules: Record<ModuleName, number>
  weakest_module: ModuleName
  salary_vs_market: "below" | "near" | "above" | "unknown"
  intent_to_quit: number
  cynicism: number
  agency: number
  top_extreme_answers: string[]
}

export interface DiagnosisResult {
  diagnosis: string
  actions: string[]
}

const SYSTEM_PROMPT = `You are writing a brutally honest, lightly funny career diagnosis for someone who took an 18-question quiz called "Should I Quit".

Tone:
- Direct second-person ("you...")
- No narrator, no signature, no "we"
- Indian English. Conversational. Sharp. Observational. Punchy.
- Never use: "leverage", "synergy", "journey", "actionable", "ecosystem", "ownership", "stakeholder", "drive impact", "passionate"
- If they're below-market on salary AND in a leave-leaning tier, prioritize building runway over quitting today
- If they're above-market on salary, name the golden-cage trap directly
- If their work setup is "Fully in office" or "Hybrid (fixed days)" AND wellbeing/manager is weak, the mandated commute is likely a real factor — name it
- If their work setup is "Fully remote" AND people module is weak, isolation is likely a real factor — name it

Format your response as JSON only:
{
  "diagnosis": "<two short paragraphs, max 120 words total, separated by a single blank line>",
  "actions": ["<action 1>", "<action 2>", "<action 3>"]
}

Actions are specific, this-week things to try. Concrete. No corporate speak.`

export async function diagnose(input: DiagnoseInput): Promise<DiagnosisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("ANTHROPIC_API_KEY missing")
  }
  const client = new Anthropic({ apiKey })

  const workTypeLabel = input.work_type ? WORK_TYPE_LABELS[input.work_type] : "unknown"
  const userMessage = `User context:
- Role: ${input.role} in ${input.city}, ${input.yoe} YoE
- Work setup: ${workTypeLabel}
- Verdict: ${input.tier} (${input.master}/100)
- Module scores: work ${input.modules.work}, manager ${input.modules.manager}, people ${input.modules.people}, growth ${input.modules.growth}, money ${input.modules.money}, wellbeing ${input.modules.wellbeing}
- Weakest module: ${input.weakest_module}
- Salary vs market: ${input.salary_vs_market}
- Intent-to-quit accumulator: ${input.intent_to_quit} (higher = more "I'm done")
- Cynicism accumulator: ${input.cynicism}
- Agency accumulator: ${input.agency}
- Most extreme answers they picked:
${input.top_extreme_answers.map((a, i) => `  ${i + 1}. "${a}"`).join("\n")}

Write the diagnosis. JSON only.`

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const text = response.content[0]?.type === "text" ? response.content[0].text : "{}"
  const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim()
  const parsed = JSON.parse(cleaned) as DiagnosisResult
  if (!parsed.diagnosis || !Array.isArray(parsed.actions)) {
    throw new Error("LLM returned invalid shape")
  }
  return parsed
}

// ──────────────────────────────────────────────────────────────────────────
// Templated diagnoses — used as a fallback when the LLM call fails or the
// ANTHROPIC_API_KEY is missing. 6 modules × 5 tiers = 30 templates, all
// hand-written in the locked direct second-person voice.
// ──────────────────────────────────────────────────────────────────────────

type TemplateKey = `${ModuleName}_${VerdictTier}`

const TEMPLATES: Record<TemplateKey, DiagnosisResult> = {
  // ============== WORK ==============
  work_STAY_THRIVE: {
    diagnosis:
      "Your weakest area is the actual work — and it still scored well. Translation: nothing is broken. You like what you do, you're learning, people notice.\n\nDon't fall into the trap of 'making it more meaningful'. Sometimes the answer is to sit with the fact that you've got it good and let yourself say it out loud.",
    actions: [
      "Write down the one project this quarter you'd be sad to hand off. That's your signal.",
      "Ask your manager what the next stretch problem could look like — not for a promotion, just for a bigger swing.",
      "Take a Friday off in the next two weeks. Test that the work doesn't collapse without you.",
    ],
  },
  work_STAY_FIX: {
    diagnosis:
      "The work is mostly fine, but a quiet dullness has crept in. Maybe the problems repeat. Maybe nobody outside your manager actually sees what you ship.\n\nThis is fixable inside this job — but only if you make the ask. Sitting in the dullness for another quarter and hoping the next project changes things is not a strategy.",
    actions: [
      "Pick one project this quarter you'd genuinely want to lead. Tell your manager out loud.",
      "Find one customer or end-user and watch them use what you built. Recalibrate why it matters.",
      "Block 90 minutes a week to learn one new skill that isn't on your job description.",
    ],
  },
  work_ITS_COMPLICATED: {
    diagnosis:
      "The work isn't bad enough to quit over and isn't good enough to defend. It's the sort of job you describe to friends with a shrug.\n\nThe danger of this middle is that two more years pass before you notice. You don't need to leave — but you do need to decide if you're choosing this or just drifting in it.",
    actions: [
      "On paper, write the version of this role you'd actually want. Compare to today. Note the gap.",
      "Take one external coffee chat — old colleague, someone two steps ahead of you. Hear what their week looks like.",
      "Identify one piece of work in your next sprint where you can make a non-trivial decision yourself. Make it.",
    ],
  },
  work_START_LOOKING: {
    diagnosis:
      "Your work has gone hollow. Repetition, no audience, no skill movement. You're not failing — you're shrinking.\n\nThis is the slow-burn version of quitting. By the time you actually leave, you'll have lost six to twelve months of market edge. Start moving now, even if you're not ready to bolt.",
    actions: [
      "Update your CV this week. Even if you don't apply, you'll see where the gaps are.",
      "Pick one technical or domain skill the market is paying for. Spend 4 hours on it this weekend.",
      "Reach out to two people who left for jobs you'd want. Ask how they tell the story of their last 18 months.",
    ],
  },
  work_LEAVE_NOW: {
    diagnosis:
      "You're not working — you're processing tickets in human form. No autonomy, no audience, skills going stale. This is the kind of job that takes the edge off you faster than burnout.\n\nIf you stay another year, you'll have to rebuild what you've lost. The math here isn't subtle. Start the exit.",
    actions: [
      "Open LinkedIn today. Update the headline so a recruiter can find you.",
      "Apply to three roles this week. Not your dream job — just three real targets to break the inertia.",
      "Spend one hour writing what you actually want next. Not 'a better role'. The specifics.",
    ],
  },

  // ============== MANAGER ==============
  manager_STAY_THRIVE: {
    diagnosis:
      "Even your weakest area is healthy. Your manager isn't perfect — nobody is — but they respect you, give you real feedback, and don't burn your weekends.\n\nThat's rare and you should know it. The work to do here is small: keep the channel sharp, name what isn't working before it builds up.",
    actions: [
      "Bring one specific piece of friction to your next 1:1. Don't sit on it.",
      "Tell your manager something you've been holding back — appreciation or a small disagreement. Both go stale fast.",
      "Find out what your manager is being measured on this year. Make their life easier somewhere.",
    ],
  },
  manager_STAY_FIX: {
    diagnosis:
      "Your manager is the rough edge in an otherwise okay job. Not a villain — just frustrating in a specific, repeating way.\n\nMost people endure it and write Glassdoor reviews later. The braver move is one hard, calm conversation about what isn't working. The downside is awkwardness for a week. The upside is the next year.",
    actions: [
      "Draft the conversation. Not a complaint — a specific request. Two paragraphs max.",
      "Have it in your next 1:1. Don't postpone.",
      "Tell one trusted peer you're doing this, so you actually do it.",
    ],
  },
  manager_ITS_COMPLICATED: {
    diagnosis:
      "Your manager isn't openly hostile but they aren't fighting for you either. Vague feedback. Credit drifting upward without your name attached. You're managing them more than the reverse.\n\nThis is the kind of relationship that quietly costs you a promotion cycle. Don't wait twelve months to find out.",
    actions: [
      "Ask flatly in your next 1:1: 'What would I need to do to get promoted in the next cycle?' Write down whatever they say.",
      "Start sending your manager a weekly two-line summary of what shipped. Make your work visible without trying.",
      "Have one skip-level conversation in the next month. Not to complain — just to be known.",
    ],
  },
  manager_START_LOOKING: {
    diagnosis:
      "Your manager is actively dragging you down. The feedback is empty, the credit goes elsewhere, the boundary on your time is gone. This is the most common reason good people quit.\n\nFirst look for a transfer inside the company. If your skip-level is also part of the problem, accept that the exit is the company, not the team.",
    actions: [
      "Ask one internal mentor: 'If you were me, would you transfer or leave?' Listen.",
      "Take two recruiter calls in the next two weeks — not to switch, to calibrate what you're worth.",
      "Stop replying to non-urgent pings after 8 PM for two weeks. See what actually breaks.",
    ],
  },
  manager_LEAVE_NOW: {
    diagnosis:
      "The data is clear: your manager is the fire. Everything else is downstream. The 11 PM phone calls, the credit-stealing, the recycled feedback — this is the pattern, not the exception.\n\nSwitching companies will help. But also: if you don't break your own pattern of absorbing this, the next manager will look uncannily like this one.",
    actions: [
      "Open LinkedIn. Update the headline so recruiters can find you. Two minutes.",
      "Take two recruiter calls this week. The market will tell you what you're worth.",
      "Write the resignation draft. You don't have to send it. You'll feel lighter just having it ready.",
    ],
  },

  // ============== PEOPLE ==============
  people_STAY_THRIVE: {
    diagnosis:
      "Even your weakest module came back fine. You've got real friends here. The politics is light. The team works for you.\n\nDon't take this for granted — most jobs aren't like this. Invest in the relationships actively while you have them, because the day you leave, this is what you'll miss first.",
    actions: [
      "Book one non-work lunch this week with the person at work you'd hang out with even if you quit.",
      "Send one specific thank-you to someone who made your job easier this month. Be embarrassingly specific.",
      "Spend one 1:1 this month listening to a junior. The team gets stronger when you do.",
    ],
  },
  people_STAY_FIX: {
    diagnosis:
      "The team is mostly fine, but there's one annoying corner you keep stepping on. Maybe a specific person. Maybe HR is invisible. Probably both, intermittently.\n\nThis won't fix itself, but it's not a quit signal. Name the specific friction and route around it deliberately.",
    actions: [
      "Identify the one person at work who consistently costs you energy. Decide one boundary you can hold with them.",
      "Have lunch this week with someone you don't normally talk to. The team is larger than your immediate orbit.",
      "Stop pretending to like the office Slack channels you actively dislike. Mute. Move on.",
    ],
  },
  people_ITS_COMPLICATED: {
    diagnosis:
      "You're not actively isolated, but you're not embedded either. The politics costs you energy. HR is theatre. Mentorship is a search you keep losing.\n\nThis middle ground is exhausting because the cost is invisible — until you realize you've been spending half your week just navigating people.",
    actions: [
      "Map the politics on paper. Who's in which camp. Who you can trust. This sounds tactical because it is.",
      "Find one person outside your function to have a monthly coffee with. Build a non-political ally.",
      "Pick one senior person in the industry (not your company) to follow seriously this quarter. Comment, reach out, learn from a distance.",
    ],
  },
  people_START_LOOKING: {
    diagnosis:
      "You're surviving the people here, not working with them. The politics is loud, the mentorship is missing, and the team is something you brace for, not lean into.\n\nIf the work is still meaningful, look first for a different team inside the company. If even one full transfer wouldn't fix it, the company is the problem.",
    actions: [
      "Have one honest conversation with someone who's been here longer than you. Ask if it gets better or if you're a frog in slow water.",
      "Identify two functions inside the company where you could pivot. Take one coffee in each.",
      "Take one external coffee with someone who left this place. Listen for what they say about the year before they quit.",
    ],
  },
  people_LEAVE_NOW: {
    diagnosis:
      "This is a toxic environment by the numbers — politics dominant, no allies, HR on the wrong side. You can't out-work a culture like this. You can only outlast it or leave.\n\nMost people in your seat keep telling themselves 'one more year' for three years. Don't.",
    actions: [
      "Tell one person outside work how bad it actually is. Out-loud. Then re-hear yourself.",
      "Update LinkedIn today. Add one ex-colleague from a healthier place to your message list.",
      "Take one recruiter call this week. The market doesn't know what you've been swimming in.",
    ],
  },

  // ============== GROWTH ==============
  growth_STAY_THRIVE: {
    diagnosis:
      "Even your weakest area is growth — and growth is solid. Promotion path is visible, your voice in meetings counts, work-life balance is real.\n\nThe risk at the top is complacency. Use this window to make a stretch ask — not because you have to, but because the leverage is rare.",
    actions: [
      "Name one stretch problem you'd want to own in the next two quarters. Bring it to your manager.",
      "Pick one skill adjacent to your current role to start sharpening. The trajectory needs a target.",
      "Take a real holiday this quarter. Confirm you can actually log off — that's a stronger signal than any review.",
    ],
  },
  growth_STAY_FIX: {
    diagnosis:
      "Growth has plateaued slightly. Promotion conversation is hand-wavy. You're heard but rarely acted on. WLB is fine, mostly.\n\nThe job isn't broken but the trajectory is bending the wrong way. One direct conversation, one concrete plan, and you can probably re-engage with this place.",
    actions: [
      "Ask your manager: 'What are the two things that would make me undeniably promotable in 12 months?' Write down the answer.",
      "Pick one meeting per week where you'll come in with a clear take, not a question. Practice the muscle.",
      "Block two hours each week for learning outside the immediate task list. Make it a calendar event.",
    ],
  },
  growth_ITS_COMPLICATED: {
    diagnosis:
      "Promotion is vague. Your voice gets polite nods that disappear by the next meeting. The boundary on your time is leaking.\n\nThis is the classic 'still alive but flatlined' pattern. The job isn't bad on any single axis, but the slope is wrong. Either flip it in the next quarter or accept that staying is a choice with a cost.",
    actions: [
      "Write down the last three times your idea was ignored. Look for the pattern. Decide what to do about it.",
      "Have one skip-level conversation in the next two weeks. Be known by someone outside your manager's filter.",
      "Stop working after 7 PM for two weeks. See what changes — for the work, and for you.",
    ],
  },
  growth_START_LOOKING: {
    diagnosis:
      "Growth has stalled in every direction. Promotion ghosted you. You've stopped speaking up because nothing comes back. Work has spilled into evenings and weekends.\n\nThis is the version of staying that costs the most. Every month here is one less month elsewhere. You don't have to bolt this week, but you should start moving.",
    actions: [
      "Update your CV. Even if you don't send it anywhere, you'll see what the last year looked like from the outside.",
      "Have two external coffees this month. Not interviews — calibrations.",
      "Pick a specific 'last day' in your head, 90 days out. You can change it. But pick one.",
    ],
  },
  growth_LEAVE_NOW: {
    diagnosis:
      "Your career is flatlining inside this job. The promo cycle closed without you. Your voice is gone in meetings — because you stopped trying. Laptop on every trip.\n\nStaying here for another year will cost you market value you can't easily rebuild. The fix is not inside this company.",
    actions: [
      "Open LinkedIn. Set status to 'open to opportunities' (private if you must).",
      "Apply to three real roles this week. Not aspirational — viable.",
      "Take next weekend fully off the laptop. Re-meet the version of you outside the job.",
    ],
  },

  // ============== MONEY ==============
  money_STAY_THRIVE: {
    diagnosis:
      "Your money score is in good shape — but it's still your relative weak point in an otherwise strong job. Either you're paid at market and that's fine, or you're paid above and the rest of the job is so good it's not the centre of gravity.\n\nThe pattern to watch: golden handcuffs. The pay is the reason you stay long after the rest stops working.",
    actions: [
      "Do the math on your true hourly rate this quarter. Update it once a year.",
      "Pick one expense to redirect into a 'optionality fund' — six months of runway is the goal.",
      "Don't refuse a recruiter call just because the pay is good here. Calibrate annually.",
    ],
  },
  money_STAY_FIX: {
    diagnosis:
      "Pay is okay-ish — not the reason you'd leave, but a quiet thorn. Maybe last year's hike was slim. Maybe peer comparison made you wince.\n\nThis is fixable with one direct conversation, ideally backed by a market data point or two. Don't bring feelings — bring numbers.",
    actions: [
      "Get one real market datapoint this week — Levels.fyi, AmbitionBox, or a friend at a comparable company.",
      "Book a comp conversation with your manager. Bring the number. Ask what would close the gap.",
      "Quietly take one recruiter call. Even a 'no thanks' tells you what the market thinks of you.",
    ],
  },
  money_ITS_COMPLICATED: {
    diagnosis:
      "Money is dragging. Below market or stagnant or both, but not yet a five-alarm fire. Other things at work are working enough that you've made peace with it.\n\nThe risk is that peace turns into resignation. The fix this year is either a real comp conversation here or two interviews elsewhere — your choice.",
    actions: [
      "Pull a real benchmark for your role + city + YoE. Write it down. Compare. Decide.",
      "Set a comp ask number for your next appraisal. Practice saying it out loud.",
      "Have one 30-minute external coffee this month. Make sure you still know your market value.",
    ],
  },
  money_START_LOOKING: {
    diagnosis:
      "You're underpaid for the work you do and you know it. Zero hike or below-inflation hike. A junior's offer letter put a number on it.\n\nThis is the part where staying gets expensive. Every year here is a year of compounded gap. Use the next 60 days to build optionality — even if you don't switch right away.",
    actions: [
      "Apply to three roles in your salary band this week. The replies will tell you the truth.",
      "If you have less than three months of runway, that's the first thing to fix. Cut one fixed cost this month.",
      "Set a hard internal deadline — 90 days from now — to make a comp ask or leave.",
    ],
  },
  money_LEAVE_NOW: {
    diagnosis:
      "You're severely underpaid and the hike pattern says nothing is changing. A market move will almost certainly get you a 25–40% jump.\n\nBefore you bolt, build three months of runway. Quitting from a place of urgency is how people accept the first sub-par offer.",
    actions: [
      "This month: build three months of expenses in a buffer. Don't quit before this exists.",
      "Apply to five roles this week. The market is the only honest mirror for what you're worth.",
      "Practice your number out loud. The first offer rarely closes — only the second does.",
    ],
  },

  // ============== WELLBEING ==============
  wellbeing_STAY_THRIVE: {
    diagnosis:
      "Your weakest area is your wellbeing — and even that is in good shape. You log off, you have a life, Sunday evenings don't ruin you.\n\nThis is rare. Protect it. The thing that erodes wellbeing isn't usually a single disaster — it's a quiet drift of more meetings, later evenings, slower weekends.",
    actions: [
      "Look at your calendar for the next two weeks. Decline one meeting that doesn't need you.",
      "Hold a hard 'laptop closed by X PM' on three weekdays. Test it.",
      "Plan one weekend in the next month that's fully off the laptop. Calendar it now.",
    ],
  },
  wellbeing_STAY_FIX: {
    diagnosis:
      "Sundays are starting to dim. You're not in burnout territory but the early signal is there — mood dips, the 'one more email' creep, the hobby you keep meaning to restart.\n\nThis is the easiest stage to course-correct. The hardest is the one after.",
    actions: [
      "Restart the one hobby you've put down. Today. Even ten minutes of it.",
      "Set one non-negotiable evening per week that's fully yours. Defend it.",
      "Notice your Sunday-evening body. If it's tight three weeks in a row, that's data — listen.",
    ],
  },
  wellbeing_ITS_COMPLICATED: {
    diagnosis:
      "Mood crashes, hobbies fading, the laptop following you on weekends. You're not at the wall yet but you're walking toward it. Most people in this band keep walking until they hit it.\n\nThe job might not be the only cause. But the job is making it worse, and the job is the thing you can change.",
    actions: [
      "Get one full weekend off the laptop in the next two weeks. Not 'mostly off'. Off.",
      "Tell one person — partner, friend, sibling — how heavy it's been. Specifically.",
      "Stop replying to work pings after 8 PM for two weeks. See what actually breaks.",
    ],
  },
  wellbeing_START_LOOKING: {
    diagnosis:
      "Sundays are heavy. Hobbies are gone. Even on holiday, work intrudes. This is the front edge of burnout, not a 'busy month'.\n\nBurnout doesn't fix itself with a long weekend. The thing creating it has to change. Usually that's the job, sometimes it's the boundary you hold inside the job.",
    actions: [
      "Block one full 4-day weekend in the next 30 days. No email, no slack, no laptop. Test what happens.",
      "Have one honest conversation with someone who has burned out before. Listen for the signs you're already showing.",
      "Set one specific quit-by date in your head. You can move it. But name it.",
    ],
  },
  wellbeing_LEAVE_NOW: {
    diagnosis:
      "You're in burnout. Can't sleep, no 'you' outside the office, even your weekends are colonized. This isn't a phase. This is the body sending the signal the spreadsheet won't.\n\nThe job will not reward you for waiting this out. Get yourself somewhere stable — even if 'stable' means a worse job, briefly.",
    actions: [
      "Take three days off this week. Citing 'mental health'. Don't apologize.",
      "Call iCall (9152987821) or Vandrevala (1860-2662-345) this week if you haven't talked to anyone yet. Free, confidential.",
      "Don't make any big decisions for two weeks. Recover first. Decide second.",
    ],
  },
}

const FALLBACK: DiagnosisResult = {
  diagnosis:
    "Your score puts you in a meaningful middle band. The weakest area in your job right now is the one to focus on — and changing companies won't automatically fix it.\n\nStart with one specific thing that's broken, test one fix this week, and re-check this quiz in 90 days.",
  actions: [
    "Identify the one thing most broken at work right now.",
    "Test one fix this week. Don't redesign your career on a Sunday.",
    "Re-check this quiz in 90 days. See if the score moved.",
  ],
}

export function templatedDiagnosis(
  weakest: ModuleName,
  tier: VerdictTier,
): DiagnosisResult {
  const key = `${weakest}_${tier}` as TemplateKey
  return TEMPLATES[key] ?? FALLBACK
}
