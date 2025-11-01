'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, AlertCircle, Plus, Gift } from 'lucide-react';
import Link from 'next/link';
import { formatDateShort, getDaysUntilBirthday, getDaysSinceLastContact } from '@/lib/utils';
import { QuickAddModal } from './QuickAddModal';
import { useNotifications } from '@/hooks/useNotifications';

interface Reminders {
  upcomingBirthdays: Array<{
    contact: any;
    daysUntil: number | null;
  }>;
  peopleToReachOut: Array<{
    contact: any;
    daysSince: number | null;
    interval: number | null;
  }>;
  overdueContacts: Array<{
    contact: any;
    daysSince: number | null;
    interval: number | null;
    overdueDays: number;
  }>;
}

export function Dashboard() {
  const [reminders, setReminders] = useState<Reminders | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [totalContacts, setTotalContacts] = useState<number | null>(null);
  
  // Enable notifications
  useNotifications();

  useEffect(() => {
    fetchReminders();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setTotalContacts(data.totalContacts);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Quick Add Contact</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {totalContacts !== null ? totalContacts : '...'}
              </p>
            </div>
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Birthdays</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {reminders?.upcomingBirthdays.length || 0}
              </p>
            </div>
            <Gift className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Contacts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {reminders?.overdueContacts.length || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Birthdays</h2>
          </div>
          {reminders?.upcomingBirthdays.length ? (
            <ul className="space-y-3">
              {reminders.upcomingBirthdays.slice(0, 5).map((item) => (
                <li key={item.contact.id}>
                  <Link
                    href={`/contacts/${item.contact.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.contact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.daysUntil === 0 ? 'Today!' : `${item.daysUntil} day${item.daysUntil !== 1 ? 's' : ''} away`}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No upcoming birthdays</p>
          )}
        </div>

        {/* People to Reach Out */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Time to Reach Out</h2>
          </div>
          {reminders?.peopleToReachOut.length ? (
            <ul className="space-y-3">
              {reminders.peopleToReachOut.slice(0, 5).map((item) => (
                <li key={item.contact.id}>
                  <Link
                    href={`/contacts/${item.contact.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.contact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.contact.lastContacted
                          ? `${item.daysSince} days since last contact`
                          : 'Never contacted'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">All caught up!</p>
          )}
        </div>
      </div>

      {/* Overdue Contacts */}
      {reminders?.overdueContacts.length ? (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-200">Overdue Contacts</h2>
          </div>
          <ul className="space-y-3">
            {reminders.overdueContacts.slice(0, 5).map((item) => (
              <li key={item.contact.id}>
                <Link
                  href={`/contacts/${item.contact.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">{item.contact.name}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {item.overdueDays} days overdue
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} onSuccess={fetchReminders} />
    </div>
  );
}

