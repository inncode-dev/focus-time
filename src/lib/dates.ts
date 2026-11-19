import type { IsoDate } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayISO = () => toISODate(new Date())

/** The last `count` local days, oldest first, ending today. */
export function lastDays(count: number, now: Date = new Date()): IsoDate[] {
  return Array.from({ length: count }, (_, i) =>
    toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (count - 1 - i))),
  )
}

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
export function formatWeekday(isoDate: IsoDate): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return weekdayFormatter.format(new Date(y, m - 1, d))
}
