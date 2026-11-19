import { useEffect, useRef } from 'react'
import { formatClock } from '../lib/format'
import { playChime } from '../lib/sound'
import { sendNotification } from '../lib/notify'
import { phaseLabel } from '../lib/phases'
import { getRemainingMs, isDue } from '../lib/timerReducer'
import { useSessionsStore } from '../store/sessionsStore'
import { useSettingsStore } from '../store/settingsStore'
import { useDocumentTitle } from './useDocumentTitle'
import { useHotkeys } from './useHotkeys'
import { useNow } from './useNow'
import { useTimer } from './useTimer'

/**
 * Everything the timer does "on the side": detect the end of a phase (and react to it),
 * keep the tab title in sync, wire the keyboard shortcuts. Called by one component, <TimerEffects/>.
 */
export function useTimerEffects(): void {
  const { state, config, toggle, reset, skip, completePhase } = useTimer()
  const now = useNow()
  const addSession = useSessionsStore((s) => s.addSession)
  const sound = useSettingsStore((s) => s.sound)
  const notifications = useSettingsStore((s) => s.notifications)

  // --- End of phase -------------------------------------------------------
  // Remembers which phase run (identified by its unique `endsAt`) was already handled.
  // Without it, StrictMode (which runs effects twice in development) would save the session
  // and play the chime twice.
  const handledEndsAt = useRef<number | null>(null)

  useEffect(() => {
    if (!isDue(state, now) || state.endsAt === null) return
    if (handledEndsAt.current === state.endsAt) return
    handledEndsAt.current = state.endsAt

    const wasFocus = state.phase === 'focus'
    if (wasFocus) {
      addSession({ task: state.task.trim(), minutes: Math.round(state.durationMs / 60_000), endedAt: state.endsAt })
    }
    if (sound) playChime()
    if (notifications) {
      sendNotification(
        wasFocus ? 'Focus session complete' : 'Break is over',
        wasFocus ? 'Time for a break.' : 'Ready for the next focus session?',
      )
    }
    completePhase(now)
  }, [now, state, sound, notifications, addSession, completePhase])

  // --- Tab title ----------------------------------------------------------
  const remaining = formatClock(getRemainingMs(state, now, config))
  useDocumentTitle(
    state.status === 'idle'
      ? 'Focus Timer · InnCode Lab'
      : `${state.status === 'paused' ? '⏸ ' : ''}${remaining} · ${phaseLabel(state.phase)}`,
  )

  // --- Keyboard -----------------------------------------------------------
  useHotkeys({ ' ': toggle, r: reset, s: skip })
}
