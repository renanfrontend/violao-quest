import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { CHORDS, chordMidi } from '@/data/music';
import { MIDI_MAX, MIDI_MIN, NOTE_SAMPLES, SFX_SAMPLES } from './samples';

export type Sound = { chord?: string; notes?: number[]; gap?: number };
type Sfx = keyof typeof SFX_SAMPLES;

const players = new Map<string, AudioPlayer>();
let timers: ReturnType<typeof setTimeout>[] = [];
let enabled = { sound: true, haptics: true };
let modeSet = false;

export function configureAudio(opts: { sound: boolean; haptics: boolean }) {
  enabled = opts;
}

function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

function trigger(key: string, source: number, volume = 1) {
  if (!enabled.sound) return;
  ensureMode();
  try {
    let p = players.get(key);
    if (!p) {
      p = createAudioPlayer(source);
      players.set(key, p);
      p.volume = volume;
      p.play();
      return;
    }
    p.volume = volume;
    const again = p;
    again
      .seekTo(0)
      .then(() => again.play())
      .catch(() => {});
  } catch {
    // Sem áudio disponível: o app continua funcionando em silêncio.
  }
}

export function playNote(midi: number, volume = 1) {
  if (midi < MIDI_MIN || midi > MIDI_MAX) return;
  trigger(`n${midi}`, NOTE_SAMPLES[midi], volume);
}

export function playSfx(name: Sfx) {
  trigger(name, SFX_SAMPLES[name], 0.9);
}

export function stopScheduled() {
  timers.forEach(clearTimeout);
  timers = [];
}

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms));
}

export function strum(chordName: string | undefined, dir: 'down' | 'up' = 'down', stagger = 26) {
  const midis = chordName && CHORDS[chordName] ? chordMidi(CHORDS[chordName]) : [40, 45, 50, 55, 59, 64];
  const order = dir === 'down' ? midis : [...midis].reverse().slice(0, 4);
  order.forEach((m, i) => later(() => playNote(m, 0.85), i * stagger));
}

export function playSound(s: Sound) {
  stopScheduled();
  if (s.chord) strum(s.chord, 'down', 45);
  else if (s.notes) s.notes.forEach((m, i) => later(() => playNote(m), i * (s.gap ?? 320)));
}

export function buzz(kind: 'tap' | 'ok' | 'fail' | 'win' = 'tap') {
  if (!enabled.haptics || Platform.OS === 'web') return;
  const N = Haptics.NotificationFeedbackType;
  if (kind === 'tap') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else
    Haptics.notificationAsync(kind === 'fail' ? N.Error : kind === 'ok' ? N.Success : N.Success).catch(() => {});
}
