import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CheckIcon, LockSimpleIcon } from 'phosphor-react-native';
import { RealmScene } from './scene';
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
  const { width } = useWindowDimensions();
  const cardW = Math.floor((width - 44 - 10) / 2);
  return (
    <View style={styles.grid}>
      {REALM_ORDER.map((id) => {
        const r = REALMS[id];
        const locked = r.pro && !pro;
        const on = value === id;
        return (
          <Pressable
            key={id}
            onPress={() => onPick(id, locked)}
            style={[styles.realm, { width: cardW }, on && styles.on]}
          >
            <RealmScene
              realm={id}
              width={cardW - 20}
              height={92}
              total={1}
              current={0}
              level={1}
              still
              hero={false}
              radius={14}
            />
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
    padding: 8,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(252,254,255,0.88)',
  },
  on: { borderColor: colors.cobalt },
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
