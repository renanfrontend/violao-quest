import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, playSound } from '@/audio/engine';
import { FretGrid } from '@/components/FretGrid';
import { CHORD_LIST, type ChordGroup } from '@/data/music';
import { C, F, R } from '@/theme';

const GROUPS: [ChordGroup, string][] = [
  ['Abertos', C.cyan],
  ['Sétimas', C.gold],
  ['Pestanas', '#FB923C'],
  ['Power chords', C.red],
  ['Tétrades', '#A78BFA'],
];

const GRID = { maxWidth: 720, padX: 16, gap: 12, minCard: 170, cardPad: 10, border: 2 } as const;

/** Colunas que preenchem a largura útil (no mínimo 2) e a largura do diagrama dentro de cada card. */
function gridLayout(windowWidth: number) {
  const content = Math.min(windowWidth, GRID.maxWidth) - GRID.padX * 2;
  const cols = Math.max(2, Math.floor((content + GRID.gap) / (GRID.minCard + GRID.gap)));
  const card = Math.floor((content - GRID.gap * (cols - 1)) / cols);
  return { card, diagram: card - (GRID.cardPad + GRID.border) * 2 };
}

export default function Chords() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { card, diagram } = gridLayout(width);
  const [group, setGroup] = useState<ChordGroup>('Abertos');
  const color = GROUPS.find(([g]) => g === group)![1];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 16, gap: 4 }}>
        <Text style={F.h1}>Dicionário de acordes</Text>
        <Text style={F.small}>Toque em um acorde para ouvir.</Text>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 8 }}>
          {GROUPS.map(([g, col]) => (
            <Pressable
              key={g}
              accessibilityRole="button"
              onPress={() => setGroup(g)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill, borderWidth: 2, borderColor: g === group ? col : C.border, backgroundColor: g === group ? col : C.card }}
            >
              <Text style={{ fontWeight: '900', color: g === group ? '#14101F' : C.muted }}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={{
          width: '100%',
          maxWidth: GRID.maxWidth,
          alignSelf: 'center',
          paddingHorizontal: GRID.padX,
          paddingBottom: 32,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: GRID.gap,
        }}
      >
        {CHORD_LIST.filter((ch) => ch.group === group).map((ch) => (
          <Pressable
            key={ch.name}
            accessibilityRole="button"
            accessibilityLabel={`Ouvir ${ch.full}`}
            onPress={() => {
              buzz('tap');
              playSound({ chord: ch.name });
            }}
            style={({ pressed }) => ({
              width: card,
              padding: GRID.cardPad,
              alignItems: 'center',
              backgroundColor: pressed ? C.cardHi : C.card,
              borderRadius: R.lg,
              borderWidth: GRID.border,
              borderBottomWidth: pressed ? GRID.border : 5,
              borderColor: C.border,
            })}
          >
            <Text style={{ color, fontWeight: '900', fontSize: 20 }}>{ch.name}</Text>
            <Text numberOfLines={2} style={[F.small, { fontSize: 11, marginBottom: 2, textAlign: 'center' }]}>
              {ch.full}
            </Text>
            <FretGrid frets={ch.frets} barre={ch.barre} width={diagram} color={color} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
