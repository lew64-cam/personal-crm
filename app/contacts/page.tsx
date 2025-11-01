import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ContactsList } from '@/components/ContactsList';

export default async function ContactsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return <ContactsList />;
}

