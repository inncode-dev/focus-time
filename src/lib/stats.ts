import type { Session, Stats } from '../types'
import { lastDays } from './dates'

export function computeStats(sessions: Session[], today: string): Stats {
  const minutesByDay = new Map<string, number>()
  let totalMinutes = 0
  let todayCount = 0

  for (const session of sessions) {
    totalMinutes += session.minutes
    minutesByDay.set(session.date, (minutesByDay.get(session.date) ?? 0) + session.minutes)
    if (session.date === today) todayCount += 1
  }

  return {
    todayMinutes: minutesByDay.get(today) ?? 0,
    todayCount,
    totalMinutes,
    last7Days: lastDays(7).map((date) => ({ date, minutes: minutesByDay.get(date) ?? 0 })),
  }
}
