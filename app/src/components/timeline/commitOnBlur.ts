import type { FocusEvent } from 'react'

/** Save a typed figure when the field is left, only if it changed. */
export const commitOnBlur =
  (save: (typed: string) => void) =>
  ({ currentTarget: input }: FocusEvent<HTMLInputElement>) => {
    if (input.value !== input.defaultValue) save(input.value)
  }
