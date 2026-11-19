import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Phase, TimerConfig, TimerState } from '../types'
import { nowSecond } from '../lib/clock'
import { prepareSound } from '../lib/sound'
import { readStorage, writeStorage } from '../lib/storage'
import { isWithin } from '../lib/limits'
import { createInitialTimer, timerReducer } from '../lib/timerReducer'
import { useSettingsStore } from '../store/settingsStore'
import { TimerContext } from './timerContext'

const TIMER_KEY = 'inncode-focus:timer'

function isTimerState(value: unknown): value is TimerState {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    ['focus', 'shortBreak', 'longBreak'].includes(t.phase as string) &&
    ['idle', 'running', 'paused'].includes(t.status as string) &&
    typeof t.durationMs === 'number' &&
    typeof t.remainingMs === 'number' &&
    (t.endsAt === null || typeof t.endsAt === 'number') &&
    isWithin(t.focusDone, { min: 0, max: 1_000_000 }) &&
    typeof t.task === 'string'
  )
}

export function TimerProvider({ children }: { children: ReactNode }) {
  // Selectors on single primitive fields: the provider re-renders only if one of these changes.
  const focusMin = useSettingsStore((s) => s.focusMin)
  const shortBreakMin = useSettingsStore((s) => s.shortBreakMin)
  const longBreakMin = useSettingsStore((s) => s.longBreakMin)
  const longBreakEvery = useSettingsStore((s) => s.longBreakEvery)
  const autoStart = useSettingsStore((s) => s.autoStart)

  const config = useMemo<TimerConfig>(
    () => ({
      focusMs: focusMin * 60_000,
      shortBreakMs: shortBreakMin * 60_000,
      longBreakMs: longBreakMin * 60_000,
      longBreakEvery,
      autoStart,
    }),
    [focusMin, shortBreakMin, longBreakMin, longBreakEvery, autoStart],
  )

  // Lazy initialiser: read the saved timer once. A timer that was running when the page closed
  // keeps its `endsAt`, so it is still correct after the reload.
  const [state, dispatch] = useReducer(timerReducer, config, (initialConfig) =>
    readStorage(TIMER_KEY, createInitialTimer(initialConfig), isTimerState),
  )

  // The state changes only on user actions and phase changes (never per second), so this writes rarely.
  useEffect(() => {
    writeStorage(TIMER_KEY, state)
  }, [state])

  const value = useMemo(() => {
    const start = () => {
      prepareSound() // audio needs a user gesture: the Start click is the right moment
      dispatch({ type: 'started', now: nowSecond(), config })
    }
    const pause = () => dispatch({ type: 'paused', now: nowSecond() })
    return {
      state,
      config,
      start,
      pause,
      toggle: () => (state.status === 'running' ? pause() : start()),
      reset: () => dispatch({ type: 'reset' }),
      skip: () => dispatch({ type: 'phase_skipped' }),
      selectPhase: (phase: Phase) => dispatch({ type: 'phase_selected', phase }),
      setTask: (task: string) => dispatch({ type: 'task_changed', task }),
      completePhase: (now: number) => dispatch({ type: 'phase_completed', now, config }),
    }
  }, [state, config])

  return <TimerContext value={value}>{children}</TimerContext>
}
