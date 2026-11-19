import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '../types'
import { toISODate } from '../lib/dates'
import { createDemoSessions } from '../lib/demoSessions'

interface SessionsState {
  sessions: Session[]
  addSession: (input: { task: string; minutes: number; endedAt: number }) => void
  deleteSession: (id: string) => void
  clearSessions: () => void
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.task === 'string' &&
    typeof s.minutes === 'number' &&
    typeof s.endedAt === 'number' &&
    typeof s.date === 'string'
  )
}

// A second, separate store: sessions change on their own schedule (once per completed focus phase),
// so components that only read settings never re-render because of them.
export const useSessionsStore = create<SessionsState>()(
  persist(
    (set) => ({
      sessions: createDemoSessions(),

      addSession: ({ task, minutes, endedAt }) =>
        set((state) => ({
          sessions: [
            { id: crypto.randomUUID(), task, minutes, endedAt, date: toISODate(new Date(endedAt)) },
            ...state.sessions,
          ],
        })),

      deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'inncode-focus:sessions',
      version: 1,
      partialize: (state) => ({ sessions: state.sessions }),
      merge: (persisted, current) => {
        const sessions = (persisted as { sessions?: unknown } | null)?.sessions
        return Array.isArray(sessions) && sessions.every(isSession) ? { ...current, sessions } : current
      },
    },
  ),
)
