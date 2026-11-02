// The report's colours, and the fill, text and tint each tone uses.

export const COLOURS = {
  navy: '#0b2545',
  navy2: '#13315c',
  teal: '#0a7068',
  tealMid: '#0f9d8f',
  mint: '#6be3d3',
  gold: '#f2b134',
  goldText: '#7a5200',
  coral: '#e8674a',
  coralText: '#b23a1f',
  blue: '#4a90d9',
  blueText: '#1f5f9f',
  muted: '#51627a',
  line: '#dfe5ea',
  bg: '#f3f7f9',
  tealTint: '#d9f2ee',
  tealTint2: '#e4f4f2',
  goldTint: '#fdf0d2',
  coralTint: '#fbe4dd',
  blueTint: '#e3eefa',
  grey: '#8a97a6',
}

type Tone = 'good' | 'teal' | 'gold' | 'coral' | 'blue' | 'navy' | 'grey'

const TONES: Record<Tone, { fill: string; text: string; tint: string }> = {
  good: { fill: COLOURS.tealMid, text: COLOURS.teal, tint: COLOURS.tealTint },
  teal: { fill: COLOURS.teal, text: COLOURS.teal, tint: COLOURS.tealTint },
  gold: { fill: COLOURS.gold, text: COLOURS.goldText, tint: COLOURS.goldTint },
  coral: { fill: COLOURS.coral, text: COLOURS.coralText, tint: COLOURS.coralTint },
  blue: { fill: COLOURS.blue, text: COLOURS.blueText, tint: COLOURS.blueTint },
  navy: { fill: COLOURS.navy, text: COLOURS.navy, tint: COLOURS.bg },
  grey: { fill: COLOURS.grey, text: COLOURS.muted, tint: COLOURS.bg },
}

/** A tone name as the data gives it: 'alert' is coral, anything unknown is navy. */
const colours = (tone: string | undefined) =>
  TONES[(tone === 'alert' ? 'coral' : tone) as Tone] ?? TONES.navy

export const fillOf = (tone?: string) => colours(tone).fill
export const textOf = (tone?: string) => colours(tone).text
export const tintOf = (tone?: string) => colours(tone).tint
