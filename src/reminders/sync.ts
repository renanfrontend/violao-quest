import { dayKey, liveStreak, useGame } from '@/store/game';
import { whenHydrated } from '@/store/hydration';
import { cancelReminders, remindersSupported, requestReminderPermission, scheduleReminders } from './scheduler';

/** Recalcula os lembretes a partir do progresso salvo. */
export async function syncReminders(): Promise<void> {
  if (!remindersSupported) return;
  await whenHydrated(useGame);
  const { reminders, streak, lastDay } = useGame.getState();
  try {
    if (!reminders) return await cancelReminders();
    await scheduleReminders({ practicedToday: lastDay === dayKey(), streak: liveStreak(streak, lastDay) });
  } catch {
    // Agenda de notificações indisponível (ex.: permissão revogada): o app segue sem lembrete.
  }
}

/** Liga ou desliga pelo Perfil. Devolve false quando o aparelho nega a permissão. */
export async function setRemindersEnabled(on: boolean): Promise<boolean> {
  if (on && !(await requestReminderPermission().catch(() => false))) return false;
  useGame.getState().setReminders(on);
  await syncReminders();
  return true;
}

/** Depois de cada aula: na segunda aula concluída o app pede a permissão; em todas, reagenda. */
export async function afterLessonCompleted(): Promise<void> {
  if (!remindersSupported) return;
  const game = useGame.getState();
  if (game.lessonsPlayed >= 2 && !game.remindersAsked) {
    game.markRemindersAsked();
    if (await requestReminderPermission().catch(() => false)) useGame.getState().setReminders(true);
  }
  await syncReminders();
}
