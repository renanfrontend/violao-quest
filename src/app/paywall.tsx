import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billing } from '@/billing/adapter';
import { LEGAL_URLS } from '@/billing/config';
import type { Plan, TrialPeriod } from '@/billing/types';
import { Btn, Card } from '@/components/ui';
import { usePremium } from '@/store/premium';
import { C, F, R } from '@/theme';

const BENEFITS = [
  { icon: '🔓', title: 'Mundos 3 a 6', text: 'Levadas, pestana, escalas, campo harmônico, CAGED e improvisação: 24 fases.' },
  { icon: '🎼', title: 'Dicionário completo', text: 'Os 27 acordes, com sétimas, pestanas, power chords e tétrades.' },
] as const;

const PERIOD = {
  monthly: { title: 'Mensal', unit: 'mês' },
  annual: { title: 'Anual', unit: 'ano' },
} as const;

function trialLabel({ unit, count }: TrialPeriod): string {
  if (unit === 'day') return count === 1 ? '1 dia' : `${count} dias`;
  if (unit === 'week') return `${count * 7} dias`;
  if (unit === 'month') return count === 1 ? '1 mês' : `${count} meses`;
  return count === 1 ? '1 ano' : `${count} anos`;
}

/** Texto exigido pelas lojas: valor cobrado, período, teste grátis e renovação automática. */
function disclosure(plan: Plan): string {
  const recurring = `${plan.price} por ${PERIOD[plan.period].unit}`;
  const renewal = 'A assinatura renova automaticamente; cancele quando quiser nas assinaturas da sua conta da loja.';
  return plan.trial ? `Grátis por ${trialLabel(plan.trial)}, depois ${recurring}. ${renewal}` : `${recurring}. ${renewal}`;
}

