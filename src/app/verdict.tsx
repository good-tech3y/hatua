import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroFigure } from '../components/art';
import { StatBar } from '../components/stats';
import { Backdrop, Chip, GlassCard, PillButton } from '../components/ui';
import { isDemo } from '../lib/ai';
import { journeyPercent, successRate } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Verdict() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { checkIns, goal, health } = useStore();
  const item = checkIns.find((c) => c.id === id);

  if (!item || !goal) return <Redirect href="/" />;

  const heading =
    item.verdict === 'progress'
      ? 'That counts.'
      : item.verdict === 'steady'
        ? 'Not quite yet.'
        : 'I can’t count that yet.';

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 22,
        }}
      >
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.avatar}>
          <HeroFigure size={92} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.headline}>
          {heading}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(600)} style={styles.reason}>
          {item.reason}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(450).duration(600)} style={styles.chips}>
          <Chip label={item.xp > 0 ? `+${item.xp} XP` : 'No XP this time'} active={item.xp > 0} />
          {isDemo ? <Chip label="Demo judge" /> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550).duration(600)}>
          <GlassCard>
            <StatBar label="Health" value={health} color={colors.mint} />
            <StatBar label="Progress" value={journeyPercent(goal.quests)} color={colors.cobalt} />
            <StatBar label="Success rate" value={successRate(checkIns)} color={colors.violet} />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(650).duration(600)} style={styles.buttons}>
          <PillButton label="Back to today" onPress={() => router.replace('/')} />
          {item.verdict !== 'progress' ? (
            <PillButton tone="light" label="Say it again" onPress={() => router.replace('/checkin')} />
          ) : null}
        </Animated.View>
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
  },
  headline: { ...typography.display, color: colors.cobalt, textAlign: 'center', marginTop: 22 },
  reason: {
    ...typography.body,
    fontSize: 16,
    color: colors.navy,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  chips: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 22 },
  buttons: { gap: 12 },
});
