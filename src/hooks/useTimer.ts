import { use } from 'react'
import { TimerContext } from '../state/timerContext'

export function useTimer() {
  const value = use(TimerContext)
  if (!value) throw new Error('useTimer must be used inside <TimerProvider>')
  return value
}
