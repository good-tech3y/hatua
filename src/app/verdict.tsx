import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrophyIcon } from 'phosphor-react-native';
import { HeroFigure } from '../components/art';
import type { Mood } from '../components/art';
import { Burst } from '../components/burst';
import { StatBar } from '../components/stats';
import { Backdrop, Chip, GlassCard, PillButton } from '../components/ui';
import { achievements } from '../lib/achievements';
import { isDemo } from '../lib/ai';
import { QUEST_DAYS, journeyPercent, levelOf, successRate } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Verdict() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { checkIns, goal, health, xp } = useStore();
  const item = checkIns.find((c) => c.id === id);

  useEffect(() => {
    if (!item) return;
    const kind =
      item.verdict === 'progress'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning;
    try {
      Promise.resolve(Haptics.notificationAsync(kind)).catch(() => {});
    } catch {}
  }, [item?.id]);

  if (!item || !goal) return <Redirect href="/" />;

  const mood: Mood = item.verdict === 'progress' ? 'happy' : item.verdict === 'steady' ? 'calm' : 'low';
  const heading =
    item.verdict === 'progress' ? 'That counts.' : item.verdict === 'steady' ? 'Not quite yet.' : 'I can’t count that yet.';

  const wins = checkIns.filter((c) => c.verdict === 'progress').length;
  const questDone = item.verdict === 'progress' && wins % QUEST_DAYS === 0;
  const quest = questDone ? goal.quests[wins / QUEST_DAYS - 1] : undefined;
  const leveled = levelOf(xp) > levelOf(xp - item.xp);
  const before = achievements({ checkIns: checkIns.filter((c) => c.id !== item.id), xp: xp - item.xp, goal });
  const fresh = achievements({ checkIns, xp, goal }).filter((a, i) => a.done && !before[i].done);

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <View pointerEvents="none" style={[styles.burst, { top: insets.top + 32 }]}>
        <Burst play={item.verdict === 'progress'} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 22,
        }}
      >
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.avatar}>
          <HeroFigure size={92} alive mood={mood} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.headline}>
          {heading}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(350).duration(600)} style={styles.reason}>
          {item.reason}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(450).duration(600)} style={styles.chips}>
          <Chip label={item.xp > 0 ? `+${item.xp} XP` : 'No XP this time'} active={item.xp > 0} />
          {leveled ? <Chip label={`Level ${levelOf(xp)}`} active /> : null}
          {isDemo ? <Chip label="Demo judge" /> : null}
        </Animated.View>

        {quest ? (
          <Animated.View entering={FadeInDown.delay(550).duration(600)}>
            <GlassCard>
              <Text style={styles.kicker}>Quest complete</Text>
              <Text style={styles.title}>{quest.title}</Text>
              <Text style={styles.note}>A lantern lights up on your path.</Text>
            </GlassCard>
          </Animated.View>
        ) : null}

        {fresh.map((a, k) => (
          <Animated.View key={a.id} entering={FadeInDown.delay(650 + k * 100).duration(600)}>
            <GlassCard style={styles.win}>
              <View style={styles.badge}>
                <TrophyIcon size={20} color={colors.navy} weight="fill" />
              </View>
              <View style={styles.winBody}>
                <Text style={styles.kicker}>New achievement</Text>
                <Text style={styles.title}>{a.title}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(750).duration(600)}>
          <GlassCard>
            <StatBar label="Health" value={health} color={colors.mint} />
            <StatBar label="Progress" value={journeyPercent(goal.quests)} color={colors.cobalt} />
            <StatBar label="Success rate" value={successRate(checkIns)} color={colors.violet} />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(850).duration(600)} style={styles.buttons}>
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
  burst: { position: 'absolute', left: 0, right: 0, height: 116 },
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
  reason: { ...typography.body, fontSize: 16, color: colors.navy, textAlign: 'center', marginTop: 12, marginBottom: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 22 },
  kicker: { ...typography.label, color: colors.cobalt },
  title: { ...typography.heading, color: colors.navy, marginTop: 4 },
  note: { ...typography.caption, color: colors.bodyMuted, marginTop: 4 },
  win: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lemon },
  winBody: { flex: 1 },
  buttons: { gap: 12, marginTop: 8 },
});
