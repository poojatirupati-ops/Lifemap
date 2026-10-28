// Report page 8: foundations and you.
import { RISK_LABELS } from '../../domain/discovery/profile.data.ts'
import type { ReportContext } from './context.ts'
import { foundations, nextFoundation, type Foundation } from './foundations.ts'
import { moneyProfile } from './profile.ts'

const LOOK = {
  ok: { tone: 'good', icon: 'sun', label: 'Solid' },
  held: { tone: 'good', icon: 'sun', label: 'In place' },
  mid: { tone: 'gold', icon: 'partly', label: 'In progress' },
  bad: { tone: 'coral', icon: 'storm', label: 'Needs attention' },
  na: { tone: 'grey', icon: 'partly', label: 'Not started' },
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/** "Solid · about €400 a month spare": a sentence's capital is lowered, an acronym's kept. */
const status = (level: Foundation) =>
  `${LOOK[level.state].label} · ${/^[A-Z][a-z]/.test(level.text) ? lowerFirst(level.text) : level.text}`

function nextBestStep(levels: Foundation[], buffer: number) {
  const next = nextFoundation(levels, buffer)
  if (!next) return 'All five foundations are solid. A yearly review keeps it on track.'
  const { level, title, detail } = next
  switch (level.level) {
    case 1:
      return `Spend less than you earn first. ${detail}`
    case 2:
      return `Build your emergency fund to ${buffer} months. ${level.state === 'na' ? 'Add your savings so we can check it.' : detail}`
    case 3:
      return `${title.replace('first', '').trim()}. ${detail}`
    case 4:
      return `Get your goals on track. ${detail}`
    default:
      return `Start growing your wealth when you’re ready. ${detail}`
  }
}

export function foundationsPage(context: ReportContext) {
  const { plan } = context
  const levels = foundations(context)
  const solid = levels.filter((level) => level.state === 'ok').length
  const { type, read, riskIndex, terms } = moneyProfile(plan)
  const protection = (label: string, key: string) => {
    const value = plan.fin[key]
    const given = !!plan.src[key] && value != null && value !== ''
    return { label, value: given ? value : 'Not given', good: given ? value === 'Yes' : null }
  }
  const watch = read.mismatch ?? (type ? `Something to watch: ${lowerFirst(type.watchOut)}` : '')
  return {
    big: `${solid} of 5`,
    bigLabel: 'foundations solid',
    bigTone: solid === 5 ? 'good' : solid === 0 ? 'coral' : 'gold',
    eyebrow: 'FOUNDATIONS AND YOU',
    title: 'Build from the bottom up',
    lead: 'Good planning is built from the bottom up.',
    levels: [...levels].reverse().map((level) => ({
      level: level.level,
      icon: LOOK[level.state].icon,
      title: level.name,
      status: status(level),
      tone: LOOK[level.state].tone,
    })),
    protection: {
      title: 'Protection',
      photo: 'car-and-calculator',
      rows: [
        protection('Life cover', 'life'),
        protection('Health insurance', 'health'),
        protection('Cover through work', 'workCover'),
        protection('Income protection', 'ip'),
        protection('Serious illness cover', 'ci'),
      ],
      nextBest: {
        label: 'NEXT BEST STEP',
        text: nextBestStep(levels, context.settings.bufferMonths),
      },
    },
    personality: {
      eyebrow: 'YOUR MONEY PERSONALITY',
      name: type ? `The ${type.name}` : 'Not worked out yet',
      icon: type?.name === 'Explorer' ? 'compass' : 'partly',
      strap: type ? type.strapline : 'Answer a few more questions to see your money personality.',
      quadrants: [
        { label: 'HOW YOU FEEL ABOUT MONEY', value: terms('mindset') || 'Not answered yet' },
        { label: 'HOW YOU TEND TO ACT', value: terms('behaviour') || 'Not answered yet' },
        {
          label: 'HOW MUCH RISK YOU WANT',
          value:
            riskIndex != null && read.willingness
              ? RISK_LABELS[read.willingness - 1] + (read.provisional ? ' (first read)' : '')
              : 'Not assessed yet',
        },
        {
          label: 'HOW MUCH YOU CAN AFFORD TO LOSE',
          value: terms('capacity') ? `${terms('capacity')} (your answer)` : 'Not answered yet',
        },
      ],
      riskScale: { title: 'Risk profile', labels: [...RISK_LABELS], activeIndex: riskIndex },
      note:
        (riskIndex == null ? 'Finish Understand me to add your indicative risk profile. ' : '') +
        watch,
    },
  }
}
