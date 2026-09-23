import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, CheckIcon } from 'phosphor-react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { PaywallPreview } from '../components/preview';
import { Backdrop, PillButton, RoundButton } from '../components/ui';
import { useAccess } from '../lib/access';
import { isTestKey, usePro } from '../lib/purchases';
import { colors, typography } from '../theme';

type Card = { id: string; period: string; price: string; badge?: string; note?: string; pkg?: PurchasesPackage };

const DEMO_CARDS: Card[] = [
  { id: 'demo-m', period: 'Monthly', price: '$2.00' },
  { id: 'demo-y', period: 'Yearly', price: '$21.60', badge: 'Best value', note: 'Save 10% vs monthly' },
];

const periodOf = (p: PurchasesPackage) => (p.packageType === 'ANNUAL' ? 'Yearly' : 'Monthly');

function cardsFromPackages(pkgs: PurchasesPackage[]): Card[] {
  const live = pkgs.filter((p) => p.packageType !== 'LIFETIME');
  const monthly = live.find((p) => p.packageType === 'MONTHLY');
  return live.map((p) => {
    const period = periodOf(p);
    let badge: string | undefined;
    let note: string | undefined;
    if (period === 'Yearly') {
      badge = 'Best value';
      if (monthly && monthly.product.price > 0 && p.product.price > 0) {
        const save = Math.round(100 - (p.product.price / (monthly.product.price * 12)) * 100);
        if (save > 0) note = `Save ${save}% vs monthly`;
      }
    }
    return { id: p.identifier, period, price: p.product.priceString, badge, note, pkg: p };
  });
}

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pro, trialActive, daysLeft } = useAccess();
  const { packages, loading, busy, error, demo, buy, restore, demoSet } = usePro();
  const [picked, setPicked] = useState('');

  const cards = useMemo(() => (demo ? DEMO_CARDS : cardsFromPackages(packages)), [demo, packages]);
  const chosen = cards.find((c) => c.id === picked) ?? cards.find((c) => c.badge === 'Best value') ?? cards[0];

  async function go() {
    if (pro) { router.replace('/settings'); return; }
    if (demo) { demoSet(true); return; }
    if (chosen?.pkg) await buy(chosen.pkg);
  }

  const label = pro ? 'Choose your look' : demo ? 'Unlock in demo mode' : busy ? 'Working on it' : 'Continue';

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28, paddingHorizontal: 22 }}
      >
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>

        <Animated.View entering={FadeInDown.duration(600)}>
          <PaywallPreview />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.headline}>
          {pro ? 'You have Pro.' : 'Three worlds. One hero.'}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(180).duration(600)} style={styles.lead}>
          {pro
            ? 'Every realm and look is yours.'
            : 'Every new player gets all of this free for 30 days. Progress is never for sale, only new worlds and looks.'}
        </Animated.Text>

        {!pro ? (
          <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.trial}>
            <Text style={styles.trialText}>
              {trialActive ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial` : 'Your free trial has ended'}
            </Text>
          </Animated.View>
        ) : null}

        {!pro ? (
          <Animated.View entering={FadeInDown.delay(320).duration(600)}>
            {loading ? (
              <ActivityIndicator color={colors.cobalt} style={styles.spin} />
            ) : (
              cards.map((c) => {
                const on = chosen?.id === c.id;
                return (
                  <Pressable key={c.id} onPress={() => setPicked(c.id)} style={[styles.card, on && styles.cardOn]}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardPeriod}>{c.period}</Text>
                      {c.badge ? (
                        <View style={styles.badge}><Text style={styles.badgeText}>{c.badge}</Text></View>
                      ) : null}
                    </View>
                    <View style={styles.cardBottom}>
                      <View>
                        <Text style={styles.cardPrice}>{c.price}</Text>
                        {c.note ? <Text style={styles.cardNote}>{c.note}</Text> : null}
                      </View>
                      <View style={[styles.radio, on && styles.radioOn]}>
                        {on ? <CheckIcon size={14} color={colors.navy} weight="bold" /> : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </Animated.View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.cta, { opacity: !pro && (!chosen || busy) ? 0.45 : 1 }]}>
          <PillButton label={label} onPress={go} />
        </View>
        {!demo && !pro ? (
          <Pressable onPress={restore}><Text style={styles.link}>Restore purchases</Text></Pressable>
        ) : null}
        {isTestKey ? <Text style={styles.note}>Test Store build. No real money changes hands.</Text> : null}
        <Text style={styles.note}>Progress, XP and levels can never be bought.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.display, color: colors.cobalt, textAlign: 'center', marginTop: 10 },
  lead: { ...typography.body, color: colors.navy, textAlign: 'center', marginTop: 10, marginBottom: 6 },
  trial: { alignSelf: 'center', marginTop: 10, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(80,100,118,0.14)' },
  trialText: { ...typography.label, color: colors.navy },
  card: { padding: 16, marginTop: 12, borderRadius: 22, borderWidth: 2, borderColor: 'transparent', backgroundColor: 'rgba(252,254,255,0.88)' },
  cardOn: { borderColor: colors.cobalt },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPeriod: { ...typography.heading, color: colors.navy },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.lemon },
  badgeText: { ...typography.caption, fontFamily: typography.label.fontFamily, color: colors.navy },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  cardPrice: { ...typography.title, fontSize: 22, color: colors.navy },
  cardNote: { ...typography.caption, color: colors.bodyMuted, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.cobalt, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.lemon },
  spin: { marginVertical: 24 },
  cta: { marginTop: 16 },
  link: { ...typography.label, color: colors.cobalt, textAlign: 'center', marginTop: 16 },
  error: { ...typography.caption, color: colors.navy, marginTop: 8 },
  note: { ...typography.caption, color: colors.bodyMuted, textAlign: 'center', marginTop: 12 },
});
