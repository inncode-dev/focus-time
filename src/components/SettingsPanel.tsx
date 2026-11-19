import { useState } from 'react'
import { LIMITS } from '../lib/limits'
import { notificationsSupported, requestNotificationPermission } from '../lib/notify'
import { useSettingsStore } from '../store/settingsStore'
import { Checkbox } from './Checkbox'
import { NumberField } from './NumberField'

export function SettingsPanel() {
  // No selector needed here: this panel shows every setting, so it should re-render when any changes.
  const settings = useSettingsStore()
  const update = useSettingsStore((s) => s.update)
  const [notificationMessage, setNotificationMessage] = useState('')

  const handleNotifications = async (enabled: boolean) => {
    setNotificationMessage('')
    if (!enabled) return update({ notifications: false })

    // Asking for permission is async and only works from a click: that is why it lives in the handler.
    const permission = await requestNotificationPermission()
    if (permission === 'granted') update({ notifications: true })
    else setNotificationMessage('Notifications are blocked. Allow them in your browser settings to enable this.')
  }

  return (
    <section
      aria-labelledby="settings-title"
      className="rounded-lg border border-line bg-surface p-4 dark:border-night-line dark:bg-night-surface"
    >
      <h2 id="settings-title" className="mb-4 font-display text-lg font-extrabold uppercase">
        Settings
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Focus (min)"
          value={settings.focusMin}
          {...LIMITS.focusMin}
          onCommit={(focusMin) => update({ focusMin })}
        />
        <NumberField
          label="Short break (min)"
          value={settings.shortBreakMin}
          {...LIMITS.shortBreakMin}
          onCommit={(shortBreakMin) => update({ shortBreakMin })}
        />
        <NumberField
          label="Long break (min)"
          value={settings.longBreakMin}
          {...LIMITS.longBreakMin}
          onCommit={(longBreakMin) => update({ longBreakMin })}
        />
        <NumberField
          label="Sessions per cycle"
          value={settings.longBreakEvery}
          {...LIMITS.longBreakEvery}
          onCommit={(longBreakEvery) => update({ longBreakEvery })}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Checkbox
          label="Start the next phase automatically"
          checked={settings.autoStart}
          onChange={(event) => update({ autoStart: event.target.checked })}
        />
        <Checkbox
          label="Play a sound when a phase ends"
          checked={settings.sound}
          onChange={(event) => update({ sound: event.target.checked })}
        />
        {notificationsSupported() && (
          <Checkbox
            label="Show a notification when a phase ends"
            checked={settings.notifications}
            onChange={(event) => void handleNotifications(event.target.checked)}
            hint={notificationMessage || undefined}
          />
        )}
      </div>
    </section>
  )
}
