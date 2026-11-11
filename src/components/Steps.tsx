import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { buzz, playNote, playSfx, playSound, strum } from '@/audio/engine';
import type { Step } from '@/data/curriculum';
import { CHORDS, NOTE_NAMES, baseFretOf, midiAt } from '@/data/music';
import { C, F, R } from '@/theme';
import { FretGrid } from './FretGrid';
import { Btn } from './ui';
import { ListenBtn, StrumPattern, VisualView } from './Visuals';

export type StepProps<T extends Step['t']> = {
  step: Extract<Step, { t: T }>;
  color: string;
  done: boolean;
  /** `answer` é mostrado ao aluno quando ele erra. */
  onResult: (ok: boolean, answer?: string) => void;
};

const GRID_W = 230;

function StringLabels({ target }: { target?: number }) {
  return (
    <View style={{ width: GRID_W, flexDirection: 'row', paddingHorizontal: 17.8 }}>
      {[6, 5, 4, 3, 2, 1].map((n) => (
        <Text key={n} style={{ flex: 1, textAlign: 'center', fontWeight: '900', fontSize: 12, color: n === target ? C.gold : C.muted }}>
          {n}ª
        </Text>
      ))}
    </View>
  );
}

function Prompt({ kicker, text }: { kicker: string; text: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={F.label}>{kicker}</Text>
      <Text style={F.h2}>{text}</Text>
    </View>
  );
}