type Phase = { kind: 'loading' } | { kind: 'ready'; plans: Plan[] } | { kind: 'unavailable' };

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const premium = usePremium((s) => s.premium);
  const apply = usePremium((s) => s.apply);
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const load = useCallback(() => {
    let alive = true;
    if (!billing.available) {
      setPhase({ kind: 'unavailable' });
      return () => {};
    }
    setPhase({ kind: 'loading' });
    billing.getPlans().then(
      (plans) => {
        if (!alive) return;
        setPhase(plans.length ? { kind: 'ready', plans } : { kind: 'unavailable' });
        setSelected(plans[0]?.id ?? null);
      },
      () => {
        if (alive) setPhase({ kind: 'unavailable' });
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(load, [load]);

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    setNotice(null);
    const outcome = await billing.purchase(selected);
    setBusy(null);
    if (outcome.status === 'purchased') {
      apply(outcome.snapshot);
      if (outcome.snapshot.premium) close();
      else setNotice('A compra foi registrada, mas o acesso ainda não liberou. Toque em Restaurar compras.');
    } else if (outcome.status === 'pending') {
      setNotice('Pagamento pendente. O Premium libera assim que a loja confirmar.');
    } else if (outcome.status === 'failed') {
      setNotice(outcome.message);
    }
  };

  const restore = async () => {
    setBusy('restore');
    setNotice(null);
    try {
      const snapshot = await billing.restore();
      apply(snapshot);
      if (snapshot.premium) close();
      else setNotice('Nenhuma assinatura ativa nesta conta da loja.');
    } catch {
      setNotice('Não deu para restaurar agora. Tente de novo.');
    } finally {
      setBusy(null);
    }
  };

  const plans = phase.kind === 'ready' ? phase.plans : [];
  const plan = plans.find((p) => p.id === selected) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 20, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={close} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ color: C.muted, fontSize: 24, fontWeight: '900' }}>✕</Text>
        </Pressable>

        <Animated.View entering={FadeInDown.duration(280)} style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 64 }}>👑</Text>
          <Text style={[F.h1, { textAlign: 'center' }]}>
            Violão Quest <Text style={{ color: C.gold }}>Premium</Text>
          </Text>
          <Text style={[F.small, { fontSize: 15, textAlign: 'center' }]}>Do primeiro acorde ao improviso, sem travas.</Text>
        </Animated.View>

        <View style={{ gap: 10 }}>
          {BENEFITS.map((b) => (
            <Card key={b.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <Text style={{ fontSize: 28 }}>{b.icon}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>{b.title}</Text>
                <Text style={F.small}>{b.text}</Text>
              </View>
            </Card>
          ))}
        </View>

        {premium ? (
          <Card style={{ alignItems: 'center', gap: 6, borderColor: C.gold }}>
            <Text style={{ color: C.gold, fontWeight: '900', fontSize: 18 }}>Você já é Premium</Text>
            <Text style={[F.small, { textAlign: 'center' }]}>Todos os mundos e acordes estão liberados.</Text>
          </Card>
        ) : phase.kind === 'loading' ? (
          <ActivityIndicator color={C.gold} style={{ marginVertical: 24 }} />
        ) : phase.kind === 'unavailable' ? (
          <Card style={{ alignItems: 'center', gap: 12 }}>
            <Text style={[F.body, { textAlign: 'center' }]}>
              {Platform.OS === 'web'
                ? 'A assinatura é feita pelo app para Android ou iPhone.'
                : 'Não deu para carregar os planos agora. Verifique a conexão e tente de novo.'}
            </Text>
            {billing.available && <Btn small label="Tentar de novo" onPress={load} />}
          </Card>
        ) : (
          <View accessibilityRole="radiogroup" style={{ gap: 12 }}>
            {plans.map((p) => (
              <PlanOption key={p.id} plan={p} selected={p.id === selected} onSelect={() => setSelected(p.id)} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{ borderTopWidth: 2, borderColor: C.border, backgroundColor: C.bg2, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 12 }}>
        <View style={{ maxWidth: 560, width: '100%', alignSelf: 'center', gap: 10 }}>
          {premium ? (
            <Btn label="Continuar" onPress={close} />
          ) : plan ? (
            <>
              <Btn
                label={busy === 'buy' ? 'Abrindo a loja…' : plan.trial ? `Começar ${trialLabel(plan.trial)} grátis` : 'Assinar'}
                onPress={buy}
                disabled={busy !== null}
              />
              <Text style={[F.small, { fontSize: 12, lineHeight: 17, textAlign: 'center' }]}>{disclosure(plan)}</Text>
            </>
          ) : null}
          {notice && (
            <Text accessibilityLiveRegion="polite" style={{ color: C.red, fontWeight: '700', textAlign: 'center' }}>
              {notice}
            </Text>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 4 }}>
            {billing.available && !premium && (
              <TextLink label={busy === 'restore' ? 'Restaurando…' : 'Restaurar compras'} onPress={restore} disabled={busy !== null} />
            )}
            <TextLink label="Termos de Uso" role="link" onPress={() => Linking.openURL(LEGAL_URLS.terms)} />
            <TextLink label="Política de Privacidade" role="link" onPress={() => Linking.openURL(LEGAL_URLS.privacy)} />
          </View>
        </View>
      </View>
    </View>
  );
}

function PlanOption({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  const period = PERIOD[plan.period];
  const trial = plan.trial ? trialLabel(plan.trial) : null;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${period.title}, ${plan.price} por ${period.unit}${trial ? `, ${trial} grátis` : ''}`}
      onPress={onSelect}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: R.lg,
        borderWidth: 3,
        borderBottomWidth: 6,
        borderColor: selected ? C.gold : C.border,
        backgroundColor: selected ? 'rgba(255,182,39,0.1)' : C.card,
      }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: selected ? C.gold : C.muted, alignItems: 'center', justifyContent: 'center' }}>
        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold }} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>{period.title}</Text>
          {trial && (
            <Text style={{ backgroundColor: C.gold, color: '#1A1200', fontWeight: '900', fontSize: 11, letterSpacing: 0.6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.pill, overflow: 'hidden' }}>
              {trial.toUpperCase()} GRÁTIS
            </Text>
          )}
        </View>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 22 }}>
          {plan.price}
          <Text style={{ color: C.muted, fontSize: 15 }}> /{period.unit}</Text>
        </Text>
        {plan.pricePerMonth && <Text style={F.small}>equivale a {plan.pricePerMonth} por mês</Text>}
      </View>
    </Pressable>
  );
}

function TextLink({ label, onPress, disabled, role = 'button' }: { label: string; onPress: () => void; disabled?: boolean; role?: 'button' | 'link' }) {
  return (
    <Pressable accessibilityRole={role} disabled={disabled} onPress={onPress} hitSlop={12} style={{ paddingVertical: 6 }}>
      <Text style={{ color: C.muted, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', opacity: disabled ? 0.5 : 1 }}>{label}</Text>
    </Pressable>
  );
}
