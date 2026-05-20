import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { contactsToCsvRows, CONTACT_CSV_FIELDS } from '@/lib/csvUtils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contacts = await db.getContacts(user.id);
    const rows = contactsToCsvRows(contacts);

    const headers = CONTACT_CSV_FIELDS.map((f) => f.label);

    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const lines = [
      headers.map(escape).join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h] ?? '')).join(',')),
    ];

    const csv = lines.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contacts.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
