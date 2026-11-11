import { useEffect, type ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { buzz } from '@/audio/engine';
import { C, R } from '@/theme';

type BtnProps = {
  label: string;
  onPress: () => void;
  color?: string;
  dark?: string;
  textColor?: string;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  small?: boolean;
};

/** Botão "3D" de jogo: a face afunda sobre a base ao ser pressionada. */
export function Btn({ label, onPress, color = C.gold, dark = C.goldDark, textColor = '#1A1200', disabled, icon, style, small }: BtnProps) {
  const depth = small ? 4 : 6;
  const press = useSharedValue(0);
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * depth }] }));
  const bg = disabled ? C.locked : color;
  const base = disabled ? C.lockedDark : dark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPressIn={() => (press.value = withTiming(1, { duration: 60 }))}
      onPressOut={() => (press.value = withSpring(0, { damping: 12, stiffness: 300 }))}
      onPress={() => {
        buzz('tap');
        onPress();
      }}
      style={[{ paddingBottom: depth }, style]}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, top: depth, bottom: 0, backgroundColor: base, borderRadius: R.md }} />
      <Animated.View
        style={[
          { backgroundColor: bg, borderRadius: R.md, paddingVertical: small ? 10 : 15, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
          face,
        ]}
      >
        {icon ? <Text style={{ fontSize: small ? 15 : 18 }}>{icon}</Text> : null}
        <Text style={{ color: disabled ? C.muted : textColor, fontWeight: '900', fontSize: small ? 14 : 16, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function ProgressBar({ value, color = C.green, height = 14 }: { value: number; color?: string; height?: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withSpring(Math.max(0, Math.min(1, value)), { damping: 18, stiffness: 120 });
  }, [value, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, backgroundColor: C.border, borderRadius: R.pill, overflow: 'hidden', flex: 1 }}>
      <Animated.View style={[{ height, backgroundColor: color, borderRadius: R.pill }, fill]}>
        <View style={{ height: height * 0.3, marginTop: height * 0.18, marginHorizontal: 6, borderRadius: R.pill, backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </Animated.View>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ backgroundColor: C.card, borderRadius: R.lg, borderWidth: 2, borderColor: C.border, padding: 16 }, style]}>{children}</View>;
}

export function Stat({ icon, value, color = C.text }: { icon: string; value: string | number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.card, borderRadius: R.pill, borderWidth: 2, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 6 }}>
      <Text style={{ fontSize: 15 }}>{icon}</Text>
      <Text style={{ color, fontWeight: '900', fontSize: 15 }}>{value}</Text>
    </View>
  );
}