function Options({ options, answer, done, onPick }: { options: string[]; answer: number; done: boolean; onPick: (i: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <View style={{ gap: 10 }}>
      {options.map((o, i) => {
        const isAnswer = done && i === answer;
        const isWrong = done && i === picked && i !== answer;
        return (
          <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(250)}>
            <Pressable
              accessibilityRole="button"
              disabled={done}
              onPress={() => {
                setPicked(i);
                onPick(i);
              }}
              style={{
                borderWidth: 2,
                borderBottomWidth: 5,
                borderColor: isAnswer ? C.green : isWrong ? C.red : C.border,
                backgroundColor: isAnswer ? 'rgba(52,211,153,0.16)' : isWrong ? 'rgba(251,113,133,0.16)' : C.card,
                borderRadius: R.md,
                padding: 15,
              }}
            >
              <Text style={{ color: isAnswer ? C.green : isWrong ? C.red : C.text, fontSize: 16, fontWeight: '700' }}>{o}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

export function TeachStep({ step, color }: StepProps<'teach'>) {
  return (
    <View style={{ gap: 18 }}>
      <Prompt kicker="APRENDA" text={step.title} />
      {step.visual && (
        <View style={{ alignItems: 'center', backgroundColor: C.card, borderRadius: R.lg, borderWidth: 2, borderColor: C.border, padding: 16, gap: 12 }}>
          <VisualView visual={step.visual} color={color} />
          {step.sound && <ListenBtn sound={step.sound} />}
        </View>
      )}
      <Text style={F.body}>{step.body}</Text>
      {!step.visual && step.sound && (
        <View style={{ alignItems: 'flex-start' }}>
          <ListenBtn sound={step.sound} />
        </View>
      )}
    </View>
  );
}

export function QuizStep({ step, color, done, onResult }: StepProps<'quiz'>) {
  return (
    <View style={{ gap: 18 }}>
      <Prompt kicker="PERGUNTA" text={step.q} />
      {step.visual && (
        <View style={{ alignItems: 'center' }}>
          <VisualView visual={step.visual} color={color} />
        </View>
      )}
      <Options options={step.options} answer={step.a} done={done} onPick={(i) => onResult(i === step.a, step.options[step.a])} />
    </View>
  );
}

export function EarStep({ step, done, onResult }: StepProps<'ear'>) {
  useEffect(() => {
    const id = setTimeout(() => playSound(step.sound), 450);
    return () => clearTimeout(id);
  }, [step]);
  return (
    <View style={{ gap: 18 }}>
      <Prompt kicker="DE OUVIDO" text={step.q} />
      <View style={{ alignItems: 'center', paddingVertical: 6 }}>
        <ListenBtn sound={step.sound} label="Ouvir de novo" />
      </View>
      <Options options={step.options} answer={step.a} done={done} onPick={(i) => onResult(i === step.a, step.options[step.a])} />
    </View>
  );
}

export function BuildStep({ step, color, done, onResult }: StepProps<'build'>) {
  const chord = CHORDS[step.chord];
  const [sel, setSel] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [wrong, setWrong] = useState(false);
  const base = baseFretOf(chord.frets);

  const tap = (s: number, f: number) => {
    if (done) return;
    setSel((prev) => {
      const next = [...prev];
      if (f === 0) next[s] = prev[s] === 0 ? -1 : 0;
      else next[s] = prev[s] === f ? 0 : f;
      if (next[s] >= 0) playNote(midiAt(s, next[s]));
      return next;
    });
  };

  const check = () => {
    const ok = sel.every((f, i) => f === chord.frets[i]);
    setWrong(!ok);
    if (ok) playSound({ chord: chord.name });
    onResult(ok, 'veja o desenho correto');
  };

  const showAnswer = done && wrong;
  return (
    <View style={{ gap: 14 }}>
      <Prompt kicker="MONTE O ACORDE" text={`${chord.name}  ·  ${chord.full}`} />
      <Text style={F.small}>
        Toque nas casas para colocar os dedos. Toque no topo de uma corda para alternar entre solta (○) e não tocar (✕).
      </Text>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <FretGrid
          frets={showAnswer ? chord.frets : sel}
          barre={showAnswer ? chord.barre : undefined}
          baseFret={base}
          color={showAnswer ? C.green : color}
          onTap={done ? undefined : tap}
        />
        <StringLabels />
      </View>
      {!done && <Btn label="Verificar" onPress={check} color={C.green} dark={C.greenDark} />}
    </View>
  );
}

export function FindStep({ step, color, done, onResult }: StepProps<'find'>) {
  const [mark, setMark] = useState<{ s: number; f: number; ok: boolean } | null>(null);
  const targetString = 6 - step.string;
  const base = step.baseFret ?? 1;
  const num = step.numFrets ?? 5;

  const tap = (s: number, f: number) => {
    if (done) return;
    if (f === 0 && base > 1) return;
    const midi = midiAt(s, f);
    playNote(midi);
    const ok = s === targetString && midi % 12 === step.pc;
    setMark({ s, f, ok });
    let answer = 0;
    for (let k = base === 1 ? 0 : base; k < base + num; k++) if (midiAt(targetString, k) % 12 === step.pc) answer = k;
    onResult(ok, answer === 0 ? `${step.string}ª corda solta` : `${step.string}ª corda, casa ${answer}`);
  };

  return (
    <View style={{ gap: 14 }}>
      <Prompt kicker="ENCONTRE A NOTA" text={`${NOTE_NAMES[step.pc]} na ${step.string}ª corda`} />
      <Text style={F.small}>Toque na casa certa{base === 1 ? ' (ou no topo da corda, se for corda solta)' : ''}.</Text>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <FretGrid baseFret={base} numFrets={num} mark={mark} color={color} onTap={done ? undefined : tap} />
        <StringLabels target={step.string} />
      </View>
    </View>
  );
}

type Phase = 'idle' | 'count' | 'play' | 'end';

export function RhythmStep({ step, done, onResult }: StepProps<'rhythm'>) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [tick, setTick] = useState(-1);
  const [hits, setHits] = useState<boolean[]>([]);
  const [down, setDown] = useState(false);
  const run = useRef<{ t0: number; hit: boolean[]; timer: ReturnType<typeof setInterval> | null }>({ t0: 0, hit: [], timer: null });

  const eighth = 60000 / step.bpm / 2;
  const COUNT_IN = 8;
  const BARS = 2;
  const TOTAL = COUNT_IN + BARS * 8;
  const windowMs = Math.min(170, eighth * 0.48);
  const expected = Array.from({ length: BARS * 8 }, (_, i) => step.pattern[i % 8] !== '.');
  const totalStrokes = expected.filter(Boolean).length;

  useEffect(() => () => {
    if (run.current.timer) clearInterval(run.current.timer);
  }, []);

  const start = () => {
    const r = run.current;
    r.t0 = performance.now() + 250;
    r.hit = Array(BARS * 8).fill(false);
    setHits([]);
    setTick(-1);
    setPhase('count');
    let last = -1;
    r.timer = setInterval(() => {
      const idx = Math.floor((performance.now() - r.t0) / eighth);
      if (idx === last || idx < 0) return;
      last = idx;
      if (idx >= TOTAL) {
        if (r.timer) clearInterval(r.timer);
        r.timer = null;
        const got = r.hit.filter(Boolean).length;
        setPhase('end');
        onResult(got / totalStrokes >= 0.7, `${got} de ${totalStrokes} batidas no tempo. Precisa de 70%.`);
        return;
      }
      if (idx % 2 === 0) playSfx(idx % 8 === 0 ? 'tock' : 'tick');
      setTick(idx);
      setPhase(idx < COUNT_IN ? 'count' : 'play');
    }, 12);
  };

  const tap = () => {
    const r = run.current;
    if (phase === 'idle' || phase === 'end') return;
    const pos = (performance.now() - r.t0) / eighth - COUNT_IN;
    const near = Math.round(pos);
    const off = Math.abs(pos - near) * eighth;
    const char = step.pattern[((near % 8) + 8) % 8];
    strum(step.chord, char === 'U' ? 'up' : 'down');
    if (near >= 0 && near < expected.length && expected[near] && !r.hit[near] && off <= windowMs) {
      r.hit[near] = true;
      setHits([...r.hit]);
      buzz('tap');
    }
  };

  const press = (v: boolean) => {
    if (phase === 'end' || done) return;
    setDown(v);
    tap();
  };

  const playIdx = tick - COUNT_IN;
  const bar = Math.max(0, Math.min(BARS - 1, Math.floor(playIdx / 8)));
  const barHits = Array.from({ length: 8 }, (_, i) => {
    const k = bar * 8 + i;
    if (phase !== 'play' && phase !== 'end') return undefined;
    if (hits[k]) return true;
    return expected[k] && k < playIdx ? false : undefined;
  });
  const countBeat = phase === 'count' && tick >= 0 ? Math.floor(tick / 2) + 1 : null;

  return (
    <View style={{ gap: 16 }}>
      <Prompt kicker="RITMO" text={`Toque a levada${step.chord ? ` em ${step.chord}` : ''}  ·  ${step.bpm} BPM`} />
      <Text style={F.small}>Ouça a contagem de 4 tempos e toque no botão em cada seta, por 2 compassos. O ponto (·) é silêncio.</Text>
      <StrumPattern pattern={step.pattern} active={phase === 'play' ? playIdx % 8 : -1} hits={barHits} />
      <View style={{ alignItems: 'center', height: 34, justifyContent: 'center' }}>
        {countBeat !== null && <Text style={{ color: C.gold, fontSize: 30, fontWeight: '900' }}>{countBeat}</Text>}
        {phase === 'play' && <Text style={{ color: C.muted, fontWeight: '800' }}>Compasso {bar + 1} de {BARS}</Text>}
      </View>
      {phase === 'idle' && !done ? (
        <Btn label="Começar" icon="▶️" onPress={start} />
      ) : (
        <View
          accessibilityRole="button"
          accessibilityLabel="Bater nas cordas"
          // Toque direto (sem Pressable): o Pressable atrasa ou ignora toques muito rápidos, e aqui cada milissegundo conta.
          onTouchStart={() => press(true)}
          onTouchEnd={() => setDown(false)}
          onPointerDown={(e) => e.nativeEvent.pointerType === 'mouse' && press(true)}
          onPointerUp={() => setDown(false)}
          style={{
            height: 150,
            borderRadius: R.lg,
            backgroundColor: down ? C.gold : C.cardHi,
            borderWidth: 3,
            borderBottomWidth: down ? 3 : 8,
            marginTop: down ? 5 : 0,
            borderColor: C.gold,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: phase === 'end' || done ? 0.4 : 1,
          }}
        >
          <Text style={{ fontSize: 44 }}>🎸</Text>
          <Text style={{ color: C.text, fontWeight: '900', letterSpacing: 1 }}>TOQUE AQUI</Text>
        </View>
      )}
    </View>
  );
}
