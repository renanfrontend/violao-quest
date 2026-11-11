import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { configureAudio } from '@/audio/engine';
import { useGame } from '@/store/game';
import { C } from '@/theme';

export default function RootLayout() {
  const sound = useGame((s) => s.sound);
  const haptics = useGame((s) => s.haptics);
  useEffect(() => configureAudio({ sound, haptics }), [sound, haptics]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
