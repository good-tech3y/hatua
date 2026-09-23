import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { REALMS } from '../lib/realms';
import type { RealmId } from '../lib/realms';
import { colors } from '../theme';
import { HeroFigure } from './art';
import type { Mood } from './art';
import { Bird, Drift, Float, Lantern, TAU, Twinkle, Waves, rnd, styles, tint } from './scene-parts';
import type { Clock } from './scene-parts';

const FAR_PTS: [number, number][] = [[0, 0.66], [0.22, 0.4], [0.42, 0.58], [0.64, 0.28], [0.85, 0.52], [1, 0.38]];
const MID_PTS: [number, number][] = [[0, 0.82], [0.18, 0.55], [0.38, 0.74], [0.58, 0.48], [0.78, 0.7], [1, 0.58]];

const SKY: Record<RealmId, [string, string, string]> = {
  meadow: ['#2F4858', '#B9793F', '#6B3F4E'],
  lagoon: ['#1F3350', '#2E5B66', '#3E6B73'],
  dawn: ['#4A2F4F', '#B85C55', '#D98A4F'],
  dusk: ['#12182A', '#1E2540', '#2B2F4A'],
};
const TERRAIN: Record<RealmId, [string, string, string]> = {
  meadow: ['#2E5048', '#264038', '#5C6B34'],
  lagoon: ['#22354A', '#1C4A4E', '#2E6068'],
  dawn: ['#4C2F42', '#7A3F42', '#9C5A3F'],
  dusk: ['#1B2338', '#232A44', '#2E3350'],
};

