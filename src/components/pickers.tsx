import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { CheckIcon, LockSimpleIcon } from 'phosphor-react-native';
import { REALMS, REALM_ORDER, SKINS, SKIN_ORDER } from '../lib/realms';
import type { RealmId, SkinId } from '../lib/realms';
import { colors, typography } from '../theme';

export function RealmPicker({
  value,
  pro,
  onPick,
}: {
  value: RealmId;
  pro: boolean;
  onPick: (id: RealmId, locked: boolean) => void;
}) {
  return (
    <View style={styles.grid}>
      {REALM_ORDER.map((id) => {
        const r = REALMS[id];
        const locked = r.pro && !pro;
        const on = value === id;
        return (
          <Pressable key={id} onPress={() => onPick(id, locked)} style={[styles.realm, on && styles.on]}>
            <Svg width="100%" height={64} style={styles.preview}>
              <Defs>
                <LinearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                  {r.stops.map((c, i) => (
                    <Stop key={i} offset={i / 2} stopColor={c} />
                  ))}
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#g-${id})`} />
            </Svg>
            <View style={styles.row}>
              <Text style={styles.name}>{r.name}</Text>
              {locked ? (
                <LockSimpleIcon size={14} color={colors.slate} weight="bold" />
              ) : on ? (
                <CheckIcon size={14} color={colors.cobalt} weight="bold" />
              ) : null}
            </View>
            <Text style={styles.blurb}>{r.blurb}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SkinPicker({
  value,
  pro,
  onPick,
}: {
  value: SkinId;
  pro: boolean;
  onPick: (id: SkinId, locked: boolean) => void;
}) {
  return (
    <View style={styles.skins}>
      {SKIN_ORDER.map((id) => {
        const s = SKINS[id];
        const locked = s.pro && !pro;
        const on = value === id;
        return (
          <Pressable key={id} onPress={() => onPick(id, locked)} style={styles.skinWrap}>
            <View style={[styles.swatch, { backgroundColor: s.scarf }, on && styles.swatchOn]}>
              {locked ? (
                <LockSimpleIcon size={16} color={colors.navy} weight="bold" />
              ) : on ? (
                <CheckIcon size={16} color={colors.navy} weight="bold" />
              ) : null}
            </View>
            <Text style={styles.skinName}>{s.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  realm: {
    width: '48%',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(252,254,255,0.88)',
  },
  on: { borderColor: colors.cobalt },
  preview: { borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  name: { ...typography.heading, fontSize: 15, color: colors.navy },
  blurb: { ...typography.caption, color: colors.bodyMuted, marginTop: 2, marginBottom: 4 },
  skins: { flexDirection: 'row', gap: 14 },
  skinWrap: { alignItems: 'center', gap: 6 },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  swatchOn: { borderColor: colors.cobalt },
  skinName: { ...typography.caption, color: colors.navy },
});
