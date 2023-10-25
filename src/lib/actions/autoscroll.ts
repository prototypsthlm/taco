import { shouldAutoscroll } from '$lib/stores/scroll'
import { get } from 'svelte/store'

let elem: HTMLElement

export const scrollToBottom = ({ force = false, ms = 400 } = {}) => {
  if (get(shouldAutoscroll) || force) {
    setTimeout(() => {
      elem?.scroll({ top: elem.scrollHeight, behavior: 'smooth' })
    }, ms)
  }
}

export const autoscroll = (node: HTMLElement): { destroy: () => void } => {
  let prevScrollHeight = node.scrollHeight

  elem = node
  const checkScroll = () => {
    const scrollBottom = node.scrollTop + node.clientHeight

    if (prevScrollHeight === node.scrollHeight) {
      if (scrollBottom > node.scrollHeight - 10) {
        shouldAutoscroll.set(true)
      } else {
        shouldAutoscroll.set(false)
      }
    }
    prevScrollHeight = node.scrollHeight
  }

  node.addEventListener('scroll', checkScroll)

  return {
    destroy() {
      node.removeEventListener('scroll', checkScroll)
    },
  }
}
