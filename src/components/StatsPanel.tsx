import { useMemo } from 'react'
import { todayISO } from '../lib/dates'
import { formatMinutes } from '../lib/format'
import { computeStats } from '../lib/stats'
import { useSessionsStore } from '../store/sessionsStore'
import { WeekChart } from './WeekChart'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3 dark:border-night-line dark:bg-night">
      <dt className="font-mono text-xs uppercase tracking-wide text-muted dark:text-night-muted">{label}</dt>
      <dd className="mt-1 font-display text-xl font-extrabold">{value}</dd>
    </div>
  )
}

export function StatsPanel() {
  const sessions = useSessionsStore((s) => s.sessions)
  const today = todayISO()
  // Recomputed only when the sessions change, not on every render of the page.
  const stats = useMemo(() => computeStats(sessions, today), [sessions, today])

  return (
    <section
      aria-labelledby="stats-title"
      className="rounded-lg border border-line bg-surface p-4 dark:border-night-line dark:bg-night-surface"
    >
      <h2 id="stats-title" className="mb-4 font-display text-lg font-extrabold uppercase">
        Statistics
      </h2>
      <dl className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Today" value={formatMinutes(stats.todayMinutes)} />
        <StatCard label="Sessions" value={String(stats.todayCount)} />
        <StatCard label="All time" value={formatMinutes(stats.totalMinutes)} />
      </dl>
      <WeekChart days={stats.last7Days} today={today} />
    </section>
  )
}
