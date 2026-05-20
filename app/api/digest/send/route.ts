import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { computeUpcomingBirthdays, computePeopleToReachOut, computeOverdueContacts } from '@/lib/reminderUtils';
import { buildDigestEmailHtml } from '@/lib/emailTemplates';
import type { Contact } from '@/lib/prisma';

// This endpoint is meant to be called by a cron job.
// Protect it with Authorization: Bearer <CRON_SECRET>.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const supabase = createServiceClient();
  const nowUtc = new Date();
  const currentHour = nowUtc.getUTCHours();
  const currentDow = nowUtc.getUTCDay();

  // Fetch all users with digests enabled
  const { data: allPrefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('digestEnabled', true);

  if (prefsError) {
    return NextResponse.json({ error: prefsError.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const prefs of allPrefs || []) {
    try {
      // Check send hour
      if (prefs.digestSendHour !== currentHour) { skipped++; continue; }

      // Check frequency / day
      if (prefs.digestFrequency === 'weekly' && prefs.digestDayOfWeek !== currentDow) {
        skipped++; continue;
      }

      // Avoid double-sending within same hour
      if (prefs.lastDigestSentAt) {
        const lastSent = new Date(prefs.lastDigestSentAt);
        const hoursSince = (nowUtc.getTime() - lastSent.getTime()) / 3_600_000;
        if (hoursSince < 20) { skipped++; continue; }
      }

      // Fetch this user's contacts
      const { data: contactRows } = await supabase
        .from('Contact')
        .select('*')
        .eq('userId', prefs.userId)
        .eq('notificationEnabled', true);

      const contacts: Contact[] = (contactRows || []).map((c: any) => ({
        ...c,
        lastContacted: c.lastContacted ? new Date(c.lastContacted) : null,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        entries: [],
      }));

      const data = {
        upcomingBirthdays: computeUpcomingBirthdays(contacts),
        peopleToReachOut: computePeopleToReachOut(contacts),
        overdueContacts: computeOverdueContacts(contacts),
      };

      const toEmail = prefs.digestEmail || prefs.userId; // fallback; userId is usually the auth email
      const html = buildDigestEmailHtml(data, appUrl);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Personal CRM <digest@yourcrm.com>',
          to: toEmail,
          subject: `Your relationship digest — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        errors.push(`${prefs.userId}: ${err}`);
        continue;
      }

      // Update lastDigestSentAt
      await supabase
        .from('user_preferences')
        .update({ lastDigestSentAt: nowUtc.toISOString(), updatedAt: nowUtc.toISOString() })
        .eq('userId', prefs.userId);

      sent++;
    } catch (e: any) {
      errors.push(`${prefs.userId}: ${e.message}`);
    }
  }

  return NextResponse.json({ sent, skipped, errors });
}
