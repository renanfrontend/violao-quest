// Gera os sons do app (notas de violão sintetizadas + efeitos) como WAV.
// Uso: node scripts/gen-audio.mjs
// Síntese aditiva: cada harmônico decai em ritmo próprio, o que dá o timbre
// de corda dedilhada com afinação exata em qualquer taxa de amostragem.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'audio');
const SR = 22050;
const MIDI_MIN = 40; // E2 (6ª corda solta)
const MIDI_MAX = 76; // E5 (1ª corda, 12ª casa)

mkdirSync(OUT, { recursive: true });

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

function normalize(buf, peak = 0.8) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  return buf.map((v) => (v / (max || 1)) * peak);
}

function pluck(midi, dur = 1.8) {
  const f0 = 440 * 2 ** ((midi - 69) / 12);
  const n = Math.floor(SR * dur);
  const out = new Float64Array(n);
  const pickPos = 0.17; // posição da palhetada na corda
  const inharm = 0.00012;
  for (let h = 1; h <= 40; h++) {
    const f = f0 * h * Math.sqrt(1 + inharm * h * h);
    if (f > SR / 2 - 500) break;
    const amp = Math.abs(Math.sin(Math.PI * h * pickPos)) / h ** 1.15;
    const decay = 1.1 + 0.32 * h + f0 / 500;
    const phase = h * 0.7;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      out[i] += amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * f * t + phase);
    }
  }
  const attack = Math.floor(SR * 0.003);
  const release = Math.floor(SR * 0.05);
  for (let i = 0; i < attack; i++) out[i] *= i / attack;
  for (let i = 0; i < release; i++) out[n - 1 - i] *= i / release;
  return normalize(Array.from(out));
}

function tone(freqs, dur, { type = 'sine', decay = 6, gap = 0 } = {}) {
  const out = [];
  for (const f of freqs) {
    const n = Math.floor(SR * dur);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const ph = 2 * Math.PI * f * t;
      let v = Math.sin(ph);
      if (type === 'soft') v = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph);
      if (type === 'buzz') v = Math.sign(Math.sin(ph)) * 0.5 + Math.sin(ph) * 0.5;
      const env = Math.min(1, i / (SR * 0.004)) * Math.exp(-decay * t);
      out.push(v * env);
    }
    for (let i = 0; i < SR * gap; i++) out.push(0);
  }
  return normalize(out, 0.6);
}

const files = [];
for (let m = MIDI_MIN; m <= MIDI_MAX; m++) {
  const name = `n${m}.wav`;
  writeFileSync(join(OUT, name), wav(pluck(m)));
  files.push(name);
}

const sfx = {
  correct: tone([659.25, 987.77], 0.13, { type: 'soft', decay: 9 }),
  wrong: tone([196, 155.56], 0.16, { type: 'buzz', decay: 8 }),
  win: tone([523.25, 659.25, 783.99, 1046.5], 0.14, { type: 'soft', decay: 5 }),
  tick: tone([1000], 0.05, { decay: 60 }),
  tock: tone([1600], 0.05, { decay: 60 }),
};
for (const [k, v] of Object.entries(sfx)) writeFileSync(join(OUT, `${k}.wav`), wav(v));

// Mapa estático exigido pelo bundler (require não pode ser dinâmico).
const lines = [
  '// ARQUIVO GERADO por scripts/gen-audio.mjs. Não edite à mão.',
  `export const MIDI_MIN = ${MIDI_MIN};`,
  `export const MIDI_MAX = ${MIDI_MAX};`,
  'export const NOTE_SAMPLES: Record<number, number> = {',
  ...files.map((f) => `  ${f.slice(1, -4)}: require('../../assets/audio/${f}'),`),
  '};',
  'export const SFX_SAMPLES = {',
  ...Object.keys(sfx).map((k) => `  ${k}: require('../../assets/audio/${k}.wav'),`),
  '} as const;',
  '',
];
mkdirSync(join(ROOT, 'src', 'audio'), { recursive: true });
writeFileSync(join(ROOT, 'src', 'audio', 'samples.ts'), lines.join('\n'));
console.log(`OK: ${files.length} notas + ${Object.keys(sfx).length} efeitos em assets/audio`);
