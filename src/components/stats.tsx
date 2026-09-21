import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '../theme';

export function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  const pct = Math.max(0, Math.min(100, value));

  useEffect(() => {
    progress.set(withTiming(pct / 100, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [pct, progress]);

  const fill = useAnimatedStyle(() => ({ width: progress.get() * width }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(pct)}</Text>
      </View>
      <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...typography.label, color: colors.navy },
  value: { ...typography.caption, color: colors.bodyMuted },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(80,100,118,0.16)',
  },
  fill: { height: 8, borderRadius: 999 },
});
