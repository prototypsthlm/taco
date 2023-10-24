import { shouldAutoscroll } from '$lib/stores/scroll'
import { get } from 'svelte/store'

let elem: HTMLElement

export const scrollToBottom = ({ force = false, ms = 700 } = {}) => {
  if (get(shouldAutoscroll) || force) {
    setTimeout(() => {
      elem?.scroll({ top: elem.scrollHeight, behavior: 'smooth' })
    }, ms)
  }
}

export const autoscroll = (node: HTMLElement): { destroy: () => void } | void => {
  elem = node
  const checkScroll = () => {
    shouldAutoscroll.set(node.clientHeight + node.scrollTop > node.scrollHeight - 10)
  }

  node.addEventListener('scroll', checkScroll)

  return {
    destroy() {
      node.removeEventListener('scroll', checkScroll)
    },
  }
}