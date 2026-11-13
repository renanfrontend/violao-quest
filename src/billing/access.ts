import { LAST_FREE_LEVEL_ID } from '@/data/curriculum';
import type { Access } from '@/data/access';
import { billing } from './adapter';
import { MONETIZATION_ENABLED } from './config';

/** Conteúdo grátis sempre abre; o premium exige assinatura quando a monetização está ligada. */
export function canAccess(access: Access, premium: boolean): boolean {
  return access === 'free' || premium || !MONETIZATION_ENABLED;
}

type OfferInput = { levelId: string; lessonsBefore: number; offerSeen: boolean; premium: boolean };

/**
 * Momentos em que o app apresenta o Premium ao fim de uma aula:
 * depois da primeira aula concluída (uma vez só) e ao vencer a última fase grátis.
 */
export function shouldOfferPremium({ levelId, lessonsBefore, offerSeen, premium }: OfferInput): boolean {
  if (!MONETIZATION_ENABLED || !billing.available || premium) return false;
  return levelId === LAST_FREE_LEVEL_ID || (lessonsBefore === 0 && !offerSeen);
}
