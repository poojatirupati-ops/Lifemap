// Your home and "Do you have a mortgage?". Mutates (an immer draft); a statement figure for the
// home stays in use, so the answer may not take.
import type { FinanceBook } from './figures.ts'
import { typeFigure } from './figures.ts'
import { addItem } from './items.ts'

function forgetMortgageAnswer(book: FinanceBook) {
  delete book.figures.mortYN
  delete book.sources.mortYN
}

function setMortgageAnswer(book: FinanceBook, answer: 'Yes' | 'No') {
  book.figures.mortYN = answer
  book.sources.mortYN = 'typed'
}

/** Your home; owning it answers "Do you have a mortgage?". */
export function chooseHome(book: FinanceBook, home: string) {
  typeFigure(book, 'home', home)
  if (/^Own/.test(home)) forgetMortgageAnswer(book)
}

// Renting or living with family, Yes means a mortgage on another property, so one is added below.
function answerMortgageYes(book: FinanceBook) {
  const home = book.figures.home
  if (home === 'Own with mortgage') return
  if (!home || home === 'Own outright') return chooseHome(book, 'Own with mortgage')
  setMortgageAnswer(book, 'Yes')
  if (!book.lists.mort2?.length) {
    book.listsChanged = { ...book.listsChanged, mort2: true }
    addItem(book, 'mort2')
  }
}

function answerMortgageNo(book: FinanceBook) {
  const home = book.figures.home
  if (home === 'Own with mortgage') return chooseHome(book, 'Own outright')
  if (home === 'Own outright') forgetMortgageAnswer(book)
  else setMortgageAnswer(book, 'No')
}

/** "Do you have a mortgage?" */
export const answerMortgage = (book: FinanceBook, answer: 'Yes' | 'No') =>
  answer === 'Yes' ? answerMortgageYes(book) : answerMortgageNo(book)
