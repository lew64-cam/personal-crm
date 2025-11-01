import { createClient } from './supabase/server';

// Helper to generate CUID-like IDs
function generateId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  birthday?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  howWeMet?: string | null;
  relationshipType?: string | null;
  notes?: string | null;
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  personalWebsiteUrl?: string | null;
  tags: string;
  lastContacted?: Date | null;
  reachOutIntervalDays?: number | null;
  birthdayReminderDays: number;
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  entries?: ContactEntry[];
}

export interface ContactEntry {
  id: string;
  contactId: string;
  content: string;
  createdAt: Date;
}

// Database helper functions using Supabase
export const db = {
  async getContacts(userId: string, filters?: {
    search?: string;
    relationshipType?: string;
    tag?: string;
    company?: string;
  }) {
    const supabase = await createClient();
    let query = supabase
      .from('Contact')
      .select(`
        *,
        ContactEntry (
          id,
          content,
          createdAt
        )
      `)
      .eq('userId', userId)
      .order('updatedAt', { ascending: false });

    if (filters?.relationshipType) {
      query = query.eq('relationshipType', filters.relationshipType);
    }

    if (filters?.tag) {
      query = query.ilike('tags', `%${filters.tag}%`);
    }

    if (filters?.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Apply search filter in memory (Supabase text search is more complex)
    let contacts = data || [];
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      contacts = contacts.filter(
        (contact: any) =>
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.tags?.toLowerCase().includes(searchLower)
      );
    }

    // Format entries - get only the latest one if needed
    return contacts.map((contact: any) => ({
      ...contact,
      lastContacted: contact.lastContacted ? new Date(contact.lastContacted) : null,
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
      entries: contact.ContactEntry
        ? contact.ContactEntry.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 1).map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
          }))
        : [],
    })) as Contact[];
  },

  async getContact(id: string, userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Contact')
      .select(`
        *,
        ContactEntry (
          id,
          content,
          createdAt
        )
      `)
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      lastContacted: data.lastContacted ? new Date(data.lastContacted) : null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      entries: data.ContactEntry?.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      })) || [],
    } as Contact;
  },

  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'entries'>) {
    const supabase = await createClient();
    const id = generateId();
    const now = new Date().toISOString();

    const { data: contact, error } = await supabase
      .from('Contact')
      .insert({
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...contact,
      lastContacted: contact.lastContacted ? new Date(contact.lastContacted) : null,
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    } as Contact;
  },

  async updateContact(id: string, userId: string, data: Partial<Contact>) {
    const supabase = await createClient();
    const { data: contact, error } = await supabase
      .from('Contact')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...contact,
      lastContacted: contact.lastContacted ? new Date(contact.lastContacted) : null,
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    } as Contact;
  },

  async deleteContact(id: string, userId: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('Contact')
      .delete()
      .eq('id', id)
      .eq('userId', userId);

    if (error) throw error;
  },

  async countContacts(userId: string) {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('Contact')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    if (error) throw error;
    return count || 0;
  },

  async createContactEntry(contactId: string, content: string) {
    const supabase = await createClient();
    const id = generateId();

    const { data: entry, error } = await supabase
      .from('ContactEntry')
      .insert({
        id,
        contactId,
        content,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...entry,
      createdAt: new Date(entry.createdAt),
    } as ContactEntry;
  },
};

