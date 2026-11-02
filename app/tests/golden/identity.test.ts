// Identity data and date-of-birth logic must match the ORIGINAL script, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal, TODAY } from './origSlice'
import { fixtures, plain } from './origProfile'
import {
  ADVISER_QUESTIONS,
  ADVISERS,
  EXPERTS,
  SUSTAINABLE_QUESTION,
} from '../../src/domain/identity/advisers.data'
import {
  DISCOVERY_DISCLAIMER,
  PERSONALITY_TYPES,
  REASONS,
} from '../../src/domain/identity/personality.data'
import { makeSlots } from '../../src/domain/identity/slots'
import { localToday } from '../../src/lib/today'
import * as dob from '../../src/domain/identity/dob'
import { fromOriginal, toOriginal } from '../../src/state/migrate'

const original = runOriginal(
  `TYPES, WHY, DISC_FORMAL, ADVISERS, EXPERT_FOR, EXPERT_BLURB, EXPERT_ICON, ESG_Q, ADV_QS, SLOTS,
  syncAges, dobValid, ageTodayOf, nextBirthday, dateLong, dobFilled, dobCheck`,
)
const mapValues = <T, R>(record: Record<string, T>, map: (value: T, key: string) => R) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, map(value, key)]))

describe('identity data equals the original', { timeout: 30_000 }, () => {
  it('advisers and experts', () => {
    expect(ADVISERS).toEqual(
      plain(original.ADVISERS).map((a: any) => ({
        name: a.n,
        initials: a.ini,
        qualifications: a.q,
        languages: a.lang,
        location: a.loc,
        meetingMode: a.mode,
      })),
    )
    expect(EXPERTS).toEqual(
      mapValues(original.EXPERT_FOR, (title: string, key) => ({
        title,
        blurb: original.EXPERT_BLURB[key],
        icon: original.EXPERT_ICON[key],
      })),
    )
    expect(SUSTAINABLE_QUESTION).toBe(original.ESG_Q)
    expect(ADVISER_QUESTIONS).toEqual(plain(original.ADV_QS))
  })

  it('personality types, reasons, disclaimer', () => {
    expect(PERSONALITY_TYPES).toEqual(
      mapValues(plain(original.TYPES), (t: any) => ({
        name: t.name,
        emoji: t.e,
        strapline: t.strap,
        strengths: t.str,
        watchOut: t.watch,
      })),
    )
    expect(REASONS).toEqual(
      plain(original.WHY).map(({ k, e, t, goals }: any) => ({ key: k, emoji: e, label: t, goals })),
    )
    expect(DISCOVERY_DISCLAIMER).toBe(original.DISC_FORMAL)
  })

  it('booking slots', () => expect(makeSlots(localToday(TODAY))).toEqual(plain(original.SLOTS)))
})

describe('date of birth', { timeout: 30_000 }, () => {
  const today = localToday(TODAY)
  const dates = [
    { d: '21', m: '8', y: '1989' },
    { d: '29', m: '2', y: '2000' },
    { d: '29', m: '2', y: '1996' },
    { d: '26', m: '10', y: '2008' },
    { d: '27', m: '10', y: '2008' },
    { d: '26', m: '10', y: '1946' },
    { d: '25', m: '10', y: '1946' },
    { d: '26', m: '10', y: '1940' },
    { d: '31', m: '4', y: '1990' },
    { d: '1', m: '1', y: '1899' },
    { d: '1', m: '1', y: '90' },
    { d: '', m: '1', y: '1990' },
    { d: '5', m: '5', y: '2030' },
    { d: 'x', m: '1', y: '1990' },
  ]

  it('checks, ages and dates equal the original', () => {
    for (const theirDate of dates) {
      const date = { day: theirDate.d, month: theirDate.m, year: theirDate.y }
      for (const who of ['you', 'partner'] as const) {
        for (const startYear of [2026, 2027]) {
          const name = who === 'you' ? 'Ann' : 'Bo'
          original.setState({
            acct: { name: 'Ann' },
            partner: { name: 'Bo' },
            asm: { startYear },
            about: {},
            fin: {},
            src: {},
          })
          expect(dob.checkDob(date, who, { today, name, startYear })).toEqual(
            plain(original.dobCheck(theirDate, who)),
          )
        }
      }
      expect(dob.isDobValid(date, today)).toBe(original.dobValid(theirDate))
      expect(dob.isDobComplete(date)).toBe(original.dobFilled(theirDate))
      if (!dob.isDobValid(date, today)) continue
      expect(dob.ageOn(date, today)).toBe(original.ageTodayOf(theirDate))
      expect(dob.nextBirthday(date, today).getTime()).toBe(
        original.nextBirthday(theirDate).getTime(),
      )
    }
  })

  const syncBoth = (state: any, startYear: number) => {
    const ours: any = fromOriginal(structuredClone(state))
    const theirs = structuredClone({ ...state, asm: { ...state.asm, startYear } })
    original.setState(theirs)
    original.syncAges()
    dob.agesFromDob(ours, { startYear, today })
    return [plain(toOriginal(ours)), plain(original.getState())]
  }

  it('syncAges equals the original on every fixture', () => {
    for (const [name, state] of fixtures) {
      for (const startYear of [2026, 2027]) {
        const [ours, theirs] = syncBoth(state, startYear)
        for (const part of ['about', 'fin', 'src']) expect(ours[part], name).toEqual(theirs[part])
      }
    }
  })

  it('syncAges keeps a dob when the age is blank, and keeps a typed age source', () => {
    const birth = { d: '21', m: '8', y: '1989' }
    const cases = [
      [{ dob: birth, _dobAge: 40, age: null }, {}],
      [{ dob: birth }, { age: 'typed' }],
      [{ dob: birth, _dobAge: 40, age: 41 }, {}],
      [
        { dob: { d: '1', m: '1', y: '2015' }, partner: true, pdob: { d: '31', m: '2', y: '1980' } },
        {},
      ],
      // no partner dob: a typed partner age stays
      [{ dob: birth, partner: true }, { pAge: 'typed' }, { pAge: 45 }],
    ]
    for (const [about, src, fin = {}] of cases) {
      const state = {
        acct: { name: 'Ann' },
        partner: {},
        asm: { startYear: 2027 },
        about,
        fin,
        src,
      }
      const [ours, theirs] = syncBoth(state, 2027)
      expect(ours, JSON.stringify(about)).toEqual(theirs)
    }
  })
})
