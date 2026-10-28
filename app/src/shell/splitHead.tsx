import { Children, isValidElement, type ReactNode } from 'react'

const hasClass = (node: ReactNode, name: string) =>
  isValidElement<{ className?: string }>(node) &&
  (node.props.className ?? '').split(' ').includes(name)

const isLogoBar = (node: ReactNode) =>
  (hasClass(node, 'topbar') && hasClass(node, 'hdr')) || hasClass(node, 'pbrow')

const childrenOf = (node: ReactNode) =>
  isValidElement<{ children?: ReactNode }>(node) ? node.props.children : node

const isPinned = (node: ReactNode) => hasClass(node, 'topbar') || hasClass(node, 'pbrow')

/**
 * Page titles scroll with the page; only the logo bar (.topbar / .pbrow) stays pinned in the header.
 * `head` is a fragment or wrapper of header children, or a lone logo bar.
 * Returns [pinned header, the rest wrapped in .pghead for the top of the scroll area].
 */
export function splitHead(head: ReactNode): [ReactNode, ReactNode] {
  const children = isLogoBar(head) ? [head] : Children.toArray(childrenOf(head) ?? head)
  if (!children.some(isLogoBar)) return [head, null]

  const pinned = children.filter(isPinned)
  const rest = children.filter((child) => !isPinned(child))
  const pageHead = rest.length ? (
    <div className="pghead" key="pghead">
      {rest}
    </div>
  ) : null
  return [pinned, pageHead]
}
