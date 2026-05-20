import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Contact } from '@/lib/prisma';

type ImportRow = Partial<Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'entries'>>;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { rows }: { rows: ImportRow[] } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'rows must be an array' }, { status: 400 });
    }

    // Fetch existing emails for deduplication
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('Contact')
      .select('email')
      .eq('userId', user.id)
      .not('email', 'is', null);

    const existingEmails = new Set(
      (existing || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean)
    );

    let imported = 0;
    let skipped = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.name?.trim()) {
        errors.push({ row: i + 1, message: 'Missing required field: name' });
        continue;
      }

      if (row.email && existingEmails.has(row.email.toLowerCase())) {
        skipped++;
        continue;
      }

      try {
        await db.createContact({
          userId: user.id,
          name: row.name.trim(),
          email: row.email || null,
          phone: row.phone || null,
          company: row.company || null,
          jobTitle: row.jobTitle || null,
          location: row.location || null,
          birthday: row.birthday || null,
          relationshipType: row.relationshipType || null,
          tags: row.tags || '',
          notes: row.notes || null,
          howWeMet: row.howWeMet || null,
          linkedInUrl: row.linkedInUrl || null,
          twitterUrl: row.twitterUrl || null,
          personalWebsiteUrl: row.personalWebsiteUrl || null,
          reachOutIntervalDays: row.reachOutIntervalDays ? Number(row.reachOutIntervalDays) : null,
          birthdayReminderDays: row.birthdayReminderDays ? Number(row.birthdayReminderDays) : 0,
          notificationEnabled: row.notificationEnabled !== false,
          lastContacted: null,
        });
        if (row.email) existingEmails.add(row.email.toLowerCase());
        imported++;
      } catch (e: any) {
        errors.push({ row: i + 1, message: e.message });
      }
    }

    return NextResponse.json({ imported, skipped, errors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
