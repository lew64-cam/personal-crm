import type { BirthdayReminder, ReachOutReminder, OverdueReminder } from './reminderUtils';

interface DigestData {
  upcomingBirthdays: BirthdayReminder[];
  peopleToReachOut: ReachOutReminder[];
  overdueContacts: OverdueReminder[];
}

function contactLink(appUrl: string, contactId: string, name: string): string {
  return `<a href="${appUrl}/contacts/${contactId}" style="color:#4f46e5;text-decoration:none;">${name}</a>`;
}

function section(title: string, color: string, rows: string[]): string {
  if (rows.length === 0) return '';
  return `
    <div style="margin-bottom:24px;">
      <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:${color};">${title}</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${rows.map(row => `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${row}</td></tr>`).join('')}
      </table>
    </div>`;
}

export function buildDigestEmailHtml(data: DigestData, appUrl: string): string {
  const birthdayRows = data.upcomingBirthdays.map(({ contact, daysUntil }) => {
    const when = daysUntil === 0 ? '<strong>Today!</strong>' : `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    return `${contactLink(appUrl, contact.id, contact.name)} — birthday ${when}`;
  });

  const reachOutRows = data.peopleToReachOut.map(({ contact, daysSince, interval }) =>
    `${contactLink(appUrl, contact.id, contact.name)} — due every ${interval}d, last contacted ${daysSince}d ago`
  );

  const overdueRows = data.overdueContacts.map(({ contact, overdueDays }) =>
    `${contactLink(appUrl, contact.id, contact.name)} — overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`
  );

  const hasContent = birthdayRows.length + reachOutRows.length + overdueRows.length > 0;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;padding:32px 16px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#4f46e5;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Your Relationship Digest</h1>
      <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div style="padding:32px;">
      ${hasContent
        ? section('🎂 Upcoming Birthdays', '#db2777', birthdayRows) +
          section('⚠️ Overdue Check-ins', '#dc2626', overdueRows) +
          section('📬 Reach Out', '#d97706', reachOutRows)
        : '<p style="color:#6b7280;text-align:center;padding:24px 0;">You\'re all caught up! No reminders for now.</p>'
      }
      <div style="margin-top:24px;text-align:center;">
        <a href="${appUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Open CRM</a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Manage your digest preferences in <a href="${appUrl}/settings" style="color:#4f46e5;">Settings</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}
