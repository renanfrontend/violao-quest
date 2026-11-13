// O navegador não recebe o lembrete diário: as funções existem para manter a mesma interface.
export const remindersSupported = false;

export function configureReminders(): void {}

export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function cancelReminders(): Promise<void> {}

export async function scheduleReminders(_input: { practicedToday: boolean; streak: number }): Promise<void> {}
