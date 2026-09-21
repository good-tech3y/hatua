import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native';
import { HatuaMark, HeroFigure } from '../components/art';
import { Backdrop, PillButton } from '../components/ui';
import { colors, typography } from '../theme';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bob = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.quad);
    bob.set(
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1500, easing: ease }),
          withTiming(0, { duration: 1500, easing: ease }),
        ),
        -1,
      ),
    );
  }, [bob]);

  const float = useAnimatedStyle(() => ({ transform: [{ translateY: bob.get() }] }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Backdrop variant="night" />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.periwinkle} stopOpacity="0.5" />
              <Stop offset="1" stopColor={colors.periwinkle} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50%" cy="34%" rx="70%" ry="30%" fill="url(#glow)" />
        </Svg>
      </View>

      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <Animated.View entering={FadeIn.duration(900)} style={float}>
          <HeroFigure alive size={230} ink={colors.card} face={colors.night} scarf={colors.mint} />
        </Animated.View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 22 }]}>
        <Animated.View entering={FadeInDown.delay(500).duration(700)} style={styles.brand}>
          <HatuaMark size={30} color={colors.card} dot={colors.lemon} />
          <Text style={styles.word}>hatua</Text>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(650).duration(700)} style={styles.line}>
          Turn one goal into a game that only rewards real progress.
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(800).duration(700)} style={styles.full}>
          <PillButton
            tone="light"
            label="Begin"
            icon={<ArrowRightIcon size={18} color={colors.ink} weight="bold" />}
            onPress={() => router.replace('/goal')}
          />
        </Animated.View>
        <Text style={styles.note}>Everything you save stays on your phone.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: 24, gap: 16, alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { fontFamily: typography.display.fontFamily, fontSize: 34, color: colors.card, letterSpacing: -0.5 },
  line: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    maxWidth: 320,
  },
  full: { width: '100%' },
  note: { ...typography.caption, color: 'rgba(255,255,255,0.45)' },
});
