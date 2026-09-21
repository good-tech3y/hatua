import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  Easing,
  FadeInDown,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRightIcon, CaretLeftIcon, CheckIcon, FlagIcon } from 'phosphor-react-native';
import { HeroFigure } from '../components/art';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { currentQuestIndex } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

const HERO = 60;
const NODE = 22;
const SCENE_H = 210;

function Node({
  x,
  y,
  i,
  last,
  t,
}: {
  x: number;
  y: number;
  i: number;
  last: boolean;
  t: SharedValue<number>;
}) {
  const size = last ? 34 : NODE;
  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(t.get(), [i - 0.5, i, i + 0.5], [1, 1.3, 1], 'clamp') }],
  }));
  const fill = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [i - 0.5, i], [0, 1], 'clamp'),
  }));
  return (
    <Animated.View
      style={[
        styles.node,
        { left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2 },
        pop,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: size / 2, backgroundColor: colors.lemon },
          fill,
        ]}
      />
      {last ? <FlagIcon size={16} color={colors.cobalt} weight="fill" /> : null}
    </Animated.View>
  );
}

function Scene({ count, current, intro }: { count: number; current: number; intro: boolean }) {
  const { width } = useWindowDimensions();
  const W = width - 84;
  const m = count + 1;
  const t = useSharedValue(intro ? 0 : current);

  const xs = Array.from({ length: m }, (_, i) => 20 + (i * (W - 40)) / (m - 1));
  const ys = Array.from({ length: m }, (_, i) => SCENE_H - 30 - (i * (SCENE_H - 80)) / (m - 1));
  const idx = Array.from({ length: m }, (_, i) => i);
  const hx = xs.map((x) => x - HERO / 2);
  const hy = ys.map((y) => y - HERO * 0.865 - 8);

  useEffect(() => {
    if (intro) {
      t.set(withDelay(900, withTiming(m - 1, { duration: 3800, easing: Easing.inOut(Easing.cubic) })));
    }
  }, [intro, m, t]);

  const hero = useAnimatedStyle(() => {
    const v = t.get();
    return {
      transform: [
        { translateX: interpolate(v, idx, hx) },
        { translateY: interpolate(v, idx, hy) - Math.abs(Math.sin(v * Math.PI)) * 16 },
      ],
    };
  });

  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < m; i++) d += ` H ${xs[i]} V ${ys[i]}`;

  return (
    <View style={{ width: W, height: SCENE_H }}>
      <Svg width={W} height={SCENE_H} style={StyleSheet.absoluteFill}>
        <Path
          d={d}
          stroke={colors.cobalt}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.35}
        />
      </Svg>
      {xs.map((x, i) => (
        <Node key={i} x={x} y={ys[i]} i={i} last={i === m - 1} t={t} />
      ))}
      <Animated.View style={[styles.heroWrap, hero]}>
        <HeroFigure size={HERO} />
      </Animated.View>
    </View>
  );
}

export default function PathScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { intro } = useLocalSearchParams<{ intro?: string }>();
  const goal = useStore((s) => s.goal);
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

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <GlassCard style={styles.scene}>
            <Scene count={quests.length} current={current} intro={isIntro} />
          </GlassCard>
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
  scene: { alignItems: 'center' },
  heroWrap: { position: 'absolute', left: 0, top: 0 },
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.cobalt,
  },
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
