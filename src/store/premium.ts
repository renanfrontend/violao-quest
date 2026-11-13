import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { billing } from '@/billing/adapter';
import { MONETIZATION_ENABLED } from '@/billing/config';
import { type EntitlementSnapshot, FREE_SNAPSHOT } from '@/billing/types';
import { whenHydrated } from './hydration';

type PremiumState = EntitlementSnapshot & { apply: (snapshot: EntitlementSnapshot) => void };

/**
 * Último estado conhecido da assinatura, salvo no aparelho para o app abrir certo mesmo offline.
 * A fonte da verdade é a loja (via RevenueCat); isto é só o cache que a interface lê.
 */
export const usePremium = create<PremiumState>()(
  persist((set) => ({ ...FREE_SNAPSHOT, apply: (snapshot) => set(snapshot) }), {
    name: 'violao-quest-premium-v1',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: ({ premium, trial, expiresAt, manageUrl }) => ({ premium, trial, expiresAt, manageUrl }),
  }),
);

/** Liga a loja ao estado do app. Chamar uma vez, na raiz. */
export async function startBilling(): Promise<void> {
  if (!MONETIZATION_ENABLED || !billing.available) return;
  // Hidratar antes evita que o cache antigo sobrescreva a resposta nova da loja.
  await whenHydrated(usePremium);
  try {
    await billing.start((snapshot) => usePremium.getState().apply(snapshot));
  } catch {
    // Sem rede na abertura: vale o último estado salvo, e o listener atualiza quando a loja responder.
  }
}
