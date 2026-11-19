import { useTimer } from '../hooks/useTimer'
import { TextField } from './TextField'

export function TaskField() {
  const { state, setTask } = useTimer()

  return (
    <TextField
      label="Working on (optional)"
      value={state.task}
      onChange={(event) => setTask(event.target.value)}
      maxLength={60}
      placeholder="e.g. Write the report"
      // Only meaningful for focus sessions, but editable any time: it is saved when a focus phase ends.
    />
  )
}
