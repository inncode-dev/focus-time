import type { DayTotal } from '../types'
import { formatWeekday } from '../lib/dates'
import { formatMinutes } from '../lib/format'

// A bar chart with no library: each bar is a div whose height is its share of the busiest day.
export function WeekChart({ days, today }: { days: DayTotal[]; today: string }) {
  const max = Math.max(...days.map((d) => d.minutes), 1)

  return (
    <ul aria-label="Focus minutes in the last 7 days" className="flex h-36 items-end gap-2">
      {days.map(({ date, minutes }) => (
        <li
          key={date}
          aria-label={`${formatWeekday(date)}: ${minutes ? formatMinutes(minutes) : 'no focus time'}`}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1"
        >
          <span className="font-mono text-[10px] text-muted dark:text-night-muted">{minutes || ''}</span>
          {/* Dynamic height is the one thing a utility class cannot express, hence the inline style. */}
          <div
            title={`${formatWeekday(date)}: ${formatMinutes(minutes)}`}
            style={{ height: `${Math.max((minutes / max) * 100, minutes ? 4 : 1)}%` }}
            className={`w-full rounded-t-sm ${
              date === today ? 'bg-accent dark:bg-mint' : 'bg-ink/70 dark:bg-paper/60'
            } ${minutes === 0 ? 'opacity-30' : ''}`}
          />
          <span className="font-mono text-[10px] uppercase text-muted dark:text-night-muted">{formatWeekday(date)}</span>
        </li>
      ))}
    </ul>
  )
}
