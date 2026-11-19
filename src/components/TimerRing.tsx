const SIZE = 260
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface TimerRingProps {
  /** 0 (just started) to 1 (finished). */
  progress: number
  time: string
  caption: string
}

// The ring is two circles: a faint track and a coloured arc. strokeDashoffset hides the part
// of the arc that has not "elapsed" yet; rotating -90deg makes it start at 12 o'clock.
export function TimerRing({ progress, time, caption }: TimerRingProps) {
  const clamped = Math.min(1, Math.max(0, progress))

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className="size-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-line dark:stroke-night-line"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          className="stroke-accent dark:stroke-mint"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* role="timer" does not announce every change, so screen readers are not flooded each second. */}
        <p role="timer" className="font-mono text-5xl font-medium tabular-nums">
          {time}
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted dark:text-night-muted">{caption}</p>
      </div>
    </div>
  )
}
