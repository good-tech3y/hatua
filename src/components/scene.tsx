import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { REALMS } from '../lib/realms';
import type { RealmId } from '../lib/realms';
import { colors } from '../theme';
import { HeroFigure } from './art';
import type { Mood } from './art';
import { Bird, Boat, Cloud, Drift, Float, Lantern, TAU, Twinkle, Waves, rnd, styles } from './scene-parts';
import type { Clock } from './scene-parts';

// Far hills, near hills, ground. Every color comes from the reference palette.
const HILLS: Record<RealmId, [string, string, string]> = {
  meadow: [colors.blueSoft, colors.teal, colors.mint],
  lagoon: [colors.blueSoft, colors.teal, colors.card],
  dawn: [colors.periwinkle, '#C5BDD6', '#CDB6C2'],
  dusk: [colors.slateSoft, colors.slate, colors.navy],
};

function useClock(still: boolean) {
  const t = useSharedValue(still ? 0.3 : 0);
  useEffect(() => {
    if (still) return;
    t.set(withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1, false));
  }, [still, t]);
  return t;
}

function Sun({ t, cx, cy, r }: { t: Clock; cx: number; cy: number; r: number }) {
  const pulse = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.05 * Math.sin(TAU * t.get() * 3) }] }));
  const box = r * 4;
  return (
    <Animated.View style={[styles.abs, { left: cx - box / 2, top: cy - box / 2, width: box, height: box }, pulse]}>
      <View style={[styles.abs, { left: 0, top: 0, width: box, height: box, borderRadius: box / 2, backgroundColor: colors.lemon, opacity: 0.16 }]} />
      <View style={[styles.abs, { left: r * 0.5, top: r * 0.5, width: r * 3, height: r * 3, borderRadius: r * 1.5, backgroundColor: colors.lemon, opacity: 0.26 }]} />
      <View style={[styles.abs, { left: r, top: r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: colors.lemon }]} />
    </Animated.View>
  );
}

function Moon({ left, top }: { left: number; top: number }) {
  return (
    <View style={[styles.abs, { left, top }]}>
      <Svg width={44} height={44} viewBox="-22 -22 44 44">
        <Path d="M9.71 -12.71 A16 16 0 1 0 9.71 12.71 A13 13 0 1 1 9.71 -12.71 Z" fill={colors.lemon} />
      </Svg>
    </View>
  );
}

type AmbientProps = { realm: RealmId; t: Clock; W: number; H: number; lvl: number };

function Far({ realm, t, W, H, lvl }: AmbientProps) {
  const span = W + 180;
  const clouds = realm === 'lagoon' || realm === 'dawn' ? 2 : 1 + lvl;
  const tint = realm === 'dawn' ? colors.lilacGlow : realm === 'dusk' ? '#C5BDD6' : colors.card;
  return (
    <>
      {Array.from({ length: clouds }, (_, i) => (
        <Drift key={`c${i}`} t={t} span={span} top={10 + rnd(i, 1) * H * 0.28} speed={1} phase={rnd(i, 2)}>
          <Cloud s={0.7 + rnd(i, 3) * 0.6} tint={tint} />
        </Drift>
      ))}
      {realm === 'dusk'
        ? Array.from({ length: 6 + lvl * 4 }, (_, i) => (
            <Twinkle
              key={`s${i}`}
              t={t}
              left={rnd(i, 4) * W}
              top={rnd(i, 5) * H * 0.5}
              size={2 + rnd(i, 6) * 2.2}
              n={2 + Math.floor(rnd(i, 7) * 4)}
              phase={rnd(i, 8)}
              color={i % 4 === 0 ? colors.lemon : colors.card}
            />
          ))
        : null}
      {realm === 'dawn'
        ? Array.from({ length: 1 + lvl }, (_, i) => (
            <Drift key={`b${i}`} t={t} span={span} top={30 + rnd(i, 9) * H * 0.22} speed={1} phase={rnd(i, 10)}>
              <Bird t={t} n={30 + i * 6} phase={rnd(i, 11)} color={colors.slate} />
            </Drift>
          ))
        : null}
    </>
  );
}

