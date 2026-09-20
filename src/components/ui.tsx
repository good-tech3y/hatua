import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, radii, shadow, typography } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Backdrop({ variant = 'sky' }: { variant?: 'sky' | 'paper' | 'night' }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.skyDeep} />
            <Stop offset="0.4" stopColor={colors.sky} />
            <Stop offset="1" stopColor={colors.skyMist} />
          </LinearGradient>
          <RadialGradient id="peach" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.peach} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.peach} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="lilac" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.lilacGlow} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.lilacGlow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {variant === 'sky' && <Rect width="100%" height="100%" fill="url(#sky)" />}
        {variant === 'night' && <Rect width="100%" height="100%" fill={colors.night} />}
        {variant === 'paper' && (
          <>
            <Rect width="100%" height="100%" fill={colors.paper} />
            <Circle cx="12%" cy="28%" r="55%" fill="url(#peach)" />
            <Circle cx="92%" cy="10%" r="50%" fill="url(#lilac)" />
          </>
        )}
      </Svg>
    </View>
  );
}

export function GlassCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function RoundButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.round}>
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [value, progress]);

  const fill = useAnimatedStyle(() => ({ width: progress.get() * width }));

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

const pillTones = {
  ink: { bg: colors.pill, fg: colors.white, border: colors.pill },
  light: { bg: colors.white, fg: colors.ink, border: 'rgba(15,15,16,0.08)' },
  ghost: { bg: 'transparent', fg: colors.white, border: 'rgba(255,255,255,0.18)' },
} as const;

export function PillButton({
  label,
  onPress,
  tone = 'ink',
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  tone?: 'ink' | 'light' | 'ghost';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const t = pillTones[tone];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => scale.set(withSpring(0.97, { damping: 18, stiffness: 320 }))}
      onPressOut={() => scale.set(withSpring(1, { damping: 14, stiffness: 260 }))}
      style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }, animated, style]}
    >
      <Text style={[styles.pillLabel, { color: t.fg }]}>{label}</Text>
      {icon}
    </AnimatedPressable>
  );
}

export type ToolbarItem = { key: string; icon: (color: string) => ReactNode };

export function Toolbar({
  items,
  activeKey,
  onChange,
}: {
  items: ToolbarItem[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.toolbar}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.toolbarBtn, active && styles.toolbarBtnActive]}
          >
            {item.icon(active ? colors.slate : colors.white)}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(252,254,255,0.88)',
    borderRadius: radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
    ...shadow.soft,
  },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radii.chip },
  chipActive: { backgroundColor: colors.lemon },
  chipIdle: { backgroundColor: 'rgba(255,255,255,0.55)' },
  chipLabel: { ...typography.label, color: colors.navy },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(80,100,118,0.16)',
  },
  fill: { height: 10, borderRadius: 999, backgroundColor: colors.slate },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 28,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  pillLabel: { fontFamily: typography.heading.fontFamily, fontSize: 16 },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
    padding: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(80,100,118,0.95)',
    ...shadow.soft,
  },
  toolbarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarBtnActive: { backgroundColor: colors.card },
});
