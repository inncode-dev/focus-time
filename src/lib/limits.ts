export const LIMITS = {
  focusMin: { min: 1, max: 90 },
  shortBreakMin: { min: 1, max: 30 },
  longBreakMin: { min: 1, max: 60 },
  longBreakEvery: { min: 2, max: 8 },
} as const

export function isWithin(value: unknown, limit: { min: number; max: number }): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= limit.min && value <= limit.max
}
