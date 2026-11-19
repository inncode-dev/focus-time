import { useState } from 'react'
import { isWithin } from '../lib/limits'
import { TextField } from './TextField'

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}

// While typing, the field holds a *draft string*: "" or "4" are not valid durations yet,
// but must be allowed on the way to "45". Only valid values are passed up (committed).
export function NumberField({ label, value, min, max, onCommit }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value))
  const parsed = Number(draft)
  const valid = draft.trim() !== '' && isWithin(parsed, { min, max })

  return (
    <TextField
      label={label}
      value={draft}
      inputMode="numeric"
      onChange={(event) => {
        setDraft(event.target.value)
        const next = Number(event.target.value)
        if (event.target.value.trim() !== '' && isWithin(next, { min, max })) onCommit(next)
      }}
      // Leaving the field with an invalid draft puts the last good value back.
      onBlur={() => setDraft(String(value))}
      error={valid ? undefined : `Whole number from ${min} to ${max}.`}
    />
  )
}
