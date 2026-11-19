import { PHASES } from '../lib/phases'
import { useTimer } from '../hooks/useTimer'
import { Button } from './Button'

export function PhaseTabs() {
  const { state, selectPhase } = useTimer()

  return (
    <div role="group" aria-label="Phase" className="flex flex-wrap justify-center gap-2">
      {PHASES.map(({ value, label }) => (
        <Button
          key={value}
          variant={state.phase === value ? 'primary' : 'secondary'}
          aria-pressed={state.phase === value}
          // Switching phase resets the countdown, so it is blocked while the timer is running.
          disabled={state.status === 'running' && state.phase !== value}
          onClick={() => selectPhase(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
