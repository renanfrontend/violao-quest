import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

type GameState = {
  xp: number;
  stars: Record<string, number>;
  streak: number;
  lastDay: string | null;
  bestCombo: number;
  lessonsPlayed: number;
  sound: boolean;
  haptics: boolean;
  /** Lembrete diário da sequência ligado (com permissão de notificação concedida). */
  reminders: boolean;
  /** O app já pediu a permissão de notificação uma vez. */
  remindersAsked: boolean;
  /** A oferta do Premium depois da primeira aula já apareceu. */
  premiumOfferSeen: boolean;
  completeLevel: (id: string, stars: number, xp: number, combo: number) => void;
  toggle: (key: 'sound' | 'haptics') => void;
  setReminders: (on: boolean) => void;
  markRemindersAsked: () => void;
  markPremiumOfferSeen: () => void;
  reset: () => void;
};

const initial = {
  xp: 0,
  stars: {} as Record<string, number>,
  streak: 0,
  lastDay: null as string | null,
  bestCombo: 0,
  lessonsPlayed: 0,
  sound: true,
  haptics: true,
  reminders: false,
  remindersAsked: false,
  premiumOfferSeen: false,
};

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      ...initial,
      completeLevel: (id, stars, xp, combo) =>
        set((s) => {
          const today = dayKey();
          const yesterday = dayKey(new Date(Date.now() - 86400000));
          const streak = s.lastDay === today ? s.streak : s.lastDay === yesterday ? s.streak + 1 : 1;
          return {
            xp: s.xp + xp,
            stars: { ...s.stars, [id]: Math.max(s.stars[id] ?? 0, stars) },
            streak,
            lastDay: today,
            bestCombo: Math.max(s.bestCombo, combo),
            lessonsPlayed: s.lessonsPlayed + 1,
          };
        }),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<GameState>),
      setReminders: (on) => set({ reminders: on }),
      markRemindersAsked: () => set({ remindersAsked: true }),
      markPremiumOfferSeen: () => set({ premiumOfferSeen: true }),
      reset: () => set({ ...initial }),
    }),
    { name: 'violao-quest-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** A sequência só vale se a última aula foi hoje ou ontem. */
export function liveStreak(streak: number, lastDay: string | null): number {
  if (!lastDay) return 0;
  const today = dayKey();
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  return lastDay === today || lastDay === yesterday ? streak : 0;
}

export const XP_PER_LEVEL = 120;
const RANKS: [number, string][] = [
  [1, 'Aprendiz'],
  [3, 'Trovador'],
  [6, 'Violeiro'],
  [10, 'Solista'],
  [15, 'Virtuose'],
  [20, 'Lenda das Cordas'],
];

export function playerLevel(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const rank = [...RANKS].reverse().find(([min]) => level >= min)![1];
  return { level, rank, into: xp % XP_PER_LEVEL, progress: (xp % XP_PER_LEVEL) / XP_PER_LEVEL };
}