const Firefly = () => (
  <View>
    <View style={[styles.abs, { left: -5, top: -5, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.lemon, opacity: 0.25 }]} />
    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lemon }} />
  </View>
);

function Near({ realm, t, W, H, lvl }: AmbientProps) {
  if (realm === 'meadow') {
    return (
      <>
        {Array.from({ length: 3 + lvl * 2 }, (_, i) => (
          <Float key={i} t={t} left={rnd(i, 21) * W} top={H * 0.55 + rnd(i, 22) * H * 0.3} range={70} speed={1 + (i % 2)} phase={rnd(i, 23)}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: i % 2 ? colors.lemon : colors.card }} />
          </Float>
        ))}
      </>
    );
  }
  if (realm === 'lagoon') {
    return (
      <>
        {Array.from({ length: 4 + lvl * 2 }, (_, i) => (
          <Float key={i} t={t} left={rnd(i, 31) * W} top={H * 0.78 + rnd(i, 32) * H * 0.15} range={H * 0.4} speed={1 + (i % 2)} phase={rnd(i, 33)}>
            <View style={{ width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.5, borderColor: colors.card }} />
          </Float>
        ))}
      </>
    );
  }
  if (realm === 'dusk') {
    return (
      <>
        {Array.from({ length: 3 + lvl * 2 }, (_, i) => (
          <Float key={i} t={t} left={rnd(i, 41) * W} top={H * 0.6 + rnd(i, 42) * H * 0.25} range={90} speed={1 + (i % 2)} phase={rnd(i, 43)}>
            <Firefly />
          </Float>
        ))}
      </>
    );
  }
  return null;
}

type Props = {
  realm: RealmId;
  width: number;
  height: number;
  total: number;
  current: number;
  level: number;
  mood?: Mood;
  intro?: boolean;
  still?: boolean;
  hero?: boolean;
  radius?: number;
};

