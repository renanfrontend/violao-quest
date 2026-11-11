import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, ProgressBar } from '@/components/ui';
import { ALL_LEVELS, WORLDS } from '@/data/curriculum';
import { XP_PER_LEVEL, liveStreak, playerLevel, useGame } from '@/store/game';
import { C, F, R } from '@/theme';

type Snapshot = { xp: number; stars: Record<string, number>; streak: number; bestCombo: number; lessonsPlayed: number };

const worldDone = (i: number, s: Snapshot) => WORLDS[i].levels.every((l) => s.stars[l.id]);
const ACHIEVEMENTS: { icon: string; title: string; desc: string; test: (s: Snapshot) => boolean }[] = [
  { icon: '🎸', title: 'Primeira nota', desc: 'Conclua sua primeira aula', test: (s) => s.lessonsPlayed >= 1 },
  { icon: '🔥', title: 'Pegando fogo', desc: 'Pratique 3 dias seguidos', test: (s) => s.streak >= 3 },
  { icon: '📅', title: 'Semana perfeita', desc: 'Pratique 7 dias seguidos', test: (s) => s.streak >= 7 },
  { icon: '⚡', title: 'Combo x10', desc: 'Acerte 10 seguidas em uma aula', test: (s) => s.bestCombo >= 10 },
  { icon: '⭐', title: 'Perfeccionista', desc: 'Tire 3 estrelas em 10 fases', test: (s) => Object.values(s.stars).filter((n) => n === 3).length >= 10 },
  { icon: '🌱', title: 'Deu os primeiros passos', desc: 'Conclua o Mundo 1', test: (s) => worldDone(0, s) },
  { icon: '🎵', title: 'Roda de violão', desc: 'Conclua o Mundo 2', test: (s) => worldDone(1, s) },
  { icon: '🧗', title: 'Venceu a pestana', desc: 'Conclua o Mundo 4', test: (s) => worldDone(3, s) },
  { icon: '💯', title: '1000 XP', desc: 'Acumule 1000 pontos de experiência', test: (s) => s.xp >= 1000 },
  { icon: '👑', title: 'Mestre das Cordas', desc: 'Conclua todos os mundos', test: (s) => WORLDS.every((_, i) => worldDone(i, s)) },
];

export default function Profile() {
  const insets = useSafeAreaInsets();
  const g = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const lv = playerLevel(g.xp);
  const snap: Snapshot = { ...g, streak: liveStreak(g.streak, g.lastDay) };
  const done = Object.keys(g.stars).length;
  const unlocked = ACHIEVEMENTS.filter((a) => a.test(snap)).length;

  const stats: [string, string | number, string][] = [
    ['🔥', snap.streak, 'dias seguidos'],
    ['⚡', g.xp, 'XP total'],
    ['🗺️', `${done}/${ALL_LEVELS.length}`, 'fases'],
    ['⭐', Object.values(g.stars).reduce((a, b) => a + b, 0), 'estrelas'],
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
      <Card style={{ alignItems: 'center', gap: 8 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: C.cardHi, borderWidth: 4, borderColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 44 }}>🧑‍🎤</Text>
        </View>
        <Text style={F.h1}>{lv.rank}</Text>
        <Text style={{ color: C.gold, fontWeight: '900' }}>NÍVEL {lv.level}</Text>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', gap: 10 }}>
          <ProgressBar value={lv.progress} color={C.gold} />
          <Text style={F.small}>
            {lv.into}/{XP_PER_LEVEL} XP
          </Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(([icon, value, label]) => (
          <Card key={label} style={{ flexGrow: 1, flexBasis: '45%', padding: 14 }}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 24 }}>{value}</Text>
            <Text style={F.small}>{label}</Text>
          </Card>
        ))}
      </View>

      <Text style={F.h2}>
        Conquistas <Text style={{ color: C.muted }}>{unlocked}/{ACHIEVEMENTS.length}</Text>
      </Text>
      <View style={{ gap: 8 }}>
        {ACHIEVEMENTS.map((a) => {
          const ok = a.test(snap);
          return (
            <View
              key={a.title}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, borderWidth: 2, borderColor: ok ? C.gold : C.border, backgroundColor: ok ? 'rgba(255,182,39,0.1)' : C.card }}
            >
              <Text style={{ fontSize: 30, opacity: ok ? 1 : 0.3 }}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: ok ? C.gold : C.text, fontWeight: '900', fontSize: 15 }}>{a.title}</Text>
                <Text style={F.small}>{a.desc}</Text>
              </View>
              <Text style={{ fontSize: 18 }}>{ok ? '✅' : '🔒'}</Text>
            </View>
          );
        })}
      </View>

      <Text style={F.h2}>Ajustes</Text>
      <Card style={{ gap: 14 }}>
        {(
          [
            ['sound', '🔊 Sons'],
            ['haptics', '📳 Vibração'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[F.body, { fontWeight: '700' }]}>{label}</Text>
            <Switch accessibilityLabel={label} value={g[key]} onValueChange={() => g.toggle(key)} trackColor={{ true: C.green, false: C.border }} thumbColor={C.text} />
          </View>
        ))}
        <Btn
          small
          label={confirmReset ? 'Toque de novo para apagar tudo' : 'Zerar progresso'}
          color={confirmReset ? C.red : C.cardHi}
          dark={confirmReset ? C.redDark : C.border}
          textColor={confirmReset ? '#2B0510' : C.muted}
          onPress={() => {
            if (!confirmReset) return setConfirmReset(true);
            g.reset();
            setConfirmReset(false);
          }}
        />
      </Card>
    </ScrollView>
  );
}
