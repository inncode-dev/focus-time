import { useId, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export function Checkbox({ label, hint, ...props }: CheckboxProps) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        aria-describedby={hint ? hintId : undefined}
        className="mt-0.5 size-4 cursor-pointer accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:accent-mint dark:focus-visible:outline-mint"
        {...props}
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-xs text-muted dark:text-night-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
