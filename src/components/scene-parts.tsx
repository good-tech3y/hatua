import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

export const TAU = Math.PI * 2;
export type Clock = SharedValue<number>;
type Kids = { children: ReactNode };

// The same input always gives the same number, so scenes never jump around.
export const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const styles = StyleSheet.create({ abs: { position: 'absolute' } });

export function Drift({
  t, span, top, speed, phase, children,
}: Kids & { t: Clock; span: number; top: number; speed: number; phase: number }) {
  const a = useAnimatedStyle(() => ({
    transform: [{ translateX: ((phase + t.get() * speed) % 1) * span - 90 }],
  }));
  return <Animated.View style={[styles.abs, { top }, a]}>{children}</Animated.View>;
}

export function Float({
  t, left, top, range, speed, phase, children,
}: Kids & { t: Clock; left: number; top: number; range: number; speed: number; phase: number }) {
  const a = useAnimatedStyle(() => {
    const p = (phase + t.get() * speed) % 1;
    return {
      opacity: Math.sin(Math.PI * p),
      transform: [{ translateY: -p * range }, { translateX: Math.sin(TAU * (p * 2 + phase)) * 8 }],
    };
  });
  return <Animated.View style={[styles.abs, { left, top }, a]}>{children}</Animated.View>;
}

export function Twinkle({
  t, left, top, size, n, phase, color,
}: { t: Clock; left: number; top: number; size: number; n: number; phase: number; color: string }) {
  const a = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(TAU * (t.get() * n + phase))),
  }));
  return (
    <Animated.View
      style={[styles.abs, { left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, a]}
    />
  );
}

export function Cloud({ s = 1, tint = colors.card }: { s?: number; tint?: string }) {
  return (
    <View style={{ width: 74 * s, height: 34 * s }}>
      <View style={[styles.abs, { left: 0, bottom: 0, width: 74 * s, height: 20 * s, borderRadius: 10 * s, backgroundColor: tint }]} />
      <View style={[styles.abs, { left: 12 * s, bottom: 8 * s, width: 28 * s, height: 28 * s, borderRadius: 14 * s, backgroundColor: tint }]} />
      <View style={[styles.abs, { left: 34 * s, bottom: 8 * s, width: 22 * s, height: 22 * s, borderRadius: 11 * s, backgroundColor: tint }]} />
    </View>
  );
}

export function Bird({ t, n, phase, color }: { t: Clock; n: number; phase: number; color: string }) {
  const a = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.55 + 0.45 * Math.abs(Math.sin(Math.PI * (t.get() * n + phase))) }],
  }));
  return (
    <Animated.View style={a}>
      <Svg width={20} height={10} viewBox="0 0 20 10">
        <Path d="M1 8 Q5 -1 10 6 Q15 -1 19 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

export function Boat({ t }: { t: Clock }) {
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(TAU * t.get() * 6) * 2.5 },
      { rotate: `${Math.sin(TAU * t.get() * 6 + 1) * 3}deg` },
    ],
  }));
  return (
    <Animated.View style={a}>
      <Svg width={40} height={34} viewBox="0 0 40 34">
        <Path d="M20 2 V22 L6 22 Z" fill={colors.card} />
        <Path d="M22 6 V22 L33 22 Z" fill={colors.lemon} />
        <Path d="M4 24 H36 L31 32 H9 Z" fill={colors.cobalt} />
      </Svg>
    </Animated.View>
  );
}

export function Waves({
  t, width, top, height, color, opacity = 1, n, amp, len,
}: { t: Clock; width: number; top: number; height: number; color: string; opacity?: number; n: number; amp: number; len: number }) {
  const count = Math.ceil(width / len) + 2;
  let d = `M0 ${amp + 2}`;
  for (let i = 0; i < count; i++) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
  d += ` V ${height} H 0 Z`;
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: -((t.get() * n) % 1) * len }] }));
  return (
    <Animated.View style={[styles.abs, { left: 0, top }, a]}>
      <Svg width={count * len} height={height}>
        <Path d={d} fill={color} fillOpacity={opacity} />
      </Svg>
    </Animated.View>
  );
}

type LanternProps = { x: number; y: number; lit: boolean; big?: boolean; kind: 'post' | 'stone' | 'star' };

export function Lantern({ x, y, lit, big, kind }: LanternProps) {
  const glow = useSharedValue(lit ? 1 : 0);
  useEffect(() => {
    glow.set(withTiming(lit ? 1 : 0, { duration: 700 }));
  }, [lit, glow]);

  const s = big ? 1.4 : 1;
  const lift = (kind === 'star' ? 26 : kind === 'stone' ? 15 : 19) * s;
  const orb = 11 * s;
  const halo = 34 * s;
  const cy = y - lift;

  const orbStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * glow.get(),
    transform: [{ scale: 0.9 + 0.2 * glow.get() }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * glow.get(),
    transform: [{ scale: 0.6 + 0.5 * glow.get() }],
  }));

  return (
    <>
      {kind === 'stone' ? (
        <View style={[styles.abs, { left: x - 16 * s, top: y - 3, width: 32 * s, height: 9 * s, borderRadius: 5 * s, backgroundColor: colors.card }]} />
      ) : null}
      {kind !== 'star' ? (
        <View style={[styles.abs, { left: x - 1.5, top: cy, width: 3, height: lift, backgroundColor: colors.navy, opacity: 0.5 }]} />
      ) : null}
      <Animated.View
        style={[styles.abs, { left: x - halo / 2, top: cy - halo / 2, width: halo, height: halo, borderRadius: halo / 2, backgroundColor: colors.lemon }, haloStyle]}
      />
      {kind === 'star' ? (
        <Animated.View style={[styles.abs, { left: x - 10 * s, top: cy - 10 * s }, orbStyle]}>
          <Svg width={20 * s} height={20 * s} viewBox="0 0 18 18">
            <Path d="M9 0 L11 7 L18 9 L11 11 L9 18 L7 11 L0 9 L7 7 Z" fill={colors.lemon} stroke={colors.cobalt} strokeWidth={1} strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      ) : (
        <Animated.View
          style={[styles.abs, { left: x - orb / 2, top: cy - orb / 2, width: orb, height: orb, borderRadius: orb / 2, backgroundColor: colors.lemon, borderWidth: 2, borderColor: colors.cobalt }, orbStyle]}
        />
      )}
    </>
  );
}
