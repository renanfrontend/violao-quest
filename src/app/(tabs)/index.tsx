import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz } from '@/audio/engine';
import { ProgressBar, Stat } from '@/components/ui';
import { ALL_LEVELS, WORLDS, isUnlocked, type Level, type World } from '@/data/curriculum';
import { liveStreak, playerLevel, useGame } from '@/store/game';
import { C, F, R } from '@/theme';

const ZIGZAG = [0, 56, 84, 56, 0, -56];

function Node({ level, world, index, state, stars }: { level: Level; world: World; index: number; state: 'locked' | 'current' | 'done'; stars: number }) {
  const router = useRouter();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (state !== 'current') return;
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1);
  }, [state, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const locked = state === 'locked';
  const size = level.boss ? 92 : 78;
  const face = locked ? C.locked : world.color;
  const base = locked ? C.lockedDark : world.dark;

  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: ZIGZAG[index % ZIGZAG.length] }], marginVertical: 9 }}>
      {state === 'current' && (
        <View style={{ backgroundColor: C.text, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 6 }}>
          <Text style={{ color: world.dark, fontWeight: '900', fontSize: 12, letterSpacing: 1 }}>COMEÇAR</Text>
        </View>
      )}
      <Animated.View style={anim}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${level.title}${locked ? ', bloqueada' : ''}`}
          disabled={locked}
          onPress={() => {
            buzz('tap');
            router.push({ pathname: '/lesson/[id]', params: { id: level.id } });
          }}
          style={({ pressed }) => ({ width: size, height: size + 8, paddingTop: pressed ? 6 : 0 })}
        >
          <View style={{ position: 'absolute', top: 8, width: size, height: size, borderRadius: size / 2, backgroundColor: base }} />
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: face,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: level.boss ? 4 : 0,
              borderColor: locked ? C.border : C.gold,
            }}
          >
            <Text style={{ fontSize: level.boss ? 40 : 32, opacity: locked ? 0.35 : 1 }}>{locked ? '🔒' : level.icon}</Text>
          </View>
        </Pressable>
      </Animated.View>
      <Text numberOfLines={2} style={{ color: locked ? C.muted : C.text, fontWeight: '800', fontSize: 13, marginTop: 6, maxWidth: 150, textAlign: 'center' }}>
        {level.title}
      </Text>
      {state === 'done' && <Text style={{ fontSize: 13, letterSpacing: 2 }}>{'⭐'.repeat(stars)}<Text style={{ opacity: 0.25 }}>{'⭐'.repeat(3 - stars)}</Text></Text>}
    </View>
  );
}

export default function Journey() {
  const insets = useSafeAreaInsets();
  const { xp, stars, streak, lastDay } = useGame();
  const lv = playerLevel(xp);
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  const currentId = ALL_LEVELS.find((l) => !stars[l.id])?.id;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10, borderBottomWidth: 2, borderColor: C.border, backgroundColor: C.bg2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: C.text }}>
            Violão <Text style={{ color: C.gold }}>Quest</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Stat icon="🔥" value={liveStreak(streak, lastDay)} color={C.red} />
            <Stat icon="⭐" value={totalStars} color={C.gold} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: C.gold, fontWeight: '900', fontSize: 13 }}>NÍVEL {lv.level}</Text>
          <ProgressBar value={lv.progress} color={C.gold} height={12} />
          <Text style={{ color: C.muted, fontWeight: '800', fontSize: 12 }}>{lv.rank}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        {WORLDS.map((world, wi) => {
          const done = world.levels.filter((l) => stars[l.id]).length;
          return (
            <View key={world.id}>
              <View style={{ margin: 16, marginBottom: 8, backgroundColor: world.color, borderRadius: R.lg, padding: 16, borderBottomWidth: 6, borderColor: world.dark }}>
                <Text style={{ color: 'rgba(0,0,0,0.6)', fontWeight: '900', fontSize: 12, letterSpacing: 1.2 }}>
                  MUNDO {wi + 1}  ·  {world.tier.toUpperCase()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#14101F', fontWeight: '900', fontSize: 22, flex: 1 }}>{world.title}</Text>
                  <Text style={{ fontSize: 34 }}>{world.icon}</Text>
                </View>
                <Text style={{ color: 'rgba(0,0,0,0.65)', fontWeight: '800', marginTop: 4 }}>
                  {done} de {world.levels.length} fases
                </Text>
              </View>
              {world.levels.map((level, i) => {
                const state = stars[level.id] ? 'done' : level.id === currentId && isUnlocked(level.id, stars) ? 'current' : 'locked';
                return <Node key={level.id} level={level} world={world} index={i} state={state} stars={stars[level.id] ?? 0} />;
              })}
            </View>
          );
        })}
        <Text style={[F.small, { textAlign: 'center', marginTop: 24 }]}>Pratique 10 minutos por dia. Constância vence talento. 🎸</Text>
      </ScrollView>
    </View>
  );
}
