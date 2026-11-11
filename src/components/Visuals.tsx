import { Text, View } from 'react-native';
import { playSound, type Sound } from '@/audio/engine';
import type { Visual } from '@/data/curriculum';
import { CHORDS, STRING_NAMES } from '@/data/music';
import { C, R } from '@/theme';
import { FretGrid } from './FretGrid';
import { Btn } from './ui';

const COUNT = ['1', 'e', '2', 'e', '3', 'e', '4', 'e'];

/** Levada em colcheias: D = baixo, U = cima, . = mão passa sem tocar. */
export function StrumPattern({ pattern, active = -1, hits }: { pattern: string; active?: number; hits?: (boolean | undefined)[] }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      {pattern.split('').map((ch, i) => {
        const on = i === active;
        const hit = hits?.[i];
        const bg = hit === true ? C.green : hit === false ? C.red : on ? C.gold : C.cardHi;
        return (
          <View key={i} style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ width: 36, height: 52, borderRadius: R.sm, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? C.gold : C.border }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: ch === '.' ? C.muted : on || hit !== undefined ? '#1A1200' : C.text }}>
                {ch === 'D' ? '↓' : ch === 'U' ? '↑' : '·'}
              </Text>
            </View>
            <Text style={{ color: i % 2 === 0 ? C.text : C.muted, fontWeight: '800', fontSize: 12 }}>{COUNT[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Strings() {
  return (
    <View style={{ gap: 7, alignSelf: 'stretch' }}>
      {STRING_NAMES.map((n, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: C.muted, fontWeight: '800', width: 24 }}>{6 - i}ª</Text>
          <View style={{ flex: 1, height: 6 - i * 0.8, backgroundColor: '#D9CFA6', borderRadius: 3 }} />
          <Text style={{ color: C.gold, fontWeight: '900', width: 62 }}>
            {n} ({'EADGBE'[i]})
          </Text>
        </View>
      ))}
    </View>
  );
}

export function VisualView({ visual, color }: { visual: Visual; color?: string }) {
  if (visual.chord && CHORDS[visual.chord]) {
    const ch = CHORDS[visual.chord];
    return <FretGrid frets={ch.frets} barre={ch.barre} color={color} />;
  }
  if (visual.dots) return <FretGrid dots={visual.dots} baseFret={visual.baseFret} numFrets={visual.numFrets} color={color ?? C.cyan} />;
  if (visual.pattern) return <StrumPattern pattern={visual.pattern} />;
  if (visual.strings) return <Strings />;
  return null;
}

export function ListenBtn({ sound, label = 'Ouvir' }: { sound: Sound; label?: string }) {
  return <Btn small icon="🔊" label={label} color={C.cyan} dark="#0E93A8" onPress={() => playSound(sound)} />;
}