export function RealmScene({
  realm, width: W, height: H, total, current, level,
  mood = 'happy', intro = false, still = false, hero = true, radius = 28,
}: Props) {
  const t = useClock(still);
  const lvl = Math.min(Math.max(level, 1), 3);
  const n = Math.max(total, 1);
  const cur = Math.min(current, n);
  const stops = REALMS[realm].stops;
  const [far, mid, ground] = HILLS[realm];
  const kind = realm === 'lagoon' ? 'stone' : realm === 'dusk' ? 'star' : 'post';

  const S = Math.min(70, H * 0.28);
  const pad = 32;
  const baseY = H - 48;
  const rise = Math.min(64, H * 0.25);
  const xs = Array.from({ length: n + 1 }, (_, i) => pad + (i * (W - pad * 2)) / n);
  const ys = Array.from({ length: n + 1 }, (_, i) => baseY - (rise * i) / n);
  const idx = xs.map((_, i) => i);
  const slope = (ys[n] - ys[0]) / (xs[n] - xs[0]);
  const yLeft = ys[0] - slope * xs[0];
  const yRight = ys[0] + slope * (W - xs[0]);

  const pos = useSharedValue(intro ? 0 : cur);
  useEffect(() => {
    if (intro) {
      pos.set(
        withDelay(
          700,
          withSequence(
            withTiming(n, { duration: 700 * n, easing: Easing.inOut(Easing.quad) }),
            withDelay(500, withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) })),
          ),
        ),
      );
    } else {
      pos.set(withTiming(cur, { duration: 900, easing: Easing.inOut(Easing.cubic) }));
    }
  }, [intro, cur, n, pos]);

  const heroStyle = useAnimatedStyle(() => {
    const v = pos.get();
    const x = interpolate(v, idx, xs);
    const y = interpolate(v, idx, ys);
    const hop = Math.abs(Math.sin(v * Math.PI)) * 14;
    return { transform: [{ translateX: x - S / 2 - 12 }, { translateY: y + 8 - S * 0.865 - hop }] };
  });

  const star = kind === 'star';
  const trail = star
    ? `M${xs[1]} ${ys[1] - 26} ` + xs.slice(2).map((x, k) => `L${x} ${ys[k + 2] - 26}`).join(' ')
    : `M${xs[0]} ${ys[0] + 9} L${xs[n]} ${ys[n] + 9}`;

  return (
    <View style={{ width: W, height: H, borderRadius: radius, overflow: 'hidden', backgroundColor: stops[1] }}>
      <Svg width={W} height={H} style={styles.abs}>
        <Defs>
          <LinearGradient id={`sky-${realm}`} x1="0" y1="0" x2="0" y2="1">
            {stops.map((c, i) => (
              <Stop key={i} offset={i / 2} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Path d={`M0 0 H${W} V${H} H0 Z`} fill={`url(#sky-${realm})`} />
      </Svg>

      {realm === 'meadow' ? <Sun t={t} cx={W * 0.8} cy={H * 0.2} r={20} /> : null}
      {realm === 'lagoon' ? <Sun t={t} cx={W * 0.22} cy={H * 0.26} r={16} /> : null}
      {realm === 'dawn' ? <Sun t={t} cx={W * 0.5} cy={H * 0.44} r={28} /> : null}
      {realm === 'dusk' ? <Moon left={W * 0.78} top={H * 0.1} /> : null}

      <Far realm={realm} t={t} W={W} H={H} lvl={lvl} />

      <Svg width={W} height={H} style={styles.abs}>
        <Path
          d={`M0 ${H * 0.62} C ${W * 0.25} ${H * 0.46} ${W * 0.5} ${H * 0.7} ${W * 0.75} ${H * 0.54} S ${W} ${H * 0.5} ${W} ${H * 0.5} V ${H} H 0 Z`}
          fill={far}
        />
        <Path d={`M0 ${H * 0.74} C ${W * 0.3} ${H * 0.6} ${W * 0.6} ${H * 0.82} ${W} ${H * 0.64} V ${H} H 0 Z`} fill={mid} />
        {hero && realm !== 'lagoon' ? (
          <Path d={`M0 ${yLeft + 12} L${W} ${yRight + 12} V ${H} H 0 Z`} fill={ground} />
        ) : null}
        {hero && n >= (star ? 2 : 1) ? (
          <Path
            d={trail}
            stroke={colors.card}
            strokeOpacity={star ? 0.5 : 0.75}
            strokeWidth={star ? 1.5 : 3}
            strokeLinecap="round"
            strokeDasharray={star ? '3 6' : '0.1 9'}
            fill="none"
          />
        ) : null}
      </Svg>

      {realm === 'lagoon' ? (
        <>
          <Drift t={t} span={W + 180} top={H * 0.47} speed={1} phase={0.15}>
            <Boat t={t} />
          </Drift>
          <Waves t={t} width={W} top={H * 0.58} height={H} color={colors.blueSoft} n={3} amp={4} len={110} />
          <Waves t={t} width={W} top={H * 0.68} height={H} color={colors.periwinkle} n={5} amp={5} len={90} />
          <Waves t={t} width={W} top={H * 0.79} height={H} color={colors.card} opacity={0.75} n={7} amp={5} len={70} />
        </>
      ) : null}

      {hero
        ? xs.slice(1).map((x, k) => (
            <Lantern key={k} x={x} y={ys[k + 1]} lit={cur >= k + 1} big={k + 1 === n} kind={kind} />
          ))
        : null}

      <Near realm={realm} t={t} W={W} H={H} lvl={lvl} />

      {hero ? (
        <Animated.View style={[styles.abs, { left: 0, top: 0 }, heroStyle]}>
          <HeroFigure size={S} alive mood={mood} />
        </Animated.View>
      ) : null}
    </View>
  );
}
