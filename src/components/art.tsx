import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAccess } from '../lib/access';
import { SKINS } from '../lib/realms';
import { tint } from './scene-parts';
import { useStore } from '../lib/store';
import { colors } from '../theme';

export type Mood = 'happy' | 'calm' | 'low';

export function HatuaMark({ size = 28, color = colors.cobalt, dot = colors.lemon }: { size?: number; color?: string; dot?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d="M7 41 H18 V31 H28 V21 H35" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={39.5} cy={9} r={4.5} fill={dot} stroke={color} strokeWidth={3} />
    </Svg>
  );
}

type HeroProps = { size?: number; body?: string; ink?: string; mood?: Mood; alive?: boolean };

// A hooded, faceted traveler. No face, just a warm lantern that glows brighter on real progress.
const TILT: Record<Mood, number> = { happy: 2, calm: 0, low: -6 };
const GLOW: Record<Mood, number> = { happy: 1, calm: 0.7, low: 0.4 };

function HeroBase({ size = 96, body = colors.terracotta, ink = colors.navy, mood = 'happy', alive = false }: HeroProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!alive) return;
    t.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false));
  }, [alive, t]);

  const lit = tint(body, 26);
  const shade = tint(body, -22);
  const glow = GLOW[mood];
  const baseTilt = TILT[mood];

  const sway = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(Math.PI * 2 * t.get()) * 1.5 },
      { rotate: `${baseTilt + Math.sin(Math.PI * 2 * t.get()) * 1.3}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, alive && sway]}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx={73} cy={70} r={13} fill={colors.lemon} opacity={0.16 * glow} />
        <Path d="M66 58 L66 72" stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M68 65 L78 63 L77 76 L67 77 Z" fill={colors.lemon} opacity={0.5 + 0.5 * glow} />
        <Path d="M30 80 L42 80 L39 84 L27 84 Z" fill={ink} />
        <Path d="M54 80 L66 80 L69 84 L57 84 Z" fill={ink} />
        <Path d="M35 52 L48 52 L48 80 L23 80 Z" fill={lit} />
        <Path d="M48 52 L61 52 L73 80 L48 80 Z" fill={shade} />
        <Path d="M48 10 L48 52 L27 42 Z" fill={lit} />
        <Path d="M48 10 L69 42 L48 52 Z" fill={shade} />
        <Path d="M40 32 L56 32 L53 44 L43 44 Z" fill={ink} />
      </Svg>
    </Animated.View>
  );
}

// The hero's cloak is whichever look the player picked, unless it is a Pro look and access has lapsed.
export function HeroFigure(props: HeroProps) {
  const skin = useStore((s) => s.skin);
  const { unlocked } = useAccess();
  const look = SKINS[skin] ?? SKINS.mint;
  const body = look.pro && !unlocked ? SKINS.mint.scarf : look.scarf;
  return <HeroBase body={body} {...props} />;
}
