import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { CalendarView } from '@/components/CalendarView';

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return <CalendarView />;
}
