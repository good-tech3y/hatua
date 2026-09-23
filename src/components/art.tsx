import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAccess } from '../lib/access';
import { SKINS } from '../lib/realms';
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

// A flat rounded body carries the color. Thin lines give it arms, legs and a face.
const MOUTH: Record<Mood, string> = {
  happy: 'M40.5 43.5 Q48 50 55.5 43.5',
  calm: 'M42 46 H54',
  low: 'M40.5 48 Q48 42 55.5 48',
};

function HeroBase({ size = 96, body = colors.mint, ink = colors.navy, mood = 'happy', alive = false }: HeroProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!alive) return;
    t.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false));
  }, [alive, t]);

  const sway = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(Math.PI * 2 * t.get()) * 1.6 },
      { rotate: `${Math.sin(Math.PI * 2 * t.get()) * 1.4}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, alive && sway]}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Path d="M40 60 L36 82" stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M56 60 L60 82" stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M30 82 H42" stroke={ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M54 82 H66" stroke={ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M28 36 L15 48" stroke={ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <Path d="M70 36 L83 48" stroke={ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        <Circle cx={15} cy={49} r={4} stroke={ink} strokeWidth={2.2} fill="none" />
        <Circle cx={83} cy={49} r={4} stroke={ink} strokeWidth={2.2} fill="none" />
        <Rect x={27} y={13} width={44} height={47} rx={20} fill={body} />
        <Circle cx={40} cy={34} r={2.3} fill={ink} />
        <Circle cx={57.5} cy={34} r={2.3} fill={ink} />
        <Path d={MOUTH[mood]} stroke={ink} strokeWidth={1.9} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

// The hero's color is whichever look the player picked, unless it is a Pro look and access has lapsed.
export function HeroFigure(props: HeroProps) {
  const skin = useStore((s) => s.skin);
  const { unlocked } = useAccess();
  const look = SKINS[skin] ?? SKINS.mint;
  const body = look.pro && !unlocked ? SKINS.mint.scarf : look.scarf;
  return <HeroBase body={body} {...props} />;
}
