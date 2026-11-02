import type { ComponentProps } from 'react'

/** One small line under a standard. */
export default function Line({ style, ...props }: ComponentProps<'span'>) {
  return <span className="small" style={{ display: 'block', ...style }} {...props} />
}
