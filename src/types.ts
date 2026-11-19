export type Theme = 'light' | 'dark'

/** A local calendar day as `YYYY-MM-DD`. */
export type IsoDate = string

export type Phase = 'focus' | 'shortBreak' | 'longBreak'
export type Status = 'idle' | 'running' | 'paused'

/** Everything the timer needs to know. Time is stored as absolute timestamps (ms since 1970). */
export interface TimerState {
  phase: Phase
  status: Status
  /** Length of the current phase, fixed when it starts. Meaningful when not idle. */
  durationMs: number
  /** When the phase ends. Only while `running`. */
  endsAt: number | null
  /** Time left. Only while `paused`. */
  remainingMs: number
  /** Focus sessions completed so far (decides when the long break comes). */
  focusDone: number
  /** What the user is working on, saved with the session. */
  task: string
}

/** Durations in milliseconds plus the cycle rules, derived from the settings. */
export interface TimerConfig {
  focusMs: number
  shortBreakMs: number
  longBreakMs: number
  longBreakEvery: number
  autoStart: boolean
}

/**
 * Discriminated union: `type` tells TypeScript which other fields exist.
 * `now` always comes from outside, which keeps the reducer a pure function.
 */
export type TimerAction =
  | { type: 'started'; now: number; config: TimerConfig }
  | { type: 'paused'; now: number }
  | { type: 'reset' }
  | { type: 'phase_selected'; phase: Phase }
  | { type: 'phase_completed'; now: number; config: TimerConfig }
  | { type: 'phase_skipped' }
  | { type: 'task_changed'; task: string }

export interface Settings {
  focusMin: number
  shortBreakMin: number
  longBreakMin: number
  longBreakEvery: number
  autoStart: boolean
  sound: boolean
  notifications: boolean
}

/** A completed focus session. */
export interface Session {
  id: string
  task: string
  minutes: number
  /** Timestamp when the session ended. */
  endedAt: number
  /** Local day it ended on, for grouping. */
  date: IsoDate
}

export interface DayTotal {
  date: IsoDate
  minutes: number
}

export interface Stats {
  todayMinutes: number
  todayCount: number
  totalMinutes: number
  last7Days: DayTotal[]
}
