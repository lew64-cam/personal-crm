'use client';

import { useEffect } from 'react';
import { showNotification } from '@/lib/notifications';

export function useNotifications() {
  useEffect(() => {
    // Check for notifications every 5 minutes
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/notifications/check');
        const data = await response.json();
        
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notif: any) => {
            showNotification(notif.message, {
              body: `Click to view ${notif.contactName}`,
              tag: notif.contactId,
            });
          });
        }
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Check immediately on mount
    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/check');
        const data = await response.json();
        
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notif: any) => {
            showNotification(notif.message, {
              body: `Click to view ${notif.contactName}`,
              tag: notif.contactId,
            });
          });
        }
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    };

    checkNotifications();

    return () => clearInterval(interval);
  }, []);
}

