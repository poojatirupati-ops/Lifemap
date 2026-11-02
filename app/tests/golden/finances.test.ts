// Finances data and example sentences must match the ORIGINAL script, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import { plain } from './origProfile'
import {
  SAMPLE_FINANCES,
  SAMPLE_OWN_SHARE,
  SAMPLE_RATES,
  SAMPLE_WORK_COVER_MULTIPLE,
} from '../../src/domain/finances/sample.data'
import { ITEM_DOCUMENTS } from '../../src/domain/finances/itemDocuments.data'
import {
  LIST_FIELDS,
  LIST_FOR_FIELD,
  LISTS,
  WORK_COVER_HINT,
} from '../../src/domain/finances/lists.data'
import { FINANCE_SECTIONS, SECTION_UPLOADS } from '../../src/domain/finances/sections.data'
import { fieldExamples } from '../../src/domain/finances/examples'

const original = runOriginal(
  `SAMPLE_FIN, SAMPLE_OWN_SHARE, SAMPLE_POL, SAMPLE_RATES, SAMPLE_MORT2, FFI, LDEF, LISTKEY, ITEMDOC,
  PROT_HINT, FSEC, UPL, EXAMPLES, RI, getYear0: () => YEAR0`,
)
const mapValues = <T, R>(record: Record<string, T>, map: (value: T) => R) =>
  Object.fromEntries(Object.entries(plain(record)).map(([key, value]) => [key, map(value as T)]))
// the original flags optional things with 1; ours with true
const flag = (value: unknown) => (value ? true : undefined)

describe('finances data equals the original', () => {
  it('sample customers', () => {
    expect(SAMPLE_FINANCES).toEqual(plain(original.SAMPLE_FIN))
    expect(SAMPLE_OWN_SHARE).toBe(original.SAMPLE_OWN_SHARE)
    expect(SAMPLE_RATES).toEqual(plain(original.SAMPLE_RATES))
    // the sample policies and other mortgage are the figures their documents fill in
    const filled = (list: keyof typeof ITEM_DOCUMENTS) =>
      Object.fromEntries(ITEM_DOCUMENTS[list].figures.map(([field, value]) => [field, value]))
    expect(plain(original.SAMPLE_POL)).toEqual({
      life: [filled('life')],
      workCover: [{ mult: SAMPLE_WORK_COVER_MULTIPLE }],
      health: [filled('health')],
    })
    expect(plain(original.SAMPLE_MORT2)).toEqual(filled('mort2'))
  })

  it('lists', () => {
    expect(LIST_FIELDS).toEqual(
      mapValues(original.FFI, (f: any) => ({
        label: f.l,
        type: f.type,
        optional: flag(f.opt),
        hint: f.hint,
      })),
    )
    expect(LISTS).toEqual(
      mapValues(original.LDEF, (l: any) => ({
        section: l.sec,
        emoji: l.em,
        title: l.t,
        isPolicy: flag(l.pol),
        singular: l.one,
        addLabel: l.add,
        fields: l.f,
        totals: l.tot,
        uploadLabel: l.up,
      })),
    )
    expect(LIST_FOR_FIELD).toEqual(plain(original.LISTKEY))
    expect(ITEM_DOCUMENTS).toEqual(
      mapValues(original.ITEMDOC, (d: any) => ({
        title: d.title,
        figures: d.f,
        texts: d.txt,
        staleNote: d.old,
      })),
    )
    expect(plain(original.PROT_HINT)).toEqual({ workCover: WORK_COVER_HINT })
  })

  it('sections and uploads', () => {
    expect(FINANCE_SECTIONS).toEqual(
      plain(original.FSEC).map((s: any) => ({
        id: s.id,
        title: s.t,
        emoji: s.e,
        documents: s.docs,
        fields: s.f,
      })),
    )
    expect(SECTION_UPLOADS).toEqual(
      mapValues(original.UPL, (u: any) => ({
        values: u.v,
        hidden: u.hid,
        documents: u.docs,
        staleNotes: u.old,
      })),
    )
  })

  it('examples: same keys, sentences, places and options', () => {
    const rules = original.RI
    const examples = fieldExamples({
      statePensionAge: rules.sp.age,
      fullPrsiYears: rules.sp.fullYears,
      planStartYear: original.getYear0(),
    })
    expect(Object.keys(examples)).toEqual(Object.keys(original.EXAMPLES))
    for (const [key, theirs] of Object.entries<any>(original.EXAMPLES)) {
      const options = typeof theirs.o === 'function' ? theirs.o() : theirs.o
      expect(examples[key], key).toEqual(plain({ text: theirs.t(), where: theirs.w, options }))
    }
  })
})
