// Notificações locais do lembrete diário (Android/iOS). Na web o Metro usa scheduler.web.ts.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const remindersSupported = true;

const CHANNEL_ID = 'lembretes';
const ID_PREFIX = 'sequencia-';
const HOUR = 19;
const DAYS_AHEAD = 7;

let configured = false;

/** Mostra o lembrete também com o app aberto. Chamar uma vez, na raiz. */
export function configureReminders(): void {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Lembrete diário',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Pede a permissão de notificação. No Android 13+, o pedido só aparece depois que o canal existe. */
export async function requestReminderPermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const answer = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  return answer.granted;
}

export async function cancelReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(ID_PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

const days = (n: number) => (n === 1 ? '1 dia' : `${n} dias`);

function messageFor(offset: number, practicedToday: boolean, streak: number): string {
  if (streak > 0 && offset === 0) return `Sua sequência de ${days(streak)} acaba hoje se você não tocar. Bora?`;
  if (streak > 0 && offset === 1 && practicedToday) return `Sua sequência de ${days(streak)} continua com uma aula hoje.`;
  return 'Uma aula curta já mantém o ritmo. Bora tocar?';
}

type ScheduleInput = { practicedToday: boolean; streak: number };

/** Agenda os lembretes dos próximos dias às 19h, pulando hoje se a pessoa já tocou. */
export async function scheduleReminders({ practicedToday, streak }: ScheduleInput): Promise<void> {
  await ensureChannel();
  await cancelReminders();
  const now = new Date();
  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    if (offset === 0 && practicedToday) continue;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, HOUR, 0, 0);
    if (date <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}${offset}`,
      content: { title: 'Hora do violão 🎸', body: messageFor(offset, practicedToday, streak) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
    });
  }
}
