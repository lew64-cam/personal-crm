'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import type { CalendarEvent } from '@/app/api/calendar/route';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_STYLES: Record<CalendarEvent['type'], string> = {
  birthday: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
  reach_out: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
  interaction: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
};

const EVENT_LABELS: Record<CalendarEvent['type'], string> = {
  birthday: 'Birthday',
  reach_out: 'Reach Out',
  interaction: 'Interaction',
};

export function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [listView, setListView] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, month]);

  const goToPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const goToNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  // Build day grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setListView(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
          >
            {listView ? <CalendarIcon className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {listView ? 'Grid' : 'List'}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-lg font-semibold text-gray-900 dark:text-white w-48 text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={goToNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading events…</div>
      ) : listView ? (
        <ListView events={events} todayStr={todayStr} />
      ) : (
        <GridView cells={cells} eventsByDate={eventsByDate} year={year} month={month} todayStr={todayStr} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6">
        {(Object.keys(EVENT_STYLES) as CalendarEvent['type'][]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${EVENT_STYLES[type]}`}>
              {EVENT_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridView({
  cells,
  eventsByDate,
  year,
  month,
  todayStr,
}: {
  cells: (number | null)[];
  eventsByDate: Record<string, CalendarEvent[]>;
  year: number;
  month: number;
  todayStr: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30" />;
          }
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              className="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 p-1"
            >
              <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                isToday
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/contacts/${ev.contactId}`}
                    className={`block text-xs px-1 py-0.5 rounded truncate font-medium transition-opacity hover:opacity-80 ${EVENT_STYLES[ev.type]}`}
                    title={ev.label}
                  >
                    {ev.contactName}
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ events, todayStr }: { events: CalendarEvent[]; todayStr: string }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        No events this month.
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!grouped[ev.date]) grouped[ev.date] = [];
    grouped[ev.date].push(ev);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, evs]) => {
        const d = new Date(date + 'T12:00:00');
        const isToday = date === todayStr;
        return (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className={`text-sm font-semibold mb-3 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {isToday ? 'Today — ' : ''}{d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2">
              {evs.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/contacts/${ev.contactId}`}
                  className="flex items-center gap-3 group"
                >
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${EVENT_STYLES[ev.type]}`}>
                    {EVENT_LABELS[ev.type]}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ev.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
