import { PianoNoteGame } from '@/components/piano-game/PianoNoteGame';

export const metadata = {
  title: 'Piano Note Battle',
  description: 'Multiplayer piano note reading game — treble & bass clef',
};

export default function PianoGamePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4">
      <PianoNoteGame />
    </main>
  );
}
