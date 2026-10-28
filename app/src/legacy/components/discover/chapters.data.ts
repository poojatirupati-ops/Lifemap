// Chapter name per Discover question (spec sec 12, DSC table). The name sits in the eyebrow; no chapter-intro screens.
export const CHAPTERS = ['Your money mindset', 'How you decide', 'Your investment capacity', 'Your risk appetite', 'Your next chapter'] as const
export const CHAPTER_OF: Record<string, number> = { q2: 0, q4: 1, q7: 2, q8: 3, q9: 3, q12: 4 }
