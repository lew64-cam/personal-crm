import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTags(tags: string): string[] {
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export function formatTags(tags: string[]): string {
  return tags.join(', ');
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export function getDaysUntilBirthday(birthday: string | null | undefined): number | null {
  if (!birthday) return null;
  
  const [month, day] = birthday.split('-').map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  
  let birthdayDate = new Date(currentYear, month - 1, day);
  
  // If birthday already passed this year, check next year
  if (birthdayDate < today) {
    birthdayDate = new Date(currentYear + 1, month - 1, day);
  }
  
  const diffTime = birthdayDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getDaysSinceLastContact(lastContacted: Date | null | undefined): number | null {
  if (!lastContacted) return null;
  
  const today = new Date();
  const diffTime = today.getTime() - lastContacted.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

