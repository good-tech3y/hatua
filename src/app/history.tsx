import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon } from 'phosphor-react-native';
import { Backdrop, Chip, GlassCard, PillButton, RoundButton } from '../components/ui';
import type { Verdict } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

const badge = (v: Verdict) => (v === 'progress' ? 'Counted' : v === 'steady' ? 'Steady' : 'Not counted');

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkIns = useStore((s) => s.checkIns);

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
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          Your check-ins
        </Animated.Text>

        {checkIns.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <Text style={styles.empty}>Nothing here yet. Your first honest check-in starts the story.</Text>
            <PillButton label="Check in" onPress={() => router.replace('/checkin')} />
          </Animated.View>
        ) : (
          checkIns.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(120 + i * 60).duration(500)}>
              <GlassCard>
                <View style={styles.top}>
                  <Chip label={badge(c.verdict)} active={c.verdict === 'progress'} />
                  <Text style={styles.date}>
                    {new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.text} numberOfLines={4}>
                  {c.text}
                </Text>
                <Text style={styles.reason}>{c.reason}</Text>
              </GlassCard>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 20, marginBottom: 20 },
  empty: { ...typography.body, color: colors.navy, marginBottom: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.caption, color: colors.bodyMuted },
  text: { ...typography.body, color: colors.navy, marginTop: 12 },
  reason: { ...typography.caption, color: colors.bodyMuted, marginTop: 8, lineHeight: 18 },
});
