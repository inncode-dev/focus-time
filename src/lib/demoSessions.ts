import type { Session } from '../types'
import { toISODate } from './dates'

const TASKS = ['Write the report', 'Code review', 'Study React', 'Plan the week', 'Emails', 'Read papers']

// Deterministic "random" in [0, 1): the same demo every time. Not for anything security-related.
function pseudoRandom(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** A few sessions on each of the previous 6 days, so the chart has something to show. Today stays empty. */
export function createDemoSessions(now: Date = new Date()): Session[] {
  const sessions: Session[] = []

  for (let daysAgo = 1; daysAgo <= 6; daysAgo++) {
    const count = 1 + Math.floor(pseudoRandom(daysAgo, 1) * 6)
    for (let i = 0; i < count; i++) {
      const endedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, 9, 30 + i * 40).getTime()
      sessions.push({
        id: `demo-${daysAgo}-${i}`,
        task: TASKS[Math.floor(pseudoRandom(daysAgo, i + 2) * TASKS.length)],
        minutes: 25,
        endedAt,
        date: toISODate(new Date(endedAt)),
      })
    }
  }
  return sessions
}
