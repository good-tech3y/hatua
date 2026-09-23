import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useAccess } from '../lib/access';
import { REALMS } from '../lib/realms';
import { useStore } from '../lib/store';
import { colors } from '../theme';

export function Backdrop({ variant = 'sky' }: { variant?: 'sky' | 'night' }) {
  const realm = useStore((s) => s.realm);
  const { unlocked } = useAccess();
  const r = REALMS[realm] ?? REALMS.meadow;
  const usable = !r.pro || unlocked ? r : REALMS.meadow;
  const stops: string[] = variant === 'night' ? [colors.night, colors.night, colors.night] : [...usable.stops];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            {stops.map((c, i) => (
              <Stop key={i} offset={i / 2} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bg)" />
      </Svg>
    </View>
  );
}
