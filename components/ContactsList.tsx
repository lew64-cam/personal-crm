'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Filter, Tag, Building, MapPin } from 'lucide-react';
import Link from 'next/link';
import { QuickAddModal } from './QuickAddModal';
import { parseTags } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  relationshipType?: string;
  tags: string;
  lastContacted?: string;
}

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [search, filterType, filterTag, filterCompany]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('relationshipType', filterType);
      if (filterTag) params.append('tag', filterTag);
      if (filterCompany) params.append('company', filterCompany);

      const response = await fetch(`/api/contacts?${params.toString()}`);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const relationshipTypes = [...new Set(contacts.map(c => c.relationshipType).filter(Boolean))];
  const tags = [...new Set(contacts.flatMap(c => parseTags(c.tags)))];
  const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            {relationshipTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {contact.name}
              </h3>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {contact.email && (
                  <p className="truncate">{contact.email}</p>
                )}
                {contact.phone && (
                  <p>{contact.phone}</p>
                )}
                {contact.company && (
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{contact.company}</span>
                  </div>
                )}
                {contact.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{contact.location}</span>
                  </div>
                )}
                {contact.relationshipType && (
                  <p className="text-xs mt-2">
                    <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                      {contact.relationshipType}
                    </span>
                  </p>
                )}
                {parseTags(contact.tags).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {parseTags(contact.tags).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} onSuccess={fetchContacts} />
    </div>
  );
}

