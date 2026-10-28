interface Props {
  age: number
  centre: number
  baseline: number
  retiring: boolean
  statePension: boolean
}

/** A ▼ above the year retirement starts and an SP tick under the year the State Pension starts. */
export default function YearMarks({ age, centre, baseline, retiring, statePension }: Props) {
  return (
    <>
      {retiring && (
        <path d={`M${(centre - 5).toFixed(1)} 2 h10 l-5 8 z`} fill="var(--ink)">
          <title>{`Retirement starts, age ${age}`}</title>
        </path>
      )}
      {statePension && (
        <>
          <line
            x1={centre.toFixed(1)}
            x2={centre.toFixed(1)}
            y1={baseline}
            y2={baseline + 5}
            stroke="var(--ink)"
            strokeWidth="1.6"
          />
          <text
            x={(centre - 2).toFixed(1)}
            y={baseline + 12}
            fontSize="8.5"
            fill="var(--ink)"
            fontWeight="700"
            textAnchor="end"
          >
            SP<title>{`State Pension starts, age ${age}`}</title>
          </text>
        </>
      )}
    </>
  )
}
