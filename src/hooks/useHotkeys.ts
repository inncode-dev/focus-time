import { useEffect, useRef } from 'react'

type Handlers = Record<string, () => void>

const TYPING_TARGETS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A']

/**
 * Global keyboard shortcuts. Keys are lowercase `event.key` values, e.g. { ' ': toggle, r: reset }.
 * Ignored while the user types or when a control has focus (a focused button already reacts to Space).
 */
export function useHotkeys(handlers: Handlers): void {
  // The listener is attached once, but must always call the LATEST handlers.
  // A ref gives it a stable box whose content we refresh after every render.
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement
      if (TYPING_TARGETS.includes(target.tagName) || target.isContentEditable) return

      const handler = latest.current[event.key.toLowerCase()]
      if (!handler) return
      event.preventDefault() // stops Space from scrolling the page
      handler()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
