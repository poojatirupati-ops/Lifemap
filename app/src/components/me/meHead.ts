import type { ComponentProps } from 'react'
import { useStore } from '../../state/store.ts'
import AppHead from '../frame/AppHead.tsx'
import { unseenLooks } from '../home/useHome.ts'

/** A Me page's head: AppHead with the bell counting money details that need a look. Hook-free. */
export const meHead = (props: Omit<ComponentProps<typeof AppHead>, 'needsLook'>) =>
  AppHead({ ...props, needsLook: unseenLooks(useStore.getState().plan) })
