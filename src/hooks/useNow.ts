import { useSyncExternalStore } from 'react'
import { getClockSnapshot, subscribeClock } from '../lib/clock'

/**
 * The current time, truncated to the second, re-rendering the caller once per second.
 *
 * useSyncExternalStore is React's tool for reading something that lives OUTSIDE React
 * (here a module-level clock). It subscribes, re-renders on change and, unlike a
 * useState + useEffect pair, cannot show a stale value for one frame ("tearing").
 */
export function useNow(): number {
  return useSyncExternalStore(subscribeClock, getClockSnapshot)
}
