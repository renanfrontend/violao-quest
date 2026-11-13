// Adaptador nativo (Android/iOS) da porta de pagamentos, sobre o RevenueCat.
// Na web o Metro usa adapter.web.ts no lugar deste arquivo.
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage, type PurchasesStoreProduct } from 'react-native-purchases';
import { ENTITLEMENT_ID, REVENUECAT_API_KEY } from './config';
import type { BillingPort, EntitlementSnapshot, Plan, PlanPeriod, PurchaseOutcome, TrialPeriod } from './types';

let started = false;
/** Pacotes da última consulta de planos, para comprar pelo id sem expor o SDK à UI. */
let packages = new Map<string, PurchasesPackage>();

function snapshotFrom(info: CustomerInfo): EntitlementSnapshot {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  return {
    premium: entitlement?.isActive ?? false,
    trial: entitlement?.periodType === 'TRIAL',
    expiresAt: entitlement?.expirationDate ?? null,
    manageUrl: info.managementURL,
  };
}

function unitOf(unit: string): TrialPeriod['unit'] | null {
  switch (unit) {
    case 'DAY':
      return 'day';
    case 'WEEK':
      return 'week';
    case 'MONTH':
      return 'month';
    case 'YEAR':
      return 'year';
    default:
      return null;
  }
}

function trialOf(product: PurchasesStoreProduct, eligibleOnAppStore: boolean): TrialPeriod | null {
  // Google Play: a oferta padrão só traz a fase grátis para quem ainda tem direito a ela.
  const free = product.defaultOption?.freePhase;
  if (free) {
    const unit = unitOf(free.billingPeriod.unit);
    return unit ? { unit, count: free.billingPeriod.value } : null;
  }
  // App Store: o preço introdutório zero é o teste grátis; a elegibilidade vem à parte.
  const intro = product.introPrice;
  if (!eligibleOnAppStore || !intro || intro.price !== 0) return null;
  const unit = unitOf(intro.periodUnit);
  return unit ? { unit, count: intro.periodNumberOfUnits } : null;
}

async function appStoreTrialEligibility(productIds: string[]): Promise<Set<string>> {
  if (Platform.OS !== 'ios' || productIds.length === 0) return new Set();
  const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);
  const eligible = Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
  return new Set(productIds.filter((id) => result[id]?.status === eligible));
}

function outcomeFromError(error: unknown): PurchaseOutcome {
  const code = (error as { code?: unknown } | null)?.code;
  const codes = Purchases.PURCHASES_ERROR_CODE;
  if (code === codes.PURCHASE_CANCELLED_ERROR) return { status: 'cancelled' };
  if (code === codes.PAYMENT_PENDING_ERROR) return { status: 'pending' };
  if (code === codes.NETWORK_ERROR) return { status: 'failed', message: 'Sem conexão com a loja. Tente de novo.' };
  return { status: 'failed', message: 'Não foi possível concluir a assinatura. Tente de novo.' };
}

export const billing: BillingPort = {
  available: Boolean(REVENUECAT_API_KEY),

  async start(onChange) {
    if (started || !REVENUECAT_API_KEY) return;
    started = true;
    if (__DEV__) await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    Purchases.addCustomerInfoUpdateListener((info) => onChange(snapshotFrom(info)));
    onChange(snapshotFrom(await Purchases.getCustomerInfo()));
  },

  async getPlans() {
    const offering = (await Purchases.getOfferings()).current;
    if (!offering) return [];
    const entries: [PlanPeriod, PurchasesPackage | null][] = [
      ['annual', offering.annual],
      ['monthly', offering.monthly],
    ];
    const available = entries.filter((entry): entry is [PlanPeriod, PurchasesPackage] => entry[1] !== null);
    const eligible = await appStoreTrialEligibility(available.map(([, pkg]) => pkg.product.identifier));
    packages = new Map(available.map(([, pkg]) => [pkg.identifier, pkg]));
    return available.map(
      ([period, pkg]): Plan => ({
        id: pkg.identifier,
        period,
        price: pkg.product.priceString,
        pricePerMonth: period === 'annual' ? pkg.product.pricePerMonthString : null,
        trial: trialOf(pkg.product, eligible.has(pkg.product.identifier)),
      }),
    );
  },

  async purchase(planId) {
    const pkg = packages.get(planId);
    if (!pkg) return { status: 'failed', message: 'Plano indisponível. Feche esta tela e abra de novo.' };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { status: 'purchased', snapshot: snapshotFrom(customerInfo) };
    } catch (error) {
      return outcomeFromError(error);
    }
  },

  async restore() {
    return snapshotFrom(await Purchases.restorePurchases());
  },
};
