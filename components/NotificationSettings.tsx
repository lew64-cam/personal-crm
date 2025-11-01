'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, scheduleDailyDigest } from '@/lib/notifications';

export function NotificationSettings() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [dailyDigestTime, setDailyDigestTime] = useState('09:00');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      alert('Notifications enabled!');
    } else {
      alert('Notifications were blocked. Please enable them in your browser settings.');
    }
  };

  const handleDigestTimeChange = (time: string) => {
    setDailyDigestTime(time);
    scheduleDailyDigest(time);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {permissionGranted ? (
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Browser Notifications
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {permissionGranted ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {!permissionGranted && (
            <button
              onClick={handleRequestPermission}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Enable notifications
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily Digest Time
          </label>
          <input
            type="time"
            value={dailyDigestTime}
            onChange={(e) => handleDigestTimeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Receive a daily summary at this time
          </p>
        </div>
      </div>
    </div>
  );
}

