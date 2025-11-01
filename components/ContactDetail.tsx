'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Clock,
  Save,
  X,
} from 'lucide-react';
import { formatDate, parseTags } from '@/lib/utils';
import { ContactEditModal } from './ContactEditModal';

interface Contact {
  id: string;
  name: string;
  birthday?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  email?: string;
  phone?: string;
  howWeMet?: string;
  relationshipType?: string;
  notes?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  personalWebsiteUrl?: string;
  tags: string;
  lastContacted?: string;
  reachOutIntervalDays?: number;
  birthdayReminderDays: number;
  notificationEnabled: boolean;
  entries: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
}

interface ContactDetailProps {
  contactId: string;
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [addingEntry, setAddingEntry] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      router.push('/contacts');
    } catch (error) {
      alert('Failed to delete contact');
    }
  };

  const handleLogContact = async () => {
    if (!newEntry.trim()) return;

    setAddingEntry(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newEntry }),
      });
      if (!response.ok) throw new Error('Failed to log contact');
      setNewEntry('');
      fetchContact();
    } catch (error) {
      alert('Failed to log contact');
    } finally {
      setAddingEntry(false);
    }
  };

  const handleQuickContact = async () => {
    try {
      await fetch(`/api/contacts/${contactId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchContact();
      alert('Last contacted date updated!');
    } catch (error) {
      alert('Failed to update contact');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500 dark:text-gray-400">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contact.name}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${contact.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{contact.company}</span>
                  {contact.jobTitle && (
                    <span className="text-gray-500 dark:text-gray-400">• {contact.jobTitle}</span>
                  )}
                </div>
              )}
              {contact.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{contact.location}</span>
                </div>
              )}
              {contact.birthday && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Birthday: {contact.birthday}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(contact.linkedInUrl || contact.twitterUrl || contact.personalWebsiteUrl) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {contact.linkedInUrl && (
                    <a
                      href={contact.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {contact.twitterUrl && (
                    <a
                      href={contact.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {contact.personalWebsiteUrl && (
                    <a
                      href={contact.personalWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {parseTags(contact.tags).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {parseTags(contact.tags).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* How We Met */}
          {contact.howWeMet && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How We Met</h2>
              <p className="text-gray-700 dark:text-gray-300">{contact.howWeMet}</p>
            </div>
          )}

          {/* Timeline Entries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
            
            <div className="space-y-4 mb-4">
              {contact.entries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-indigo-500 pl-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{entry.content}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Add a new entry..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                rows={3}
              />
              <button
                onClick={handleLogContact}
                disabled={addingEntry || !newEntry.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {addingEntry ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleQuickContact}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Mark as Contacted</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reminder Settings</h2>
            <div className="space-y-2 text-sm">
              {contact.lastContacted ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Last contacted: <span className="font-medium">{formatDate(contact.lastContacted)}</span>
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Never contacted</p>
              )}
              {contact.reachOutIntervalDays && (
                <p className="text-gray-600 dark:text-gray-400">
                  Reach out every: <span className="font-medium">{contact.reachOutIntervalDays} days</span>
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                Birthday reminder: <span className="font-medium">{contact.birthdayReminderDays} days before</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Details</h2>
            <div className="space-y-2 text-sm">
              {contact.relationshipType && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{contact.relationshipType}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Notifications: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {contact.notificationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactEditModal
        contact={contact}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchContact}
      />
    </div>
  );
}

