import type { TimerAction, TimerConfig, TimerState } from '../types'
import { breakAfterFocus, phaseDuration } from './phases'

export function createInitialTimer(config: TimerConfig): TimerState {
  return {
    phase: 'focus',
    status: 'idle',
    durationMs: config.focusMs,
    endsAt: null,
    remainingMs: config.focusMs,
    focusDone: 0,
    task: '',
  }
}

/** Time left right now. Computed from timestamps, never "decremented": see GUIDA, section 8. */
export function getRemainingMs(state: TimerState, now: number, config: TimerConfig): number {
  switch (state.status) {
    case 'running':
      return Math.max(0, (state.endsAt ?? now) - now)
    case 'paused':
      return state.remainingMs
    case 'idle':
      // Idle always follows the current settings, so editing a duration updates the display.
      return phaseDuration(state.phase, config)
  }
}

export function isDue(state: TimerState, now: number): boolean {
  return state.status === 'running' && state.endsAt !== null && now >= state.endsAt
}

// Pure state machine:
//   idle ──started──▶ running ──paused──▶ paused ──started──▶ running
//   running ──phase_completed──▶ idle (or running again with auto-start)
// Invalid transitions return the same state object, so React skips the re-render.
export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'started': {
      if (state.status === 'running') return state
      const durationMs = state.status === 'paused' ? state.durationMs : phaseDuration(state.phase, action.config)
      const remaining = state.status === 'paused' ? state.remainingMs : durationMs
      return { ...state, status: 'running', durationMs, endsAt: action.now + remaining }
    }

    case 'paused':
      if (state.status !== 'running' || state.endsAt === null) return state
      return { ...state, status: 'paused', remainingMs: Math.max(0, state.endsAt - action.now), endsAt: null }

    case 'reset':
      return { ...state, status: 'idle', endsAt: null }

    case 'phase_selected':
      return { ...state, phase: action.phase, status: 'idle', endsAt: null }

    case 'phase_completed': {
      // Guard: a second "completed" for the same phase (StrictMode, a late tick) must do nothing.
      if (!isDue(state, action.now)) return state
      const focusDone = state.phase === 'focus' ? state.focusDone + 1 : state.focusDone
      const phase = state.phase === 'focus' ? breakAfterFocus(focusDone, action.config.longBreakEvery) : 'focus'
      const durationMs = phaseDuration(phase, action.config)
      return action.config.autoStart
        ? { ...state, phase, focusDone, status: 'running', durationMs, endsAt: action.now + durationMs }
        : { ...state, phase, focusDone, status: 'idle', durationMs, endsAt: null }
    }

    case 'phase_skipped':
      // Skipping a focus session does not count it: no session saved, no progress towards the long break.
      return { ...state, phase: state.phase === 'focus' ? 'shortBreak' : 'focus', status: 'idle', endsAt: null }

    case 'task_changed':
      return { ...state, task: action.task }
  }
}
