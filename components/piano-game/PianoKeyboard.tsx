'use client';

// Piano from C2 to C6 — 29 white keys, 20 black keys
const WW = 28;   // white key width (px)
const WH = 130;  // white key height
const BW = 17;   // black key width
const BH = 84;   // black key height

// Black key left-edge offsets in px from the start of each octave
// Based on 2/3 of WW into the left white key
const BLACK_OFFSETS: Record<string, number> = {
  'C#': 19,
  'D#': 47,
  'F#': 103,
  'G#': 131,
  'A#': 159,
};

const WHITE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OCTAVES = [2, 3, 4, 5];
const PIANO_WIDTH = 29 * WW; // 812px

interface PianoKey {
  note: string;
  x: number;
  isBlack: boolean;
}

function buildKeys(): PianoKey[] {
  const keys: PianoKey[] = [];
  for (const oct of OCTAVES) {
    const ox = (oct - 2) * 7 * WW;
    WHITE_NAMES.forEach((name, i) => {
      keys.push({ note: `${name}${oct}`, x: ox + i * WW, isBlack: false });
    });
    Object.entries(BLACK_OFFSETS).forEach(([name, offset]) => {
      keys.push({ note: `${name}${oct}`, x: ox + offset, isBlack: true });
    });
  }
  // Final C6
  keys.push({ note: 'C6', x: 4 * 7 * WW, isBlack: false });
  return keys;
}

const ALL_KEYS = buildKeys();
const WHITE_KEYS = ALL_KEYS.filter((k) => !k.isBlack);
const BLACK_KEYS = ALL_KEYS.filter((k) => k.isBlack);

interface PianoKeyboardProps {
  onKeyClick: (note: string) => void;
  correctNote?: string | null;
  wrongNote?: string | null;
  disabled?: boolean;
}

export function PianoKeyboard({
  onKeyClick,
  correctNote,
  wrongNote,
  disabled = false,
}: PianoKeyboardProps) {
  const whiteFill = (note: string) => {
    if (note === correctNote) return '#86efac'; // green-300
    if (note === wrongNote) return '#fca5a5';   // red-300
    return '#ffffff';
  };

  const blackFill = (note: string) => {
    if (note === correctNote) return '#16a34a'; // green-600
    if (note === wrongNote) return '#dc2626';   // red-600
    return '#1f2937';                           // gray-800
  };

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${PIANO_WIDTH} ${WH + 18}`}
        style={{ width: `${PIANO_WIDTH}px`, minWidth: `${PIANO_WIDTH}px`, height: `${WH + 18}px` }}
        className="block"
      >
        {/* White keys rendered first */}
        {WHITE_KEYS.map((key) => (
          <g
            key={key.note}
            onClick={() => !disabled && onKeyClick(key.note)}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
          >
            <rect
              x={key.x + 0.5}
              y={0.5}
              width={WW - 1}
              height={WH - 1}
              fill={whiteFill(key.note)}
              stroke="#9ca3af"
              strokeWidth="1"
              rx="2"
            />
            {/* Label every C note with octave number */}
            {key.note.startsWith('C') && (
              <text
                x={key.x + WW / 2}
                y={WH - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
                fontFamily="system-ui, sans-serif"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {key.note}
              </text>
            )}
          </g>
        ))}

        {/* Black keys rendered on top */}
        {BLACK_KEYS.map((key) => (
          <g
            key={key.note}
            onClick={() => !disabled && onKeyClick(key.note)}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
          >
            <rect
              x={key.x}
              y={0}
              width={BW}
              height={BH}
              fill={blackFill(key.note)}
              rx="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
