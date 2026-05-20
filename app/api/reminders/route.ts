import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  computeUpcomingBirthdays,
  computePeopleToReachOut,
  computeOverdueContacts,
} from '@/lib/reminderUtils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allContacts = await db.getContacts(user.id);
    const contacts = allContacts.filter(contact => contact.notificationEnabled);

    return NextResponse.json({
      upcomingBirthdays: computeUpcomingBirthdays(contacts),
      peopleToReachOut: computePeopleToReachOut(contacts),
      overdueContacts: computeOverdueContacts(contacts),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

