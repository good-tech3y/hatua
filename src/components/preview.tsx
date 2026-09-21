import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RealmScene } from './scene';
import { REALMS } from '../lib/realms';
import type { RealmId } from '../lib/realms';
import { colors, typography } from '../theme';

const TOUR: RealmId[] = ['lagoon', 'dawn', 'dusk'];

// A live tour of the Pro worlds, shown at the top of the paywall.
export function PaywallPreview() {
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setI((v) => (v + 1) % TOUR.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const id = TOUR[i];
  const r = REALMS[id];

  return (
    <View style={styles.wrap}>
      <Animated.View key={id} entering={FadeIn.duration(700)}>
        <RealmScene realm={id} width={width - 44} height={230} total={5} current={2} level={2} />
      </Animated.View>
      <View style={styles.tag}>
        <Text style={styles.name}>{r.name}</Text>
        <Text style={styles.blurb}>{r.blurb}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, marginBottom: 18 },
  tag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(252,254,255,0.88)',
  },
  name: { ...typography.heading, fontSize: 15, color: colors.navy },
  blurb: { ...typography.caption, color: colors.bodyMuted },
});
