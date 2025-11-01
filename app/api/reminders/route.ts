import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDaysUntilBirthday, getDaysSinceLastContact } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allContacts = await db.getContacts(user.id);
    const contacts = allContacts.filter(contact => contact.notificationEnabled);

    const upcomingBirthdays = contacts
      .filter((contact) => contact.birthday)
      .map((contact) => ({
        contact,
        daysUntil: getDaysUntilBirthday(contact.birthday),
      }))
      .filter((item) => {
        if (!item.daysUntil) return false;
        const reminderDays = item.contact.birthdayReminderDays;
        return item.daysUntil <= reminderDays && item.daysUntil >= 0;
      })
      .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));

    const peopleToReachOut = contacts
      .filter((contact) => contact.reachOutIntervalDays)
      .map((contact) => ({
        contact,
        daysSince: getDaysSinceLastContact(contact.lastContacted),
        interval: contact.reachOutIntervalDays,
      }))
      .filter((item) => {
        if (!item.daysSince || !item.interval) return false;
        return item.daysSince >= item.interval;
      })
      .sort((a, b) => (b.daysSince || 0) - (a.daysSince || 0));

    const overdueContacts = contacts
      .filter((contact) => contact.reachOutIntervalDays && contact.lastContacted)
      .map((contact) => ({
        contact,
        daysSince: getDaysSinceLastContact(contact.lastContacted),
        interval: contact.reachOutIntervalDays,
        overdueDays: getDaysSinceLastContact(contact.lastContacted)! - contact.reachOutIntervalDays!,
      }))
      .filter((item) => item.overdueDays > 7) // Overdue by more than a week
      .sort((a, b) => b.overdueDays - a.overdueDays);

    return NextResponse.json({
      upcomingBirthdays,
      peopleToReachOut,
      overdueContacts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

