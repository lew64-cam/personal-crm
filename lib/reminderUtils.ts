import { getDaysUntilBirthday, getDaysSinceLastContact } from './utils';
import type { Contact } from './prisma';

export interface BirthdayReminder {
  contact: Contact;
  daysUntil: number;
}

export interface ReachOutReminder {
  contact: Contact;
  daysSince: number;
  interval: number;
}

export interface OverdueReminder {
  contact: Contact;
  daysSince: number;
  interval: number;
  overdueDays: number;
}

export function computeUpcomingBirthdays(contacts: Contact[]): BirthdayReminder[] {
  return contacts
    .filter((c) => c.birthday)
    .map((c) => ({ contact: c, daysUntil: getDaysUntilBirthday(c.birthday) }))
    .filter((item): item is BirthdayReminder => {
      if (item.daysUntil == null) return false;
      const reminderDays = item.contact.birthdayReminderDays;
      return item.daysUntil <= reminderDays && item.daysUntil >= 0;
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function computePeopleToReachOut(contacts: Contact[]): ReachOutReminder[] {
  return contacts
    .filter((c) => c.reachOutIntervalDays)
    .map((c) => ({
      contact: c,
      daysSince: getDaysSinceLastContact(c.lastContacted),
      interval: c.reachOutIntervalDays,
    }))
    .filter((item): item is ReachOutReminder => {
      if (!item.daysSince || !item.interval) return false;
      return item.daysSince >= item.interval;
    })
    .sort((a, b) => b.daysSince - a.daysSince);
}

export function computeOverdueContacts(contacts: Contact[]): OverdueReminder[] {
  return contacts
    .filter((c) => c.reachOutIntervalDays && c.lastContacted)
    .map((c) => {
      const daysSince = getDaysSinceLastContact(c.lastContacted)!;
      const interval = c.reachOutIntervalDays!;
      return { contact: c, daysSince, interval, overdueDays: daysSince - interval };
    })
    .filter((item) => item.overdueDays > 7)
    .sort((a, b) => b.overdueDays - a.overdueDays);
}
