import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export interface CalendarEvent {
  id: string;
  type: 'birthday' | 'reach_out' | 'interaction';
  date: string; // ISO date string (YYYY-MM-DD)
  contactId: string;
  contactName: string;
  label: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [contacts, entries] = await Promise.all([
      db.getContacts(user.id),
      db.getContactEntriesInRange(user.id, startDate, endDate),
    ]);

    const events: CalendarEvent[] = [];

    // Birthday events
    for (const contact of contacts) {
      if (!contact.birthday) continue;
      const [mm, dd] = contact.birthday.split('-').map(Number);
      if (mm === month) {
        const date = `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        events.push({
          id: `birthday-${contact.id}`,
          type: 'birthday',
          date,
          contactId: contact.id,
          contactName: contact.name,
          label: `${contact.name}'s birthday`,
        });
      }
    }

    // Reach-out due date events
    for (const contact of contacts) {
      if (!contact.reachOutIntervalDays || !contact.lastContacted) continue;
      const dueDate = new Date(contact.lastContacted);
      dueDate.setDate(dueDate.getDate() + contact.reachOutIntervalDays);
      if (dueDate >= startDate && dueDate <= endDate) {
        const date = dueDate.toISOString().slice(0, 10);
        events.push({
          id: `reachout-${contact.id}`,
          type: 'reach_out',
          date,
          contactId: contact.id,
          contactName: contact.name,
          label: `Reach out to ${contact.name}`,
        });
      }
    }

    // Past interaction events
    for (const entry of entries) {
      const date = entry.createdAt.toISOString().slice(0, 10);
      events.push({
        id: `entry-${entry.id}`,
        type: 'interaction',
        date,
        contactId: entry.contactId,
        contactName: entry.contactName,
        label: `Interaction with ${entry.contactName}`,
      });
    }

    events.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
