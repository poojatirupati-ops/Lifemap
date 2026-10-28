import { expect, test } from 'vitest'
import { isIosSafari } from './isIosSafari.ts'

test('iOS hint only for Safari on iPhone, not installed', () => {
  const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari'
  expect(isIosSafari(safari, false)).toBe(true)
  expect(isIosSafari(safari, true)).toBe(false)
  expect(isIosSafari(safari + ' CriOS/120', false)).toBe(false)
  expect(isIosSafari('Mozilla/5.0 (Linux; Android 14) Chrome', false)).toBe(false)
})
