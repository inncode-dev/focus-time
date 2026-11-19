import { createContext } from 'react'
import type { Phase, TimerConfig, TimerState } from '../types'

export interface TimerContextValue {
  state: TimerState
  config: TimerConfig
  /** Start, or resume if paused. */
  start: () => void
  pause: () => void
  /** Space bar: start/resume when not running, pause otherwise. */
  toggle: () => void
  reset: () => void
  skip: () => void
  selectPhase: (phase: Phase) => void
  setTask: (task: string) => void
  /** Used by the phase watcher when the clock reaches `endsAt`. */
  completePhase: (now: number) => void
}

export const TimerContext = createContext<TimerContextValue | null>(null)
