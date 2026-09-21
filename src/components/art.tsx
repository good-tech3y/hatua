import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { SKINS } from '../lib/realms';
import { useStore } from '../lib/store';
import { colors } from '../theme';

export type Mood = 'happy' | 'calm' | 'low';

export function HatuaMark({
  size = 28,
  color = colors.cobalt,
  dot = colors.lemon,
}: {
  size?: number;
  color?: string;
  dot?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M7 41 H18 V31 H28 V21 H35"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={39.5} cy={9} r={4.5} fill={dot} stroke={color} strokeWidth={3} />
    </Svg>
  );
}

type HeroProps = {
  size?: number;
  ink?: string;
  scarf?: string;
  face?: string;
  mood?: Mood;
  alive?: boolean;
};

const MOUTH: Record<Mood, string> = {
  happy: 'M43.5 24.5 Q48 29 52.5 24.5',
  calm: 'M44.5 26 H51.5',
  low: 'M43.5 27.5 Q48 23.5 52.5 27.5',
};

function HeroBase({
  size = 96,
  ink = colors.navy,
  scarf = colors.mint,
  face = colors.card,
  mood = 'happy',
  alive = false,
}: HeroProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!alive) return;
    t.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false));
  }, [alive, t]);

  const sway = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(Math.PI * 2 * t.get()) * 1.6 },
      { rotate: `${Math.sin(Math.PI * 2 * t.get()) * 1.5}deg` },
    ],
  }));
  const flutter = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.sin(Math.PI * 4 * t.get() + 0.8) * 8}deg` }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, alive && sway]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: '47% 38%' }, alive && flutter]}>
        <Svg width={size} height={size} viewBox="0 0 96 96">
          <Path d="M45 36 C37 31 29 40 18 35" stroke={scarf} strokeWidth={4.6} strokeLinecap="round" fill="none" />
          <Path d="M45 38 C39 42 33 46 24 46" stroke={scarf} strokeWidth={4.6} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size} viewBox="0 0 96 96">
          <G stroke={ink} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M48 32 L48 60" />
            <Path d="M48 43 L33 54" />
            <Path d="M48 43 L64 32" />
            <Path d="M48 60 L37 83 L30 83" />
            <Path d="M48 60 L60 82 L67 82" />
            <Circle cx={48} cy={21} r={10.5} fill={face} />
          </G>
          <Circle cx={44.4} cy={20} r={1.6} fill={ink} />
          <Circle cx={51.6} cy={20} r={1.6} fill={ink} />
          <Path d={MOUTH[mood]} stroke={ink} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M43 34 H53" stroke={scarf} strokeWidth={5.2} strokeLinecap="round" />
        </Svg>
      </View>
    </Animated.View>
  );
}

// The hero wears the scarf the player picked, unless it is a Pro look and Pro is off.
export function HeroFigure(props: HeroProps) {
  const skin = useStore((s) => s.skin);
  const pro = useStore((s) => s.pro);
  const look = SKINS[skin] ?? SKINS.mint;
  const scarf = look.pro && !pro ? SKINS.mint.scarf : look.scarf;
  return <HeroBase scarf={scarf} {...props} />;
}
