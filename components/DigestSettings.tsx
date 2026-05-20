'use client';

import { useEffect, useState } from 'react';
import { Mail, Save } from 'lucide-react';

interface DigestPrefs {
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestEmail: string;
  digestSendHour: number;
  digestDayOfWeek: number;
  userEmail?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function DigestSettings() {
  const [prefs, setPrefs] = useState<DigestPrefs>({
    digestEnabled: false,
    digestFrequency: 'weekly',
    digestEmail: '',
    digestSendHour: 9,
    digestDayOfWeek: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/digest/preferences')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setPrefs({
            digestEnabled: data.digestEnabled ?? false,
            digestFrequency: data.digestFrequency ?? 'weekly',
            digestEmail: data.digestEmail || data.userEmail || '',
            digestSendHour: data.digestSendHour ?? 9,
            digestDayOfWeek: data.digestDayOfWeek ?? 1,
          });
        } else if (data?.userEmail) {
          setPrefs((p) => ({ ...p, digestEmail: data.userEmail }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/digest/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const hourLabel = (h: number) => {
    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';
    return `${h - 12}:00 PM`;
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400 text-sm">Loading digest settings…</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Digest</h2>
      </div>

      <div className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Enable digest emails</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Get a summary of who to reach out to and upcoming birthdays
            </p>
          </div>
          <button
            onClick={() => setPrefs((p) => ({ ...p, digestEnabled: !p.digestEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.digestEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow ${
                prefs.digestEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {prefs.digestEnabled && (
          <>
            {/* Email address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Send to
              </label>
              <input
                type="email"
                value={prefs.digestEmail}
                onChange={(e) => setPrefs((p) => ({ ...p, digestEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={prefs.digestFrequency}
                onChange={(e) => setPrefs((p) => ({ ...p, digestFrequency: e.target.value as 'daily' | 'weekly' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Day of week (weekly only) */}
            {prefs.digestFrequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Send on
                </label>
                <select
                  value={prefs.digestDayOfWeek}
                  onChange={(e) => setPrefs((p) => ({ ...p, digestDayOfWeek: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
            )}

            {/* Send hour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Send at (UTC)
              </label>
              <select
                value={prefs.digestSendHour}
                onChange={(e) => setPrefs((p) => ({ ...p, digestSendHour: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
