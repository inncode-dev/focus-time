import type { Phase, TimerConfig } from '../types'

export const PHASES: { value: Phase; label: string }[] = [
  { value: 'focus', label: 'Focus' },
  { value: 'shortBreak', label: 'Short break' },
  { value: 'longBreak', label: 'Long break' },
]

export function phaseLabel(phase: Phase): string {
  return PHASES.find((p) => p.value === phase)!.label
}

export function phaseDuration(phase: Phase, config: TimerConfig): number {
  switch (phase) {
    case 'focus':
      return config.focusMs
    case 'shortBreak':
      return config.shortBreakMs
    case 'longBreak':
      return config.longBreakMs
  }
}

/** After a focus session: a long break every `longBreakEvery` completed sessions, a short one otherwise. */
export function breakAfterFocus(focusDone: number, longBreakEvery: number): Phase {
  return focusDone % longBreakEvery === 0 ? 'longBreak' : 'shortBreak'
}
