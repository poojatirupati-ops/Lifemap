// Life chapters: the plan's years by decade, each with its weather.
import { isShortYear, yearBand } from './bands'
import type { YearRow } from './project'

export interface Chapter {
  decade: number
  from: number
  to: number
  rows: YearRow[]
}

/** The plan years by decade; a lone year at 90 joins the 80s. */
export function byDecade(rows: YearRow[]) {
  const chapters: Chapter[] = []
  for (const row of rows) {
    const decade = Math.floor(row.age / 10) * 10
    const into = decade === 90 && chapters.length ? 80 : decade
    const last = chapters.at(-1)
    if (last?.decade === into) {
      last.to = row.age
      last.rows.push(row)
    } else {
      chapters.push({ decade: into, from: row.age, to: row.age, rows: [row] })
    }
  }
  return chapters
}

export type Weather = 'bad' | 'warn' | 'some' | 'ok'

function weatherKind(shortCount: number, dips: number, total: number): Weather {
  if (shortCount) return 'bad'
  if (dips > total / 3) return 'warn'
  if (dips) return 'some'
  return 'ok'
}

/** A chapter's weather: any short year is a storm; years using savings are clouds. */
export function weather(rows: YearRow[]) {
  const short = rows.filter(isShortYear)
  const dips = rows.filter((row) => yearBand(row) === 'nudge').length
  return {
    kind: weatherKind(short.length, dips, rows.length),
    shortYears: short.length,
    averageShort: short.length
      ? short.reduce((sum, row) => sum + row.shortfall, 0) / short.length
      : 0,
    retired: rows.every((row) => row.retired),
  }
}
