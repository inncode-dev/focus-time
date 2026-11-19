export function notificationsSupported(): boolean {
  return typeof Notification !== 'undefined'
}

/** Must be called from a click: browsers ignore permission requests that are not triggered by the user. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  return Notification.requestPermission()
}

export function sendNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/favicon.svg' })
}
