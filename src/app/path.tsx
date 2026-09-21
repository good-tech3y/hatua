import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRightIcon, CaretLeftIcon, CheckIcon } from 'phosphor-react-native';
import { RealmScene } from '../components/scene';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { currentQuestIndex, levelOf } from '../lib/game';
import { REALMS } from '../lib/realms';
import { useStore } from '../lib/store';
import { useRealm } from '../lib/useRealm';
import { colors, typography } from '../theme';

export default function PathScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { intro } = useLocalSearchParams<{ intro?: string }>();
  const goal = useStore((s) => s.goal);
  const xp = useStore((s) => s.xp);
  const realm = useRealm();
  const isIntro = intro === '1';

  if (!goal) return <Redirect href="/welcome" />;

  const quests = goal.quests;
  const current = currentQuestIndex(quests);
  const finished = current >= quests.length;

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
        {!isIntro ? (
          <RoundButton onPress={() => router.back()}>
            <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
          </RoundButton>
        ) : null}
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          {isIntro ? 'Here is your path.' : finished ? 'You made it.' : 'Your path.'}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.lead}>
          {isIntro
            ? `${quests.length} steps to your goal. Hatua only counts the ones that are real.`
            : finished
              ? 'Every step is done.'
              : `Quest ${current + 1} of ${quests.length}`}
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(700)}>
          <RealmScene
            realm={realm}
            width={width - 44}
            height={300}
            total={quests.length}
            current={isIntro ? 0 : current}
            level={levelOf(xp)}
            intro={isIntro}
          />
          <Text style={styles.realm}>
            {REALMS[realm].name}. {REALMS[realm].blurb}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <GlassCard>
            {quests.map((q, i) => {
              const done = q.done >= q.need;
              return (
                <View key={q.id} style={styles.row}>
                  <View style={[styles.dot, done && styles.dotDone]}>
                    {done ? <CheckIcon size={12} color={colors.navy} weight="bold" /> : null}
                  </View>
                  <Text style={[styles.rowText, i === current && styles.rowNow]}>{q.title}</Text>
                </View>
              );
            })}
          </GlassCard>
        </Animated.View>

        {isIntro ? (
          <Animated.View entering={FadeInDown.delay(1200).duration(600)}>
            <PillButton
              label="Start my journey"
              icon={<ArrowRightIcon size={18} color={colors.white} weight="bold" />}
              onPress={() => router.replace('/')}
            />
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 20 },
  lead: { ...typography.body, color: colors.navy, marginTop: 8, marginBottom: 20 },
  realm: { ...typography.caption, color: colors.bodyMuted, textAlign: 'center', marginTop: 10, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.lemon },
  rowText: { ...typography.body, color: colors.navy, flex: 1 },
  rowNow: { fontFamily: typography.heading.fontFamily, color: colors.cobalt },
});
