// The reveal's cushion and money terms must equal the ORIGINAL script's (cushionM, myTerms), run in node:vm.
import { describe, expect, it } from 'vitest'
import { cushion } from '../../src/domain/discovery/cushion'
import { moneyTerms } from '../../src/domain/discovery/moneyTerms'
import { runOriginal } from './origSlice'
import { cushion as asCushion, profileAnswers } from './profileAdapters'
import { fixtures, ourNormalized, originalNormalized, plain } from './origProfile'

const original = runOriginal('cushionM, myTerms')

// answers and figures that reach every branch: each Q7 option, no figures, thin, none and in-place cash
const variants = (state: any): any[] => [
  state,
  ...[0, 1, 2, 3].map((q7) => ({ ...state, ans: { ...state.ans, 7: q7 } })),
  { ...state, ans: { 2: 3, 12: 0 }, um: { ...state.um, a: { u4: 3, u11: 3 } } },
  ...[0, 500, 4000, 60000].map((cash) => ({
    ...state,
    src: { ...state.src, cash: 'typed', costsM: 'typed' },
    fin: { ...state.fin, cash, costsM: 2000 },
  })),
]

describe('reveal reads equal the original', () => {
  for (const [name, fixture] of fixtures) {
    it(name, () => {
      variants(fixture).forEach((variant, i) => {
        const theirs = originalNormalized(variant)
        original.setState(theirs)
        const ours = ourNormalized(structuredClone(variant))
        expect(plain(cushion(ours as any)), `${name} #${i}`).toEqual(
          plain(asCushion(original.cushionM())),
        )
        const terms = moneyTerms(profileAnswers(ours)).map(({ section, terms }) => ({
          k: section,
          tags: terms,
        }))
        expect(terms, `${name} #${i}`).toEqual(plain(original.myTerms()))
      })
    })
  }
})