// A shared jagged silhouette, recolored and re-shaded per realm.
function mountain(W: number, H: number, pts: [number, number][]) {
  const abs = pts.map(([fx, fy]): [number, number] => [fx * W, fy * H]);
  let fill = `M0 ${H}`;
  abs.forEach(([x, y]) => { fill += ` L${x} ${y}`; });
  fill += ` L${W} ${H} Z`;
  const facets: string[] = [];
  for (let i = 1; i < abs.length - 1; i++) {
    const [px, py] = abs[i];
    const [lx, ly] = abs[i - 1];
    const [rx, ry] = abs[i + 1];
    const base = Math.max(ly, ry);
    facets.push(`M${lx} ${base} L${px} ${py} L${px} ${base} Z`);
    facets.push(`M${px} ${py} L${rx} ${base} L${px} ${base} Z`);
  }
  return { fill, facets };
}

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
      <View style={[styles.abs, { left: 0, top: 0, width: box, height: box, borderRadius: box / 2, backgroundColor: colors.lemon, opacity: 0.18 }]} />
      <View style={[styles.abs, { left: r * 0.5, top: r * 0.5, width: r * 3, height: r * 3, borderRadius: r * 1.5, backgroundColor: colors.lemon, opacity: 0.3 }]} />
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
  return (
    <>
      {realm === 'dusk'
        ? Array.from({ length: 6 + lvl * 4 }, (_, i) => (
            <Twinkle key={`s${i}`} t={t} left={rnd(i, 4) * W} top={rnd(i, 5) * H * 0.5} size={2 + rnd(i, 6) * 2.2}
              n={2 + Math.floor(rnd(i, 7) * 4)} phase={rnd(i, 8)} color={i % 4 === 0 ? colors.lemon : colors.card} />
          ))
        : null}
      {realm === 'dawn'
        ? Array.from({ length: 1 + lvl }, (_, i) => (
            <Drift key={`b${i}`} t={t} span={span} top={30 + rnd(i, 9) * H * 0.22} speed={1} phase={rnd(i, 10)}>
              <Bird t={t} n={30 + i * 6} phase={rnd(i, 11)} color={colors.card} />
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
type Props = {
  realm: RealmId; width: number; height: number; total: number; current: number; level: number;
  mood?: Mood; intro?: boolean; still?: boolean; hero?: boolean; radius?: number;
};

export function RealmScene({
  realm, width: W, height: H, total, current, level,
  mood = 'happy', intro = false, still = false, hero = true, radius = 28,
}: Props) {
  const t = useClock(still);
  const lvl = Math.min(Math.max(level, 1), 3);
  const n = Math.max(total, 1);
  const cur = Math.min(current, n);
  const sky = SKY[realm];
  const [far, mid, ground] = TERRAIN[realm];
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

  const farM = mountain(W, H, FAR_PTS);
  const midM = mountain(W, H, MID_PTS);

  const pos = useSharedValue(intro ? 0 : cur);
  useEffect(() => {
    if (intro) {
      pos.set(withDelay(700, withSequence(
        withTiming(n, { duration: 700 * n, easing: Easing.inOut(Easing.quad) }),
        withDelay(500, withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) })),
      )));
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
  const shadowStyle = useAnimatedStyle(() => {
    const v = pos.get();
    const x = interpolate(v, idx, xs);
    const y = interpolate(v, idx, ys);
    const hop = Math.abs(Math.sin(v * Math.PI));
    return {
      opacity: 0.32 - hop * 0.16,
      transform: [{ translateX: x - 15 }, { translateY: y + 5 }, { scale: 1 - hop * 0.35 }],
    };
  });

  const star = kind === 'star';
  const trail = star
    ? `M${xs[1]} ${ys[1] - 26} ` + xs.slice(2).map((x, k) => `L${x} ${ys[k + 2] - 26}`).join(' ')
    : `M${xs[0]} ${ys[0] + 9} L${xs[n]} ${ys[n] + 9}`;

  return (
    <View style={{ width: W, height: H, borderRadius: radius, overflow: 'hidden', backgroundColor: sky[1] }}>
      <Svg width={W} height={H} style={styles.abs}>
        <Defs>
          <LinearGradient id={`sky-${realm}`} x1="0" y1="0" x2="0" y2="1">
            {sky.map((c, i) => (<Stop key={i} offset={i / 2} stopColor={c} />))}
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
        <Path d={farM.fill} fill={far} />
        {farM.facets.map((d, i) => (<Path key={i} d={d} fill={i % 2 === 0 ? tint(far, -14) : tint(far, 16)} />))}
        <Path d={midM.fill} fill={mid} />
        {midM.facets.map((d, i) => (<Path key={i} d={d} fill={i % 2 === 0 ? tint(mid, -14) : tint(mid, 16)} />))}
        {hero && realm !== 'lagoon' ? (
          <>
            <Path d={`M0 ${yLeft + 12} L${W} ${yRight + 12} V ${H} H 0 Z`} fill={ground} />
            <Path d={`M0 ${yLeft + 9} L${W} ${yRight + 9}`} stroke={tint(ground, 22)} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
          </>
        ) : null}
        {hero && n >= (star ? 2 : 1) ? (
          <Path d={trail} stroke={colors.card} strokeOpacity={star ? 0.5 : 0.75} strokeWidth={star ? 1.5 : 3}
            strokeLinecap="round" strokeDasharray={star ? '3 6' : '0.1 9'} fill="none" />
        ) : null}
      </Svg>

      {realm === 'lagoon' ? (
        <>
          <Waves t={t} width={W} top={H * 0.58} height={H} color={tint(ground, -10)} n={3} amp={4} len={110} />
          <Waves t={t} width={W} top={H * 0.68} height={H} color={ground} n={5} amp={5} len={90} />
          <Waves t={t} width={W} top={H * 0.79} height={H} color={tint(ground, 24)} opacity={0.85} n={7} amp={5} len={70} />
        </>
      ) : null}

      {hero
        ? xs.slice(1).map((x, k) => (<Lantern key={k} x={x} y={ys[k + 1]} lit={cur >= k + 1} big={k + 1 === n} kind={kind} />))
        : null}

      <Near realm={realm} t={t} W={W} H={H} lvl={lvl} />

      {hero ? (
        <Animated.View style={[styles.abs, { left: 0, top: 0, width: 30, height: 10, borderRadius: 5, backgroundColor: colors.night }, shadowStyle]} />
      ) : null}
      {hero ? (
        <Animated.View style={[styles.abs, { left: 0, top: 0 }, heroStyle]}>
          <HeroFigure size={S} alive mood={mood} />
        </Animated.View>
      ) : null}

      <Svg width={W} height={H} style={styles.abs} pointerEvents="none">
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="42%" r="75%">
            <Stop offset="0.5" stopColor={colors.night} stopOpacity="0" />
            <Stop offset="1" stopColor={colors.night} stopOpacity="0.35" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
