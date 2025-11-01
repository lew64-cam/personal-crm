'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Personal CRM
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/contacts"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Contacts
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

