import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import type { Dot } from '@/data/curriculum';
import { baseFretOf } from '@/data/music';
import { C } from '@/theme';

type Props = {
  /** Casa por corda (6ª → 1ª); -1 = não tocar, 0 = solta. */
  frets?: number[];
  dots?: Dot[];
  barre?: number;
  baseFret?: number;
  numFrets?: number;
  width?: number;
  color?: string;
  /** Marca uma posição com cor de acerto/erro. */
  mark?: { s: number; f: number; ok: boolean } | null;
  onTap?: (stringIdx: number, fret: number) => void;
};

/** Diagrama vertical do braço: serve para mostrar acordes/escalas e para os desafios de toque. */
export function FretGrid({ frets, dots, barre, baseFret, numFrets = 5, width = 230, color = C.gold, mark, onTap }: Props) {
  const base = baseFret ?? (frets ? baseFretOf(frets, numFrets) : 1);
  const padX = 34;
  const top = 40;
  const gapX = (width - padX * 2) / 5;
  const gapY = width * 0.19;
  const height = top + gapY * numFrets + 16;
  const x = (s: number) => padX + s * gapX;
  const y = (f: number) => top + (f - base + 0.5) * gapY;
  const r = gapX * 0.34;
  const visible = (f: number) => f >= base && f < base + numFrets;

  const barreStrings = barre && frets ? frets.map((f, i) => (f >= barre ? i : -1)).filter((i) => i >= 0) : [];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Rect x={padX} y={top} width={gapX * 5} height={gapY * numFrets} fill="#2A1F14" rx={4} />
        {Array.from({ length: numFrets + 1 }, (_, i) => (
          <Line
            key={`f${i}`}
            x1={padX}
            x2={padX + gapX * 5}
            y1={top + i * gapY}
            y2={top + i * gapY}
            stroke={i === 0 && base === 1 ? '#F5F3FF' : '#8A8170'}
            strokeWidth={i === 0 && base === 1 ? 6 : 2}
          />
        ))}
        {Array.from({ length: 6 }, (_, s) => (
          <Line key={`s${s}`} x1={x(s)} x2={x(s)} y1={top} y2={top + gapY * numFrets} stroke="#D9CFA6" strokeWidth={3.2 - s * 0.4} />
        ))}
        {base > 1 && (
          <SvgText x={padX - 12} y={top + gapY * 0.5 + 5} fill={C.muted} fontSize={13} fontWeight="bold" textAnchor="end">
            {base}ª
          </SvgText>
        )}

        {frets?.map((f, s) =>
          f <= 0 ? (
            <SvgText key={`h${s}`} x={x(s)} y={top - 14} fill={f < 0 ? C.red : C.text} fontSize={16} fontWeight="bold" textAnchor="middle">
              {f < 0 ? '✕' : '○'}
            </SvgText>
          ) : null,
        )}

        {barre && barreStrings.length > 1 && visible(barre) && (
          <Rect
            x={x(barreStrings[0]) - r}
            y={y(barre) - r * 0.8}
            width={x(barreStrings[barreStrings.length - 1]) - x(barreStrings[0]) + r * 2}
            height={r * 1.6}
            rx={r * 0.8}
            fill={color}
            opacity={0.55}
          />
        )}

        {frets?.map((f, s) => (f > 0 && visible(f) ? <Circle key={`d${s}`} cx={x(s)} cy={y(f)} r={r} fill={color} /> : null))}

        {dots?.map(([s, f, root], i) =>
          f === 0 ? (
            <Circle key={`o${i}`} cx={x(s)} cy={top - 18} r={r * 0.75} fill="none" stroke={root ? C.gold : color} strokeWidth={3} />
          ) : visible(f) ? (
            <Circle key={`o${i}`} cx={x(s)} cy={y(f)} r={r} fill={root ? C.gold : color} />
          ) : null,
        )}

        {mark &&
          (mark.f === 0 ? (
            <Circle cx={x(mark.s)} cy={top - 18} r={r * 0.9} fill={mark.ok ? C.green : C.red} />
          ) : (
            <Circle cx={x(mark.s)} cy={y(mark.f)} r={r * 1.1} fill={mark.ok ? C.green : C.red} />
          ))}
      </Svg>

      {onTap &&
        Array.from({ length: 6 }, (_, s) => (
          <View key={`t${s}`} style={{ position: 'absolute', left: x(s) - gapX / 2, top: 0, width: gapX, height }}>
            <Pressable
              accessibilityRole="button" accessibilityLabel={`Corda ${6 - s} solta`}
              onPress={() => onTap(s, 0)}
              style={{ height: top, alignItems: 'center', justifyContent: 'center' }}
            >
              {!frets && !mark && <View style={{ width: r * 1.3, height: r * 1.3, borderRadius: r, borderWidth: 2, borderColor: C.border }} />}
            </Pressable>
            {Array.from({ length: numFrets }, (_, i) => (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Corda ${6 - s}, casa ${base + i}`} onPress={() => onTap(s, base + i)} style={{ height: gapY }} />
            ))}
          </View>
        ))}
    </View>
  );
}
