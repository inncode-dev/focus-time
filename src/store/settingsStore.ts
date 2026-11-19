import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '../types'
import { LIMITS, isWithin } from '../lib/limits'

interface SettingsState extends Settings {
  update: (changes: Partial<Settings>) => void
}

const DEFAULTS: Settings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
  autoStart: false,
  sound: true,
  notifications: false,
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    isWithin(s.focusMin, LIMITS.focusMin) &&
    isWithin(s.shortBreakMin, LIMITS.shortBreakMin) &&
    isWithin(s.longBreakMin, LIMITS.longBreakMin) &&
    isWithin(s.longBreakEvery, LIMITS.longBreakEvery) &&
    typeof s.autoStart === 'boolean' &&
    typeof s.sound === 'boolean' &&
    typeof s.notifications === 'boolean'
  )
}

// Settings are read by several unrelated components and survive reloads: a good fit for a small store.
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      update: (changes) => set(changes),
    }),
    {
      name: 'inncode-focus:settings',
      version: 1,
      // Save the values only, not the `update` function.
      partialize: ({ update: _update, ...settings }): Settings => settings,
      merge: (persisted, current) => (isSettings(persisted) ? { ...current, ...persisted } : current),
    },
  ),
)
