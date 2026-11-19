import { useTimerEffects } from '../hooks/useTimerEffects'

/** Renders nothing: it exists so the per-second hooks live in a tiny component and not in a big one. */
export function TimerEffects() {
  useTimerEffects()
  return null
}
