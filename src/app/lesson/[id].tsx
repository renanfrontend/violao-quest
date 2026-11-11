import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, playSfx, stopScheduled } from '@/audio/engine';
import { BuildStep, EarStep, FindStep, QuizStep, RhythmStep, TeachStep } from '@/components/Steps';
import { Btn, ProgressBar } from '@/components/ui';
import { findLevel, stepsFor, type Step } from '@/data/curriculum';
import { liveStreak, useGame } from '@/store/game';
import { C, F, R } from '@/theme';

const MAX_HEARTS = 3;
const PRAISE = ['Mandou bem!', 'Isso aí!', 'Perfeito!', 'Na mosca!', 'Que ouvido!'];

type Result = { ok: boolean; answer?: string } | null;

export default function Lesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const found = findLevel(String(id));
  const completeLevel = useGame((s) => s.completeLevel);

  const [attempt, setAttempt] = useState(0);
  const initial = useMemo(() => (found ? stepsFor(found.level, found.world) : []), [found?.level.id, attempt]);
  const [queue, setQueue] = useState<Step[]>(initial);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [result, setResult] = useState<Result>(null);
  const [finished, setFinished] = useState<null | { stars: number; xp: number }>(null);

  useEffect(() => {
    setQueue(initial);
    setIndex(0);
    setHearts(MAX_HEARTS);
    setCombo(0);
    setBestCombo(0);
    setResult(null);
    setFinished(null);
  }, [initial]);

  useEffect(() => () => stopScheduled(), []);
  const exit = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!found) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={F.h2}>Aula não encontrada</Text>
        <Btn label="Voltar" onPress={exit} />
      </View>
    );
  }

  const { level, world } = found;
  const step = queue[index];
  const failed = hearts <= 0;

  const onResult = (ok: boolean, answer?: string) => {
    if (result) return;
    setResult({ ok, answer });
    if (ok) {
      playSfx('correct');
      buzz('ok');
      const c = combo + 1;
      setCombo(c);
      setBestCombo((b) => Math.max(b, c));
    } else {
      playSfx('wrong');
      buzz('fail');
      setCombo(0);
      setHearts((h) => h - 1);
      // Quem erra revê o exercício no fim da aula (uma única vez).
      if (index < initial.length) setQueue((q) => [...q, step]);
    }
  };

  const next = () => {
    stopScheduled();
    setResult(null);
    if (index + 1 >= queue.length) {
      const stars = hearts;
      const xp = (level.boss ? 30 : 15) + stars * 5 + Math.min(bestCombo, 10);
      completeLevel(level.id, stars, xp, bestCombo);
      setFinished({ stars, xp });
      playSfx('win');
      buzz('win');
    } else {
      setIndex(index + 1);
    }
  };

  if (finished || failed) {
    return (
      <EndScreen
        won={!!finished}
        stars={finished?.stars ?? 0}
        xp={finished?.xp ?? 0}
        combo={bestCombo}
        title={level.title}
        color={world.color}
        dark={world.dark}
        onExit={exit}
        onRetry={() => setAttempt((a) => a + 1)}
      />
    );
  }

  const common = { color: world.color, done: !!result, onResult };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da aula" hitSlop={12} onPress={exit}>
          <Text style={{ color: C.muted, fontSize: 24, fontWeight: '900' }}>✕</Text>
        </Pressable>
        <ProgressBar value={index / queue.length} color={world.color} />
        <Text style={{ fontSize: 15, fontWeight: '900', color: C.red }}>{'❤️'.repeat(hearts)}{'🖤'.repeat(MAX_HEARTS - hearts)}</Text>
      </View>
      {combo >= 2 && (
        <Animated.Text key={combo} entering={ZoomIn.duration(200)} style={{ textAlign: 'center', color: C.gold, fontWeight: '900' }}>
          🔥 Combo x{combo}
        </Animated.Text>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <Animated.View key={`${attempt}-${index}`} entering={FadeInDown.duration(280)}>
          {step.t === 'teach' && <TeachStep step={step} {...common} />}
          {step.t === 'quiz' && <QuizStep step={step} {...common} />}
          {step.t === 'ear' && <EarStep step={step} {...common} />}
          {step.t === 'build' && <BuildStep step={step} {...common} />}
          {step.t === 'find' && <FindStep step={step} {...common} />}
          {step.t === 'rhythm' && <RhythmStep step={step} {...common} />}
        </Animated.View>
      </ScrollView>

      {step.t === 'teach' ? (
        <View style={{ padding: 16, paddingBottom: insets.bottom + 16, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
          <Btn label="Continuar" onPress={next} color={world.color} dark={world.dark} />
        </View>
      ) : result ? (
        <Animated.View
          entering={SlideInDown.duration(220)}
          style={{
            backgroundColor: result.ok ? '#0F2E26' : '#3A1420',
            borderTopWidth: 3,
            borderColor: result.ok ? C.green : C.red,
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View style={{ maxWidth: 560, width: '100%', alignSelf: 'center', gap: 12 }}>
            <View>
              <Text style={{ color: result.ok ? C.green : C.red, fontSize: 20, fontWeight: '900' }}>
                {result.ok ? PRAISE[index % PRAISE.length] : 'Quase!'}
              </Text>
              {!result.ok && result.answer && <Text style={{ color: C.text, marginTop: 2 }}>Resposta: {result.answer}</Text>}
            </View>
            <Btn
              label="Continuar"
              onPress={next}
              color={result.ok ? C.green : C.red}
              dark={result.ok ? C.greenDark : C.redDark}
              textColor={result.ok ? '#04231A' : '#2B0510'}
            />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

type EndProps = { won: boolean; stars: number; xp: number; combo: number; title: string; color: string; dark: string; onExit: () => void; onRetry: () => void };

function EndScreen({ won, stars, xp, combo, title, color, dark, onExit, onRetry }: EndProps) {
  const insets = useSafeAreaInsets();
  const streak = useGame((s) => liveStreak(s.streak, s.lastDay));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, justifyContent: 'center' }}>
      <View style={{ maxWidth: 480, width: '100%', alignSelf: 'center', gap: 22, alignItems: 'center' }}>
        <Animated.Text entering={ZoomIn.springify()} style={{ fontSize: 76 }}>
          {won ? '🏆' : '💔'}
        </Animated.Text>
        <Text style={[F.h1, { textAlign: 'center' }]}>{won ? 'Aula concluída!' : 'Acabaram as vidas'}</Text>
        <Text style={[F.small, { textAlign: 'center', fontSize: 15 }]}>{won ? title : 'Errar faz parte do treino. Respire e tente de novo.'}</Text>

        {won && (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[1, 2, 3].map((n) => (
                <Animated.Text key={n} entering={ZoomIn.delay(250 + n * 220).springify()} style={{ fontSize: 52, opacity: n <= stars ? 1 : 0.2 }}>
                  ⭐
                </Animated.Text>
              ))}
            </View>
            <Animated.View entering={FadeIn.delay(1100)} style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
              {[
                ['XP', `+${xp}`, C.gold],
                ['COMBO', `x${combo}`, C.cyan],
                ['SEQUÊNCIA', `${streak} 🔥`, C.red],
              ].map(([label, value, col]) => (
                <View key={label} style={{ flex: 1, borderWidth: 2, borderColor: col, borderRadius: R.md, overflow: 'hidden' }}>
                  <Text style={{ backgroundColor: col, color: '#14101F', textAlign: 'center', fontWeight: '900', fontSize: 11, paddingVertical: 4, letterSpacing: 1 }}>{label}</Text>
                  <Text style={{ color: col, textAlign: 'center', fontWeight: '900', fontSize: 20, paddingVertical: 10 }}>{value}</Text>
                </View>
              ))}
            </Animated.View>
          </>
        )}

        <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 8 }}>
          {won ? (
            <Btn label="Continuar" onPress={onExit} color={color} dark={dark} />
          ) : (
            <>
              <Btn label="Tentar de novo" icon="🔄" onPress={onRetry} />
              <Btn label="Voltar ao mapa" onPress={onExit} color={C.cardHi} dark={C.border} textColor={C.text} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
