import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRightIcon, FlagIcon, MapTrifoldIcon, TrophyIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { HatuaMark } from '../components/art';
import { Backdrop } from '../components/ui';
import { colors, typography } from '../theme';

const TOTAL_MS = 7000;

export default function Intro() {
  const router = useRouter();
  const [beat, setBeat] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scale = useSharedValue(0.4);

  function go() {
    timers.current.forEach(clearTimeout);
    router.replace('/name');
  }

  useEffect(() => {
    scale.set(withSpring(1, { damping: 9, stiffness: 90 }));
    timers.current.push(setTimeout(() => setBeat(1), 1400));
    timers.current.push(setTimeout(() => setBeat(2), 3200));
    timers.current.push(setTimeout(() => setBeat(3), 5400));
    timers.current.push(setTimeout(go, TOTAL_MS));
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable style={styles.root} onPress={go}>
      <StatusBar style="light" />
      <Backdrop variant="night" />
      {beat < 2 ? (
        <View style={styles.center}>
          <Animated.View style={markStyle}>
            <HatuaMark size={64} color={colors.card} dot={colors.lemon} />
          </Animated.View>
          {beat >= 1 ? (
            <Animated.Text entering={ZoomIn.springify().damping(10)} style={styles.word}>
              hatua
            </Animated.Text>
          ) : null}
        </View>
      ) : null}
      {beat === 2 ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.diagram}>
          <View style={styles.node}><MapTrifoldIcon size={22} color={colors.night} weight="bold" /></View>
          <ArrowRightIcon size={20} color={colors.card} weight="bold" />
          <View style={styles.node}><FlagIcon size={22} color={colors.night} weight="bold" /></View>
          <ArrowRightIcon size={20} color={colors.card} weight="bold" />
          <View style={styles.node}><TrophyIcon size={22} color={colors.night} weight="bold" /></View>
        </Animated.View>
      ) : null}
      {beat >= 3 ? (
        <Animated.Text entering={ZoomIn.springify().damping(11)} style={styles.tagline}>
          Turn one goal into a game.
        </Animated.Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 10 },
  word: { fontFamily: typography.display.fontFamily, fontSize: 42, color: colors.card, letterSpacing: -0.5 },
  diagram: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  node: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.lemon, alignItems: 'center', justifyContent: 'center' },
  tagline: { ...typography.title, fontSize: 24, color: colors.card, textAlign: 'center', paddingHorizontal: 30 },
});
