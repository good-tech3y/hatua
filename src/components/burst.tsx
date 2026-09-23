import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '../theme';

const TONES = [colors.lemon, colors.mint, colors.violetSoft, colors.periwinkle, colors.cobalt];
const N = 18;

function Bit({ i, play }: { i: number; play: boolean }) {
  const p = useSharedValue(0);
  const angle = (i / N) * Math.PI * 2 + (i % 3) * 0.25;
  const dist = 60 + ((i * 37) % 55);
  const size = 7 + (i % 3) * 2;

  useEffect(() => {
    if (play) {
      p.set(withDelay((i % 4) * 40, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })));
    }
  }, [play, i, p]);

  const a = useAnimatedStyle(() => {
    const v = p.get();
    return {
      opacity: v === 0 ? 0 : 1 - v * v,
      transform: [
        { translateX: Math.cos(angle) * dist * v },
        { translateY: Math.sin(angle) * dist * v + v * v * 36 },
        { rotate: `${v * 240}deg` },
        { scale: 1 - v * 0.4 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.bit,
        { width: size, height: size, borderRadius: i % 2 ? size / 2 : 2, backgroundColor: TONES[i % TONES.length] },
        a,
      ]}
    />
  );
}

export function Burst({ play }: { play: boolean }) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {Array.from({ length: N }, (_, i) => (
        <Bit key={i} i={i} play={play} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bit: { position: 'absolute' },
});
