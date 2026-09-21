import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRightIcon,
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  FlagIcon,
  HouseSimpleIcon,
} from 'phosphor-react-native';
import { HatuaMark, HeroFigure } from '../components/art';
import { StatBar } from '../components/stats';
import { Backdrop, Chip, GlassCard, PillButton, RoundButton, Toolbar } from '../components/ui';
import { currentQuestIndex, journeyPercent, levelOf, successRate, xpInLevel } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Today() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goal, checkIns, xp, health, resetAll } = useStore();

  if (!goal) return <Redirect href="/welcome" />;

  const qi = currentQuestIndex(goal.quests);
  const quest = goal.quests[qi];
  const finished = !quest;
  const level = levelOf(xp);

  function menu() {
    Alert.alert('Start over?', 'This clears your goal, your hero and your check-ins from this phone.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Start over',
        style: 'destructive',
        onPress: () => {
          resetAll();
          router.replace('/welcome');
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: 22,
        }}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <RoundButton>
            <HatuaMark size={26} />
          </RoundButton>
          <RoundButton onPress={menu}>
            <DotsThreeIcon size={26} color={colors.navy} weight="bold" />
          </RoundButton>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(80).duration(600)} style={styles.headline}>
          {finished ? 'You reached the end.' : 'One small step today.'}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(160).duration(600)}
          style={styles.lead}
          numberOfLines={2}
        >
          Working toward: {goal.text}
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(240).duration(600)} style={styles.chips}>
          <Chip
            label={finished ? 'Complete' : `Quest ${qi + 1} of ${goal.quests.length}`}
            active
          />
          <Chip label={`Level ${level}`} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(600)}>
          <GlassCard>
            <View style={styles.heroRow}>
              <View style={styles.avatar}>
                <HeroFigure size={50} />
              </View>
              <View>
                <Text style={styles.name}>Your hero</Text>
                <Text style={styles.sub}>
                  Level {level}, {xpInLevel(xp)} of 100 XP
                </Text>
              </View>
            </View>
            <StatBar label="Health" value={health} color={colors.mint} />
            <StatBar label="Progress" value={journeyPercent(goal.quests)} color={colors.cobalt} />
            <StatBar label="Success rate" value={successRate(checkIns)} color={colors.violet} />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <GlassCard>
            <Text style={styles.kicker}>{finished ? 'All done' : 'Today’s quest'}</Text>
            <Text style={styles.questTitle}>{quest ? quest.title : 'You finished this path.'}</Text>
            <Text style={styles.body}>
              {quest
                ? `${quest.done} of ${quest.need} real days so far. Only honest check-ins count.`
                : 'Start a new goal from the menu when you are ready.'}
            </Text>
            {quest ? (
              <PillButton
                label="Check in"
                icon={<ArrowRightIcon size={18} color={colors.white} weight="bold" />}
                onPress={() => router.push('/checkin')}
              />
            ) : null}
          </GlassCard>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(500).springify().damping(16)}
        style={[styles.dock, { bottom: insets.bottom + 18 }]}
      >
        <Toolbar
          activeKey="today"
          onChange={(key) => {
            if (key === 'path') router.push('/path');
            if (key === 'history') router.push('/history');
          }}
          items={[
            { key: 'today', icon: (c) => <HouseSimpleIcon size={22} color={c} weight="bold" /> },
            { key: 'path', icon: (c) => <FlagIcon size={22} color={c} weight="bold" /> },
            {
              key: 'history',
              icon: (c) => <ClockCounterClockwiseIcon size={22} color={c} weight="bold" />,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 30 },
  lead: { ...typography.body, color: colors.navy, marginTop: 10, maxWidth: 330 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22, marginBottom: 22 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.periwinkle,
  },
  name: { ...typography.heading, color: colors.navy },
  sub: { ...typography.caption, color: colors.bodyMuted },
  kicker: { ...typography.label, color: colors.cobalt },
  questTitle: { ...typography.title, color: colors.navy, marginTop: 6 },
  body: { ...typography.body, color: colors.bodyMuted, marginTop: 8, marginBottom: 20 },
  dock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
