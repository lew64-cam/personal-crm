'use client';

import { useState, useCallback } from 'react';
import { MusicStaff, type ClefType } from './MusicStaff';
import { PianoKeyboard } from './PianoKeyboard';

// ─── Note pools ─────────────────────────────────────────────────────────────

const TREBLE_NOTES = [
  'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4',
  'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5',
];

const BASS_NOTES = [
  'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3',
  'E3', 'F3', 'G3', 'A3', 'B3', 'C4',
];

// ─── Types ───────────────────────────────────────────────────────────────────

type ClefMode = 'treble' | 'bass' | 'both';
type GamePhase = 'setup' | 'playing' | 'reveal' | 'gameover';

interface Player {
  id: number;
  name: string;
  score: number;
}

interface ActiveNote {
  note: string;
  clef: ClefType;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickNote(mode: ClefMode, avoidNote?: string): ActiveNote {
  let result: ActiveNote;
  let attempts = 0;
  do {
    if (mode === 'treble') {
      result = { note: TREBLE_NOTES[Math.floor(Math.random() * TREBLE_NOTES.length)], clef: 'treble' };
    } else if (mode === 'bass') {
      result = { note: BASS_NOTES[Math.floor(Math.random() * BASS_NOTES.length)], clef: 'bass' };
    } else {
      const useTreble = Math.random() < 0.5;
      result = useTreble
        ? { note: TREBLE_NOTES[Math.floor(Math.random() * TREBLE_NOTES.length)], clef: 'treble' }
        : { note: BASS_NOTES[Math.floor(Math.random() * BASS_NOTES.length)], clef: 'bass' };
    }
    attempts++;
  } while (result!.note === avoidNote && attempts < 10);
  return result!;
}

const PLAYER_COLORS = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
];

const PLAYER_LIGHT_COLORS = [
  'bg-indigo-50 border-indigo-300 text-indigo-800',
  'bg-rose-50 border-rose-300 text-rose-800',
  'bg-emerald-50 border-emerald-300 text-emerald-800',
  'bg-amber-50 border-amber-300 text-amber-800',
];

// ─── Setup screen ────────────────────────────────────────────────────────────

interface SetupProps {
  players: Player[];
  clefMode: ClefMode;
  targetScore: number;
  onPlayersChange: (players: Player[]) => void;
  onClefModeChange: (mode: ClefMode) => void;
  onTargetScoreChange: (n: number) => void;
  onStart: () => void;
}

