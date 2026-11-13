/** Estado da assinatura no formato do app, sem tipos do SDK de pagamentos. */
export type EntitlementSnapshot = {
  premium: boolean;
  /** Assinatura dentro do período de teste grátis. */
  trial: boolean;
  /** Fim do período atual (ISO 8601); null quando não há data. */
  expiresAt: string | null;
  /** Página da loja onde a pessoa gerencia ou cancela a assinatura. */
  manageUrl: string | null;
};

export const FREE_SNAPSHOT: EntitlementSnapshot = { premium: false, trial: false, expiresAt: null, manageUrl: null };

export type PlanPeriod = 'monthly' | 'annual';

export type TrialPeriod = { unit: 'day' | 'week' | 'month' | 'year'; count: number };

export type Plan = {
  id: string;
  period: PlanPeriod;
  /** Valor cobrado a cada período, já formatado pela loja (ex.: "R$ 99,90"). */
  price: string;
  /** Equivalente mensal do plano anual; null nos demais. */
  pricePerMonth: string | null;
  /** Teste grátis a que esta conta tem direito; null se não houver ou se já foi usado. */
  trial: TrialPeriod | null;
};

export type PurchaseOutcome =
  | { status: 'purchased'; snapshot: EntitlementSnapshot }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'failed'; message: string };

/** Porta de pagamentos. A UI conversa só com ela; o adaptador de cada plataforma fala com a loja. */
export type BillingPort = {
  /** false na web e em builds sem a chave do RevenueCat. */
  readonly available: boolean;
  /** Configura o SDK, entrega o estado atual e passa a avisar cada mudança. */
  start(onChange: (snapshot: EntitlementSnapshot) => void): Promise<void>;
  /** Planos da oferta atual, o anual primeiro. */
  getPlans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseOutcome>;
  restore(): Promise<EntitlementSnapshot>;
};
