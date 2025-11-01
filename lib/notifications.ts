// Push notification utilities

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    ...options,
  });
}

export async function scheduleDailyDigest(time: string) {
  // This would integrate with a service worker or backend cron job
  // For now, we'll just store the preference
  localStorage.setItem('dailyDigestTime', time);
}