function SetupScreen({
  players,
  clefMode,
  targetScore,
  onPlayersChange,
  onClefModeChange,
  onTargetScoreChange,
  onStart,
}: SetupProps) {
  const setName = (idx: number, name: string) => {
    const next = [...players];
    next[idx] = { ...next[idx], name };
    onPlayersChange(next);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      onPlayersChange([...players, { id: Date.now(), name: `Player ${players.length + 1}`, score: 0 }]);
    }
  };

  const removePlayer = () => {
    if (players.length > 2) {
      onPlayersChange(players.slice(0, -1));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🎹</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Piano Note Battle</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Race to identify notes on the staff — first to the target wins!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
        {/* Clef mode */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Clef
          </label>
          <div className="flex gap-2">
            {(['treble', 'bass', 'both'] as ClefMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onClefModeChange(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize
                  ${clefMode === m
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                  }`}
              >
                {m === 'both' ? 'Both Clefs' : `${m.charAt(0).toUpperCase() + m.slice(1)} Clef`}
              </button>
            ))}
          </div>
        </div>

        {/* Target score */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Points to win
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => onTargetScoreChange(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${targetScore === n
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Players */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Players ({players.length})
            </label>
            <div className="flex gap-2">
              <button
                onClick={removePlayer}
                disabled={players.length <= 2}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                  hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
              >
                −
              </button>
              <button
                onClick={addPlayer}
                disabled={players.length >= 4}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                  hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${PLAYER_COLORS[i]}`} />
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => setName(i, e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none
                    focus:ring-2 focus:ring-indigo-500"
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
            text-base transition-colors shadow-md"
        >
          Start Game 🎵
        </button>
      </div>
    </div>
  );
}

// ─── Game Over screen ────────────────────────────────────────────────────────

interface GameOverProps {
  players: Player[];
  onPlayAgain: () => void;
}

function GameOverScreen({ players, onPlayAgain }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {winner.name} wins!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Great game, everyone!</p>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
        {sorted.map((p, i) => {
          const origIdx = players.indexOf(p);
          return (
            <div
              key={p.id}
              className={`flex items-center gap-4 px-6 py-4 ${i < sorted.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
            >
              <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '4️⃣'}</span>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${PLAYER_COLORS[origIdx]}`} />
              <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">{p.name}</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{p.score}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={onPlayAgain}
        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
          text-base transition-colors shadow-md"
      >
        Play Again
      </button>
    </div>
  );
}

// ─── Main game component ─────────────────────────────────────────────────────

export function PianoNoteGame() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', score: 0 },
    { id: 2, name: 'Player 2', score: 0 },
  ]);
  const [clefMode, setClefMode] = useState<ClefMode>('treble');
  const [targetScore, setTargetScore] = useState(10);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentNote, setCurrentNote] = useState<ActiveNote | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const handleStart = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setCurrentPlayerIdx(0);
    setSelectedNote(null);
    setWasCorrect(null);
    setCurrentNote(pickNote(clefMode));
    setPhase('playing');
  }, [clefMode]);

  const handleKeyClick = useCallback(
    (clicked: string) => {
      if (phase !== 'playing' || !currentNote) return;
      const correct = clicked === currentNote.note;
      setSelectedNote(clicked);
      setWasCorrect(correct);

      if (correct) {
        setPlayers((prev) => {
          const next = [...prev];
          next[currentPlayerIdx] = { ...next[currentPlayerIdx], score: next[currentPlayerIdx].score + 1 };
          return next;
        });
      }
      setPhase('reveal');
    },
    [phase, currentNote, currentPlayerIdx],
  );

  const handleNext = useCallback(() => {
    // players here reflects the latest score because handleNext is recreated after the score update
    if (players.some((p) => p.score >= targetScore)) {
      setPhase('gameover');
      return;
    }
    const nextIdx = (currentPlayerIdx + 1) % players.length;
    setCurrentPlayerIdx(nextIdx);
    setCurrentNote(pickNote(clefMode, currentNote?.note));
    setSelectedNote(null);
    setWasCorrect(null);
    setPhase('playing');
  }, [players, targetScore, currentPlayerIdx, clefMode, currentNote]);

  // ── Setup phase ────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <SetupScreen
        players={players}
        clefMode={clefMode}
        targetScore={targetScore}
        onPlayersChange={setPlayers}
        onClefModeChange={setClefMode}
        onTargetScoreChange={setTargetScore}
        onStart={handleStart}
      />
    );
  }

  // ── Game over phase ────────────────────────────────────────────────────────
  if (phase === 'gameover') {
    return <GameOverScreen players={players} onPlayAgain={() => setPhase('setup')} />;
  }

  // ── Playing / Reveal phase ─────────────────────────────────────────────────
  const currentPlayer = players[currentPlayerIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Scoreboard */}
      <div className="flex gap-3 flex-wrap justify-center">
        {players.map((p, i) => {
          const isActive = i === currentPlayerIdx;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all
                ${isActive
                  ? `${PLAYER_LIGHT_COLORS[i]} border-2 shadow-md scale-105`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${PLAYER_COLORS[i]}`} />
              <span>{p.name}</span>
              <span className="font-bold text-base ml-1">{p.score}</span>
              <span className="text-xs opacity-60">/ {targetScore}</span>
            </div>
          );
        })}
      </div>

      {/* Turn indicator */}
      <div className="text-center">
        {phase === 'playing' ? (
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-white text-sm font-semibold ${PLAYER_COLORS[currentPlayerIdx]}`}
            >
              {currentPlayer.name}
            </span>
            &nbsp;— click the correct piano key!
          </p>
        ) : (
          <p className={`font-bold text-lg ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {wasCorrect
              ? `✓ Correct! +1 for ${currentPlayer.name}`
              : `✗ Wrong — the note was ${currentNote?.note}`}
          </p>
        )}
      </div>

      {/* Staff card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 pb-2">
        <div className="flex items-center justify-between mb-1 px-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {currentNote?.clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}
          </span>
          <span className="text-xs text-gray-400">What note is this?</span>
        </div>
        <MusicStaff
          note={currentNote?.note ?? null}
          clef={currentNote?.clef ?? 'treble'}
          showAnswer={phase === 'reveal'}
        />
      </div>

      {/* Piano keyboard card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        <PianoKeyboard
          onKeyClick={handleKeyClick}
          correctNote={phase === 'reveal' ? currentNote?.note : null}
          wrongNote={phase === 'reveal' && !wasCorrect ? selectedNote : null}
          disabled={phase === 'reveal'}
        />
      </div>

      {/* Next / back to setup */}
      {phase === 'reveal' && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPhase('setup')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600
              dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Settings
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
              text-sm transition-colors shadow-md"
          >
            Next note →
          </button>
        </div>
      )}
    </div>
  );
}
