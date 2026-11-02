import type { ComponentProps, ReactNode } from 'react'
import Screen from '../../shell/Screen.tsx'
import HdrBar from './HdrBar.tsx'
import TitleBlock from './TitleBlock.tsx'

type Props = Omit<ComponentProps<typeof Screen>, 'bar' | 'head'> & {
  title?: ReactNode
  sub?: ReactNode
  back?: () => void
  /** The bell counting money details that need a look. */
  bell?: boolean
}

/** An in-app screen: the pinned top bar, then the title and optional subtitle, which scroll with the page. */
export default function AppScreen({ title, sub, back, bell, ...screen }: Props) {
  return (
    <Screen
      {...screen}
      bar={<HdrBar back={back} bell={bell} />}
      head={
        title == null ? null : <TitleBlock title={title} sub={sub} titleStyle={{ marginTop: 10 }} />
      }
    />
  )
}
