import type { Contact } from './prisma';

export interface CsvField {
  key: keyof Contact;
  label: string;
  aliases: string[]; // lowercased header variants for auto-detection
}

export const CONTACT_CSV_FIELDS: CsvField[] = [
  { key: 'name',                label: 'Name',               aliases: ['name', 'full name', 'fullname', 'contact name'] },
  { key: 'email',               label: 'Email',              aliases: ['email', 'e-mail', 'email address'] },
  { key: 'phone',               label: 'Phone',              aliases: ['phone', 'phone number', 'mobile', 'cell'] },
  { key: 'company',             label: 'Company',            aliases: ['company', 'organization', 'org', 'employer'] },
  { key: 'jobTitle',            label: 'Job Title',          aliases: ['job title', 'title', 'position', 'role'] },
  { key: 'location',            label: 'Location',           aliases: ['location', 'city', 'address'] },
  { key: 'birthday',            label: 'Birthday (MM-DD)',   aliases: ['birthday', 'birth date', 'dob', 'date of birth'] },
  { key: 'relationshipType',    label: 'Relationship Type',  aliases: ['relationship type', 'relationship', 'type'] },
  { key: 'tags',                label: 'Tags',               aliases: ['tags', 'labels', 'categories'] },
  { key: 'notes',               label: 'Notes',              aliases: ['notes', 'note', 'comments'] },
  { key: 'howWeMet',            label: 'How We Met',         aliases: ['how we met', 'met at', 'intro'] },
  { key: 'linkedInUrl',         label: 'LinkedIn URL',       aliases: ['linkedin', 'linkedin url', 'linkedin profile'] },
  { key: 'twitterUrl',          label: 'Twitter URL',        aliases: ['twitter', 'twitter url', 'x url'] },
  { key: 'personalWebsiteUrl',  label: 'Website',            aliases: ['website', 'personal website', 'url', 'web'] },
  { key: 'reachOutIntervalDays',label: 'Reach Out Interval (days)', aliases: ['reach out interval', 'interval', 'check in days'] },
  { key: 'birthdayReminderDays',label: 'Birthday Reminder (days)',  aliases: ['birthday reminder', 'birthday reminder days'] },
  { key: 'notificationEnabled', label: 'Notifications Enabled',     aliases: ['notifications', 'notification enabled'] },
  { key: 'lastContacted',       label: 'Last Contacted',     aliases: ['last contacted', 'last contact', 'last interaction'] },
];

export function contactsToCsvRows(contacts: Contact[]): Record<string, string>[] {
  return contacts.map((c) => {
    const row: Record<string, string> = {};
    for (const field of CONTACT_CSV_FIELDS) {
      const val = c[field.key];
      if (val == null) {
        row[field.label] = '';
      } else if (val instanceof Date) {
        row[field.label] = val.toISOString();
      } else {
        row[field.label] = String(val);
      }
    }
    return row;
  });
}

export function guessCsvMapping(headers: string[]): Record<string, keyof Contact> {
  const mapping: Record<string, keyof Contact> = {};
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    for (const field of CONTACT_CSV_FIELDS) {
      if (field.aliases.includes(lower)) {
        mapping[header] = field.key;
        break;
      }
    }
  }
  return mapping;
}
