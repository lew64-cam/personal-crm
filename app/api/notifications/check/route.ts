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

    const notifications: Array<{
      type: 'birthday' | 'reach_out';
      contactId: string;
      contactName: string;
      message: string;
    }> = [];

    // Check for upcoming birthdays
    contacts.forEach((contact) => {
      if (contact.birthday) {
        const daysUntil = getDaysUntilBirthday(contact.birthday);
        if (daysUntil !== null && daysUntil <= contact.birthdayReminderDays && daysUntil >= 0) {
          notifications.push({
            type: 'birthday',
            contactId: contact.id,
            contactName: contact.name,
            message:
              daysUntil === 0
                ? `${contact.name}'s birthday is today!`
                : `${contact.name}'s birthday is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          });
        }
      }

      // Check for reach-out reminders
      if (contact.reachOutIntervalDays) {
        const daysSince = getDaysSinceLastContact(contact.lastContacted);
        if (daysSince !== null && daysSince >= contact.reachOutIntervalDays) {
          notifications.push({
            type: 'reach_out',
            contactId: contact.id,
            contactName: contact.name,
            message: `Time to reach out to ${contact.name}. It's been ${daysSince} days since last contact.`,
          });
        }
      }
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

