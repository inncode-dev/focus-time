// A tiny external store: ONE interval for the whole app, running only while
// somebody is subscribed. React reads it with useSyncExternalStore (see hooks/useNow.ts).
//
// Time is truncated to whole seconds. Every timestamp in the timer is a multiple of 1000 ms,
// so "25:00" really is 1,500,000 ms and the display never shows a stray "25:01".

export function nowSecond(): number {
  return Math.floor(Date.now() / 1000) * 1000
}

const listeners = new Set<() => void>()
let current = nowSecond()
let intervalId: number | undefined

function tick() {
  const next = nowSecond()
  if (next === current) return // same second: nobody needs to re-render
  current = next
  listeners.forEach((listener) => listener())
}

export function subscribeClock(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    current = nowSecond()
    // 250 ms: fine enough to catch the new second quickly, still negligible work.
    intervalId = window.setInterval(tick, 250)
    // Background tabs throttle timers: re-check the moment the user comes back.
    document.addEventListener('visibilitychange', tick)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', tick)
    }
  }
}

export function getClockSnapshot(): number {
  return current
}
