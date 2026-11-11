import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, playNote, playSfx } from '@/audio/engine';
import { Btn, Card } from '@/components/ui';
import { OPEN_MIDI, STRING_NAMES } from '@/data/music';
import { C, F, R } from '@/theme';

function Tuner() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <Card style={{ gap: 12 }}>
      <Text style={F.h2}>🎚️ Afinador de referência</Text>
      <Text style={F.small}>Toque em uma corda, ouça a nota e gire a tarraxa do seu violão até os dois sons ficarem iguais.</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {OPEN_MIDI.map((midi, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`Tocar ${6 - i}ª corda, ${STRING_NAMES[i]}`}
            onPress={() => {
              buzz('tap');
              setActive(i);
              playNote(midi);
            }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12,
              borderRadius: R.md,
              borderWidth: 2,
              borderBottomWidth: 5,
              borderColor: active === i ? C.gold : C.border,
              backgroundColor: active === i ? 'rgba(255,182,39,0.15)' : C.cardHi,
            }}
          >
            <Text style={{ color: active === i ? C.gold : C.text, fontWeight: '900', fontSize: 22 }}>{'EADGBE'[i]}</Text>
            <Text style={{ color: C.muted, fontWeight: '800', fontSize: 11 }}>{STRING_NAMES[i]}</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>{6 - i}ª</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function Metronome() {
  const [bpm, setBpm] = useState(80);
  const [on, setOn] = useState(false);
  const [beat, setBeat] = useState(-1);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    if (!on) {
      setBeat(-1);
      return;
    }
    let n = 0;
    let nextAt = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (now < nextAt) return;
      playSfx(n % 4 === 0 ? 'tock' : 'tick');
      setBeat(n % 4);
      n++;
      nextAt += 60000 / bpmRef.current;
      if (nextAt < now) nextAt = now + 60000 / bpmRef.current;
    }, 10);
    return () => clearInterval(id);
  }, [on]);

  const change = (d: number) => setBpm((b) => Math.max(40, Math.min(200, b + d)));
  const tempo = bpm < 66 ? 'Lento' : bpm < 100 ? 'Moderado' : bpm < 140 ? 'Rápido' : 'Muito rápido';

  return (
    <Card style={{ gap: 14 }}>
      <Text style={F.h2}>⏱️ Metrônomo</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: beat === i ? (i === 0 ? C.gold : C.cyan) : C.border, transform: [{ scale: beat === i ? 1.25 : 1 }] }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Btn small label="-5" onPress={() => change(-5)} color={C.cardHi} dark={C.border} textColor={C.text} />
        <Btn small label="-1" onPress={() => change(-1)} color={C.cardHi} dark={C.border} textColor={C.text} />
        <View style={{ alignItems: 'center', width: 104 }}>
          <Text style={{ color: C.text, fontSize: 44, fontWeight: '900' }}>{bpm}</Text>
          <Text style={[F.small, { fontSize: 11 }]} numberOfLines={1}>BPM · {tempo}</Text>
        </View>
        <Btn small label="+1" onPress={() => change(1)} color={C.cardHi} dark={C.border} textColor={C.text} />
        <Btn small label="+5" onPress={() => change(5)} color={C.cardHi} dark={C.border} textColor={C.text} />
      </View>
      <Btn label={on ? 'Parar' : 'Iniciar'} icon={on ? '⏹️' : '▶️'} onPress={() => setOn((v) => !v)} color={on ? C.red : C.green} dark={on ? C.redDark : C.greenDark} />
    </Card>
  );
}

export default function Tools() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
      <Text style={F.h1}>Ferramentas</Text>
      <Tuner />
      <Metronome />
    </ScrollView>
  );
}
