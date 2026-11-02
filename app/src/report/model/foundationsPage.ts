// Report page 8: foundations and you.
import { RISK_LABELS } from '../../domain/discovery/profile.data.ts'
import { foundations } from '../../domain/planning/foundations.ts'
import { STATUS_LABEL, type Foundation } from '../../domain/planning/foundationCheck.ts'
import { nextFoundation } from '../../domain/plan/nextFoundation.ts'
import { hasFigure, type ReportContext } from './context.ts'
import { moneyProfile } from './profile.ts'

const LOOK = {
  ok: { tone: 'good', icon: 'sun' },
  held: { tone: 'good', icon: 'sun' },
  mid: { tone: 'gold', icon: 'partly' },
  bad: { tone: 'coral', icon: 'storm' },
  na: { tone: 'grey', icon: 'partly' },
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/** "Solid · about €400 a month spare": a sentence's capital is lowered, an acronym's kept. */
const status = (level: Foundation) =>
  `${STATUS_LABEL[level.status]} · ${/^[A-Z][a-z]/.test(level.text) ? lowerFirst(level.text) : level.text}`

function nextBestStep(levels: Foundation[], buffer: number) {
  const next = nextFoundation(levels, buffer)
  if (!next) return 'All five foundations are solid. A yearly review keeps it on track.'
  const { level, title, detail } = next
  switch (level.level) {
    case 1:
      return `Spend less than you earn first. ${detail}`
    case 2:
      return `Build your emergency fund to ${buffer} months. ${level.status === 'na' ? 'Add your savings so we can check it.' : detail}`
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
  const levels = foundations(plan, context.projection)
  const solid = levels.filter((level) => level.status === 'ok').length
  const { type, read, riskIndex, terms } = moneyProfile(plan)
  const protection = (label: string, key: string) => {
    const value = plan.figures[key]
    const given = hasFigure(plan, key)
    return { label, value: given ? value : 'Not given', good: given ? value === 'Yes' : null }
  }
  const watch = read.mismatch ?? (type ? `Something to watch: ${lowerFirst(type.watchOut)}` : '')
  return {
    big: `${solid} of 5`,
    bigTone: solid === 5 ? 'good' : solid === 0 ? 'coral' : 'gold',
    levels: [...levels].reverse().map((level) => ({
      level: level.level,
      icon: LOOK[level.status].icon,
      title: level.name,
      status: status(level),
      tone: LOOK[level.status].tone,
    })),
    protection: {
      rows: [
        protection('Life cover', 'life'),
        protection('Health insurance', 'health'),
        protection('Cover through work', 'workCover'),
        protection('Income protection', 'ip'),
        protection('Serious illness cover', 'ci'),
      ],
      nextBest: { text: nextBestStep(levels, context.settings.bufferMonths) },
    },
    personality: {
      name: type ? `The ${type.name}` : 'Not worked out yet',
      icon: type?.name === 'Explorer' ? 'compass' : 'partly',
      strap: type ? type.strapline : 'Answer a few more questions to see your money personality.',
      quadrants: [
        { value: terms('mindset') || 'Not answered yet' },
        { value: terms('behaviour') || 'Not answered yet' },
        {
          value:
            riskIndex != null && read.willingness
              ? RISK_LABELS[read.willingness - 1] + (read.provisional ? ' (first read)' : '')
              : 'Not assessed yet',
        },
        {
          value: terms('capacity') ? `${terms('capacity')} (your answer)` : 'Not answered yet',
        },
      ],
      riskScale: { activeIndex: riskIndex },
      note:
        (riskIndex == null ? 'Finish Understand me to add your indicative risk profile. ' : '') +
        watch,
    },
  }
}
