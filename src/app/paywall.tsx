import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, CheckIcon, MapTrifoldIcon, PaletteIcon } from 'phosphor-react-native';
import { HeroFigure } from '../components/art';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { isTestKey, usePro } from '../lib/purchases';
import { colors, typography } from '../theme';

const LABEL: Record<string, string> = { ANNUAL: 'Yearly', MONTHLY: 'Monthly', LIFETIME: 'Lifetime' };

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pro, packages, loading, busy, error, demo, buy, restore, demoSet } = usePro();
  const [picked, setPicked] = useState('');
  const chosen = packages.find((p) => p.identifier === picked) ?? packages[0];

  async function go() {
    if (pro) {
      router.replace('/settings');
      return;
    }
    if (demo) {
      demoSet(true);
      return;
    }
    if (chosen) await buy(chosen);
  }

  const label = pro ? 'Choose your look' : demo ? 'Unlock in demo mode' : busy ? 'Working on it' : 'Continue';
  const off = !pro && !demo && (!chosen || busy);

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 22,
        }}
      >
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>

        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.avatar}>
          <HeroFigure size={92} scarf={colors.lemon} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150).duration(600)} style={styles.headline}>
          {pro ? 'You have Pro.' : 'Unlock more worlds.'}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.lead}>
          Pro adds new realms and hero looks. Progress is never for sale.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(350).duration(600)}>
          <GlassCard>
            <View style={styles.perk}>
              <MapTrifoldIcon size={22} color={colors.cobalt} weight="bold" />
              <Text style={styles.perkText}>Three extra realms to play in</Text>
            </View>
            <View style={styles.perk}>
              <PaletteIcon size={22} color={colors.cobalt} weight="bold" />
              <Text style={styles.perkText}>New scarves for your hero</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {!pro ? (
          <Animated.View entering={FadeInDown.delay(450).duration(600)}>
            {demo ? (
              <GlassCard>
                <Text style={styles.planName}>Demo mode</Text>
                <Text style={styles.planNote}>
                  No payment happens here. Real purchases run in the full build.
                </Text>
              </GlassCard>
            ) : loading ? (
              <ActivityIndicator color={colors.cobalt} style={styles.spin} />
            ) : packages.length === 0 ? (
              <Text style={styles.note}>No plans are available right now.</Text>
            ) : (
              packages.map((p) => {
                const on = chosen?.identifier === p.identifier;
                return (
                  <Pressable
                    key={p.identifier}
                    onPress={() => setPicked(p.identifier)}
                    style={[styles.plan, on && styles.planOn]}
                  >
                    <View style={styles.planBody}>
                      <Text style={styles.planName}>{LABEL[p.packageType] ?? p.product.title}</Text>
                      <Text style={styles.planNote}>{p.product.priceString}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>
                      {on ? <CheckIcon size={14} color={colors.navy} weight="bold" /> : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </Animated.View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.cta, { opacity: off ? 0.45 : 1 }]}>
          <PillButton label={label} onPress={go} />
        </View>
        {!demo && !pro ? (
          <Pressable onPress={restore}>
            <Text style={styles.link}>Restore purchases</Text>
          </Pressable>
        ) : null}
        {isTestKey ? <Text style={styles.note}>Test Store build. No real money changes hands.</Text> : null}
        <Text style={styles.note}>Progress, XP and levels can never be bought.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.periwinkle,
    marginTop: 8,
  },
  headline: { ...typography.display, color: colors.cobalt, textAlign: 'center', marginTop: 20 },
  lead: {
    ...typography.body,
    color: colors.navy,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  perkText: { ...typography.body, color: colors.navy, flex: 1 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(252,254,255,0.88)',
  },
  planOn: { borderColor: colors.cobalt },
  planBody: { flex: 1 },
  planName: { ...typography.heading, color: colors.navy },
  planNote: { ...typography.caption, color: colors.bodyMuted, marginTop: 2 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.lemon },
  spin: { marginVertical: 24 },
  cta: { marginTop: 8 },
  link: { ...typography.label, color: colors.cobalt, textAlign: 'center', marginTop: 16 },
  error: { ...typography.caption, color: colors.navy, marginTop: 8 },
  note: { ...typography.caption, color: colors.bodyMuted, textAlign: 'center', marginTop: 12 },
});
