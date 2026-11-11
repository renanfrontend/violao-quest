import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';
import { C } from '@/theme';

const icon = (emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
        tabBarStyle: { backgroundColor: C.bg2, borderTopColor: C.border, borderTopWidth: 2, height: 68, paddingTop: 6, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Jornada', tabBarIcon: icon('🗺️') }} />
      <Tabs.Screen name="chords" options={{ title: 'Acordes', tabBarIcon: icon('🎼') }} />
      <Tabs.Screen name="tools" options={{ title: 'Ferramentas', tabBarIcon: icon('🎛️') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon('🏅') }} />
    </Tabs>
  );
}
