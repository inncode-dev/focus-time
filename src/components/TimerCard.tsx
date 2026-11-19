import { formatClock } from '../lib/format'
import { phaseLabel } from '../lib/phases'
import { getRemainingMs } from '../lib/timerReducer'
import { useNow } from '../hooks/useNow'
import { useTimer } from '../hooks/useTimer'
import { Button } from './Button'
import { CycleDots } from './CycleDots'
import { PhaseTabs } from './PhaseTabs'
import { TaskField } from './TaskField'
import { TimerRing } from './TimerRing'

const CAPTIONS = { idle: 'Ready', running: 'Running', paused: 'Paused' } as const

export function TimerCard() {
  const { state, config, start, pause, reset, skip } = useTimer()
  const now = useNow()

  const remaining = getRemainingMs(state, now, config)
  const total = state.status === 'idle' ? getRemainingMs(state, now, config) : state.durationMs
  const progress = state.status === 'idle' ? 0 : 1 - remaining / total

  return (
    <section
      aria-label="Timer"
      className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-4 sm:p-6 dark:border-night-line dark:bg-night-surface"
    >
      <PhaseTabs />
      <TimerRing progress={progress} time={formatClock(remaining)} caption={`${phaseLabel(state.phase)} · ${CAPTIONS[state.status]}`} />
      <CycleDots />

      <div className="flex flex-wrap justify-center gap-2">
        {state.status === 'running' ? (
          <Button variant="primary" onClick={pause} className="min-w-28 py-2.5">
            Pause
          </Button>
        ) : (
          <Button variant="primary" onClick={start} className="min-w-28 py-2.5">
            {state.status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button onClick={reset} disabled={state.status === 'idle'} className="py-2.5">
          Reset
        </Button>
        <Button onClick={skip} className="py-2.5">
          Skip
        </Button>
      </div>
      <p className="text-center font-mono text-xs text-muted dark:text-night-muted">
        Shortcuts: <kbd>Space</kbd> start / pause · <kbd>R</kbd> reset · <kbd>S</kbd> skip
      </p>

      <TaskField />
    </section>
  )
}
