import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { NotificationSettings } from '@/components/NotificationSettings';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      <NotificationSettings />
    </div>
  );
}

