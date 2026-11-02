import type { CSSProperties, ReactNode } from 'react'

interface Props {
  title: ReactNode
  sub?: ReactNode
  titleStyle?: CSSProperties
}

/** A screen's h2 title and optional subtitle. */
export default function TitleBlock({ title, sub, titleStyle }: Props) {
  return (
    <>
      <h2 className="t" tabIndex={-1} style={titleStyle}>
        {title}
      </h2>
      {sub ? (
        <p className="sub" style={{ margin: 0 }}>
          {sub}
        </p>
      ) : null}
    </>
  )
}
