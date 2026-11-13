// Na web não há loja de apps: o site fica no plano grátis e a assinatura é feita pelo app.
import { type BillingPort, FREE_SNAPSHOT } from './types';

export const billing: BillingPort = {
  available: false,
  async start() {},
  async getPlans() {
    return [];
  },
  async purchase() {
    return { status: 'failed', message: 'A assinatura é feita pelo app para Android ou iPhone.' };
  },
  async restore() {
    return FREE_SNAPSHOT;
  },
};
