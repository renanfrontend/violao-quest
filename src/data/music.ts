import type { Access } from './access';

// Índice 0 = 6ª corda (Mi grave) ... índice 5 = 1ª corda (Mi agudo).
export const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
export const STRING_NAMES = ['Mi', 'Lá', 'Ré', 'Sol', 'Si', 'Mi'];
export const NOTE_NAMES = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'];
export const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type ChordGroup = 'Abertos' | 'Sétimas' | 'Pestanas' | 'Power chords' | 'Tétrades';

/** No plano grátis, o dicionário traz só os acordes abertos. */
export const CHORD_GROUP_ACCESS: Record<ChordGroup, Access> = {
  Abertos: 'free',
  Sétimas: 'premium',
  Pestanas: 'premium',
  'Power chords': 'premium',
  Tétrades: 'premium',
};
export type Chord = {
  name: string;
  full: string;
  /** Casa de cada corda, da 6ª para a 1ª. -1 = não tocar, 0 = solta. */
  frets: number[];
  barre?: number;
  group: ChordGroup;
};

const c = (name: string, full: string, s: string, group: ChordGroup, barre?: number): Chord => ({
  name,
  full,
  frets: s.split('').map((ch) => (ch === 'x' ? -1 : Number(ch))),
  barre,
  group,
});

export const CHORD_LIST: Chord[] = [
  c('Em', 'Mi menor', '022000', 'Abertos'),
  c('Am', 'Lá menor', 'x02210', 'Abertos'),
  c('E', 'Mi maior', '022100', 'Abertos'),
  c('A', 'Lá maior', 'x02220', 'Abertos'),
  c('D', 'Ré maior', 'xx0232', 'Abertos'),
  c('Dm', 'Ré menor', 'xx0231', 'Abertos'),
  c('G', 'Sol maior', '320003', 'Abertos'),
  c('C', 'Dó maior', 'x32010', 'Abertos'),
  c('A7', 'Lá com sétima', 'x02020', 'Sétimas'),
  c('D7', 'Ré com sétima', 'xx0212', 'Sétimas'),
  c('E7', 'Mi com sétima', '020100', 'Sétimas'),
  c('B7', 'Si com sétima', 'x21202', 'Sétimas'),
  c('G7', 'Sol com sétima', '320001', 'Sétimas'),
  c('F', 'Fá maior', '133211', 'Pestanas', 1),
  c('Fm', 'Fá menor', '133111', 'Pestanas', 1),
  c('G (pestana)', 'Sol maior, formato de E', '355433', 'Pestanas', 3),
  c('Bm', 'Si menor', 'x24432', 'Pestanas', 2),
  c('B', 'Si maior', 'x24442', 'Pestanas', 2),
  c('C#m', 'Dó sustenido menor', 'x46654', 'Pestanas', 4),
  c('E5', 'Power chord de Mi', '022xxx', 'Power chords'),
  c('A5', 'Power chord de Lá', 'x022xx', 'Power chords'),
  c('G5', 'Power chord de Sol', '355xxx', 'Power chords'),
  c('Cmaj7', 'Dó com sétima maior', 'x32000', 'Tétrades'),
  c('Am7', 'Lá menor com sétima', 'x02010', 'Tétrades'),
  c('Dm7', 'Ré menor com sétima', 'xx0211', 'Tétrades'),
  c('Em7', 'Mi menor com sétima', '020000', 'Tétrades'),
  c('Fmaj7', 'Fá com sétima maior', 'xx3210', 'Tétrades'),
];

export const CHORDS: Record<string, Chord> = Object.fromEntries(CHORD_LIST.map((ch) => [ch.name, ch]));

export function chordMidi(ch: Chord): number[] {
  return ch.frets.map((f, i) => (f < 0 ? -1 : OPEN_MIDI[i] + f)).filter((m) => m >= 0);
}

export function midiAt(stringIdx: number, fret: number): number {
  return OPEN_MIDI[stringIdx] + fret;
}

export function noteName(midi: number): string {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

/** Primeira casa exibida no diagrama. */
export function baseFretOf(frets: number[], numFrets = 5): number {
  const used = frets.filter((f) => f > 0);
  if (!used.length) return 1;
  const max = Math.max(...used);
  return max <= numFrets ? 1 : Math.min(...used);
}
