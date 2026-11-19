import { useState } from 'react'
import { todayISO } from '../lib/dates'
import { formatTime } from '../lib/format'
import { useSessionsStore } from '../store/sessionsStore'
import { Button } from './Button'

export function HistoryList() {
  const sessions = useSessionsStore((s) => s.sessions)
  const deleteSession = useSessionsStore((s) => s.deleteSession)
  const clearSessions = useSessionsStore((s) => s.clearSessions)
  const [confirmingClear, setConfirmingClear] = useState(false)

  const today = todayISO()
  const todays = sessions.filter((s) => s.date === today).sort((a, b) => b.endedAt - a.endedAt)

  return (
    <section
      aria-labelledby="history-title"
      className="rounded-lg border border-line bg-surface p-4 dark:border-night-line dark:bg-night-surface"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 id="history-title" className="font-display text-lg font-extrabold uppercase">
          Today
        </h2>
        {confirmingClear ? (
          <div role="group" aria-label="Confirm clearing the history" className="flex items-center gap-2">
            <span role="alert" className="font-mono text-xs text-muted dark:text-night-muted">
              Delete all {sessions.length} sessions?
            </span>
            <Button
              variant="danger"
              onClick={() => {
                clearSessions()
                setConfirmingClear(false)
              }}
            >
              Delete all
            </Button>
            <Button onClick={() => setConfirmingClear(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmingClear(true)} disabled={sessions.length === 0}>
            Clear history
          </Button>
        )}
      </div>

      {todays.length === 0 ? (
        <p role="status" className="py-6 text-center text-sm text-muted dark:text-night-muted">
          No focus sessions yet today. Press Start.
        </p>
      ) : (
        <ul className="divide-y divide-line dark:divide-night-line">
          {todays.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{session.task || 'Untitled session'}</p>
                <p className="font-mono text-xs text-muted dark:text-night-muted">
                  {formatTime(session.endedAt)} · {session.minutes} min
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => deleteSession(session.id)}
                aria-label={`Delete session ${session.task || 'untitled'} at ${formatTime(session.endedAt)}`}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
