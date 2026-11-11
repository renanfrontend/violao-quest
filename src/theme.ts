export const C = {
  bg: '#0B0A1A',
  bg2: '#121026',
  card: '#1A1733',
  cardHi: '#231F45',
  border: '#2E2A55',
  text: '#F5F3FF',
  muted: '#9C97C0',
  gold: '#FFB627',
  goldDark: '#C4830B',
  purple: '#8B5CF6',
  purpleDark: '#5B34C4',
  green: '#34D399',
  greenDark: '#12946A',
  red: '#FB7185',
  redDark: '#BE3654',
  cyan: '#22D3EE',
  locked: '#3A3663',
  lockedDark: '#27244A',
} as const;

export const R = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const F = {
  h1: { fontSize: 28, fontWeight: '900' as const, color: C.text },
  h2: { fontSize: 20, fontWeight: '800' as const, color: C.text },
  body: { fontSize: 16, lineHeight: 24, color: C.text },
  small: { fontSize: 13, color: C.muted },
  label: { fontSize: 12, fontWeight: '800' as const, letterSpacing: 1.2, color: C.muted },
};
