// Typing, statement reading and removing statements must leave the same figures as the ORIGINAL.
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import { plain } from './origProfile'
import {
  answerMortgage,
  removeStatementFigures,
  typeFigure,
  type FinanceBook,
} from '../../src/domain/finances/figures'
import { confirmUpload, type Upload } from '../../src/domain/finances/upload'
import { addItem, typeItemField } from '../../src/domain/finances/items'
import { syncTotals } from '../../src/domain/finances/syncTotals'
import { assumption } from '../../src/domain/planning/assumptions'
import { FINANCE_SECTIONS } from '../../src/domain/finances/sections.data'

const FIGURES = [
  'fin',
  'src',
  'conf',
  'look',
  'ack',
  'man',
  'fix',
  'docOf',
  'lists',
  'iid',
] as const

type Step = (original: any, ours: FinanceBook & Record<string, any>) => void

/** Runs the same steps through the original and through ours; the figures must match after each. */
function compare(steps: [name: string, step: Step][]) {
  const original = runOriginal(
    `fresh, setManual, setDoc, removeDoc, confirmUpload, setMortYN, syncLists, newItem, LI,
     setRender: (f) => { render = f }`,
  )
  original.setRender(() => {})
  original.setState(original.fresh())
  const ours = plain(original.getState()) as FinanceBook & Record<string, any>
  for (const [name, step] of steps) {
    step(original, ours)
    original.syncLists()
    syncTotals(ours as never, assumption(ours as never, 'ownShare'))
    const theirs = plain(original.getState())
    const pick = (state: any) => Object.fromEntries(FIGURES.map((key) => [key, state[key] ?? {}]))
    expect(pick(ours), name).toEqual(pick(theirs))
  }
}

const upload = (sec: string, edit: Record<string, number> = {}, item: Upload['item'] = null) =>
  ({ sec, stage: 'confirm', files: [], edit, item }) as Upload

const liabKeys = [
  ...FINANCE_SECTIONS.find(({ id }) => id === 'liab')!.fields,
  'cardRate',
  'loanRate',
]

describe('finance figures follow the original', () => {
  it('typed, then a smart upload with a correction, then the statement removed', () =>
    compare([
      [
        'typed',
        (o, s) => {
          for (const [key, value] of [
            ['income', 40000],
            ['cash', 5000],
            ['mortBal', 199000],
            ['work', 'Employed'],
          ] as const) {
            o.setManual(key, value, 'typed')
            typeFigure(s, key, value)
          }
        },
      ],
      [
        'smart upload',
        (o, s) => {
          o.getState().upl = upload('smart', { income: 61000 })
          o.confirmUpload()
          confirmUpload(s, upload('smart', { income: 61000 }))
        },
      ],
      [
        'typed over a statement',
        (o, s) => {
          o.setManual('cash', 7000, 'typed')
          typeFigure(s, 'cash', 7000)
        },
      ],
      [
        'liabilities statement removed',
        (o, s) => {
          o.removeDoc(liabKeys)
          removeStatementFigures(s, liabKeys)
        },
      ],
      [
        'pension statement removed',
        (o, s) => {
          o.removeDoc(['pension', 'pensionM', 'pensionOwnM'])
          removeStatementFigures(s, ['pension', 'pensionM', 'pensionOwnM'])
        },
      ],
    ]))

  it('one item statement read, corrected', () =>
    compare([
      [
        'card typed',
        (o, s) => {
          const item = o.newItem('cards')
          o.LI('cards').push(item)
          item.f.owed = 900
          item.src.owed = 'typed'
          typeItemField(addItem(s, 'cards'), 'owed', 900)
        },
      ],
      [
        'card statement',
        (o, s) => {
          const id = o.getState().iid
          o.getState().upl = upload('liab', { pay: 55 }, { lk: 'cards', id })
          o.confirmUpload()
          confirmUpload(s, upload('liab', { pay: 55 }, { lk: 'cards', id }))
        },
      ],
    ]))

  it('do you have a mortgage, for each home', () =>
    compare(
      [undefined, 'Own outright', 'Own with mortgage', 'Rent'].flatMap((home) =>
        (['Yes', 'No'] as const).map((answer): [string, Step] => [
          `${home} ${answer}`,
          (o, s) => {
            for (const book of [o.getState(), s]) {
              if (home) book.fin.home = home
              else delete book.fin.home
            }
            expect(answerMortgage(s, answer)).toBe(o.setMortYN(answer))
          },
        ]),
      ),
    ))
})
