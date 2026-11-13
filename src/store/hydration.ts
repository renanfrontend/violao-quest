import { useEffect, useState } from 'react';

/** O pedaço da API do middleware `persist` do Zustand que usamos aqui. */
type Persisted = { persist: { hasHydrated(): boolean; onFinishHydration(listener: () => void): () => void } };

/** Resolve quando o estado salvo no aparelho já foi carregado na store. */
export function whenHydrated(store: Persisted): Promise<void> {
  return new Promise((resolve) => {
    if (store.persist.hasHydrated()) return resolve();
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export function useHydrated(store: Persisted): boolean {
  const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated());
  useEffect(() => {
    if (hydrated) return;
    let alive = true;
    whenHydrated(store).then(() => alive && setHydrated(true));
    return () => {
      alive = false;
    };
  }, [hydrated, store]);
  return hydrated;
}
