import { Platform } from 'react-native';

/**
 * Liga o plano grátis/Premium. Só os perfis do eas.json definem "on": o site na Vercel
 * e o APK do GitHub Actions seguem com todo o conteúdo liberado.
 */
export const MONETIZATION_ENABLED = process.env.EXPO_PUBLIC_MONETIZATION === 'on';

/** Entitlement do RevenueCat que libera o conteúdo premium. */
export const ENTITLEMENT_ID = 'premium';

/** Chave pública do SDK do RevenueCat para a plataforma atual. */
export const REVENUECAT_API_KEY: string | undefined = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

/** Exigidos pela App Store em apps com assinatura (guideline 3.1.2). Publicar antes do envio às lojas. */
export const LEGAL_URLS = {
  terms: 'https://violao-quest-xi.vercel.app/termos',
  privacy: 'https://violao-quest-xi.vercel.app/privacidade',
} as const;
