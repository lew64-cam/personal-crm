'use client';

export type ClefType = 'treble' | 'bass';

interface MusicStaffProps {
  note: string | null;
  clef: ClefType;
  showAnswer?: boolean;
}

// y-coordinates in the SVG viewBox (0 0 520 240) for each note
// Staff lines are at y: 80 (line 5, top) → 100 → 120 (middle) → 140 → 160 (line 1, bottom)
const TREBLE_NOTE_Y: Record<string, number> = {
  B3: 190,
  C4: 180,
  D4: 170,
  E4: 160,
  F4: 150,
  G4: 140,
  A4: 130,
  B4: 120,
  C5: 110,
  D5: 100,
  E5: 90,
  F5: 80,
  G5: 70,
  A5: 60,
};

const BASS_NOTE_Y: Record<string, number> = {
  E2: 180,
  F2: 170,
  G2: 160,
  A2: 150,
  B2: 140,
  C3: 130,
  D3: 120,
  E3: 110,
  F3: 100,
  G3: 90,
  A3: 80,
  B3: 70,
  C4: 60,
};

const STAFF_LINES = [80, 100, 120, 140, 160];
const MIDDLE_LINE_Y = 120;
const LEDGER_Y_ABOVE = 60;
const LEDGER_Y_BELOW = 180;
const NOTE_X = 320;
const STAFF_X1 = 130;
const STAFF_X2 = 490;

export function MusicStaff({ note, clef, showAnswer = false }: MusicStaffProps) {
  const yMap = clef === 'treble' ? TREBLE_NOTE_Y : BASS_NOTE_Y;
  const noteY = note ? (yMap[note] ?? null) : null;

  const needsLedgerAbove = noteY !== null && noteY <= LEDGER_Y_ABOVE;
  const needsLedgerBelow = noteY !== null && noteY >= LEDGER_Y_BELOW;
  // Notes on or below the middle line get stem up; above middle line get stem down
  const stemUp = noteY !== null && noteY >= MIDDLE_LINE_Y;

  return (
    <svg viewBox="0 0 520 240" className="w-full max-w-2xl mx-auto select-none">
      {/* Staff lines */}
      {STAFF_LINES.map((y) => (
        <line key={y} x1={STAFF_X1} y1={y} x2={STAFF_X2} y2={y} stroke="#1f2937" strokeWidth="1.5" />
      ))}

      {/* Clef symbol */}
      {clef === 'treble' ? (
        <text
          x="102"
          y="183"
          fontSize="112"
          fontFamily="'Times New Roman', Times, serif"
          fill="#1f2937"
          aria-hidden="true"
        >
          {'𝄞'}
        </text>
      ) : (
        <text
          x="108"
          y="132"
          fontSize="68"
          fontFamily="'Times New Roman', Times, serif"
          fill="#1f2937"
          aria-hidden="true"
        >
          {'𝄢'}
        </text>
      )}

      {/* Note rendering */}
      {note && noteY !== null && (
        <>
          {/* Ledger line above staff (A5 treble, C4 bass) */}
          {needsLedgerAbove && (
            <line
              x1={NOTE_X - 20}
              y1={LEDGER_Y_ABOVE}
              x2={NOTE_X + 20}
              y2={LEDGER_Y_ABOVE}
              stroke="#1f2937"
              strokeWidth="1.5"
            />
          )}

          {/* Ledger line below staff (C4 treble, E2 bass) */}
          {needsLedgerBelow && (
            <line
              x1={NOTE_X - 20}
              y1={LEDGER_Y_BELOW}
              x2={NOTE_X + 20}
              y2={LEDGER_Y_BELOW}
              stroke="#1f2937"
              strokeWidth="1.5"
            />
          )}

          {/* Stem */}
          {stemUp ? (
            <line
              x1={NOTE_X + 11}
              y1={noteY - 5}
              x2={NOTE_X + 11}
              y2={noteY - 42}
              stroke="#1f2937"
              strokeWidth="1.8"
            />
          ) : (
            <line
              x1={NOTE_X - 11}
              y1={noteY + 5}
              x2={NOTE_X - 11}
              y2={noteY + 42}
              stroke="#1f2937"
              strokeWidth="1.8"
            />
          )}

          {/* Note head — filled, slightly tilted ellipse */}
          <ellipse
            cx={NOTE_X}
            cy={noteY}
            rx="11.5"
            ry="8"
            fill="#1f2937"
            transform={`rotate(-15, ${NOTE_X}, ${noteY})`}
          />

          {/* Answer reveal label */}
          {showAnswer && (
            <text
              x={NOTE_X}
              y="222"
              textAnchor="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#16a34a"
              fontFamily="system-ui, sans-serif"
            >
              {note}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
