import { useTimer } from '../hooks/useTimer'

export function CycleDots() {
  const { state, config } = useTimer()
  const total = config.longBreakEvery
  const done = state.phase === 'longBreak' ? total : state.focusDone % total

  return (
    <p className="flex items-center justify-center gap-2" aria-label={`${done} of ${total} sessions before the long break`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`size-2.5 rounded-full ${i < done ? 'bg-accent dark:bg-mint' : 'bg-line dark:bg-night-line'}`}
        />
      ))}
    </p>
  )
}
