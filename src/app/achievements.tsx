import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, LockSimpleIcon, TrophyIcon } from 'phosphor-react-native';
import { Backdrop, GlassCard, RoundButton } from '../components/ui';
import { achievements } from '../lib/achievements';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Wins() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkIns = useStore((s) => s.checkIns);
  const xp = useStore((s) => s.xp);
  const goal = useStore((s) => s.goal);
  const list = achievements({ checkIns, xp, goal });
  const got = list.filter((a) => a.done).length;

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 22,
        }}
      >
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          Achievements
        </Animated.Text>
        <Text style={styles.lead}>
          {got} of {list.length} earned. Each one comes from real check-ins.
        </Text>
        {list.map((a, i) => (
          <Animated.View key={a.id} entering={FadeInDown.delay(100 + i * 50).duration(500)}>
            <GlassCard style={[styles.row, !a.done && styles.dim]}>
              <View style={[styles.badge, a.done && styles.badgeOn]}>
                {a.done ? (
                  <TrophyIcon size={20} color={colors.navy} weight="fill" />
                ) : (
                  <LockSimpleIcon size={18} color={colors.slate} weight="bold" />
                )}
              </View>
              <View style={styles.body}>
                <Text style={styles.title}>{a.title}</Text>
                <Text style={styles.note}>{a.note}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 20 },
  lead: { ...typography.body, color: colors.navy, marginTop: 8, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dim: { opacity: 0.6 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80,100,118,0.14)',
  },
  badgeOn: { backgroundColor: colors.lemon },
  body: { flex: 1 },
  title: { ...typography.heading, color: colors.navy },
  note: { ...typography.caption, color: colors.bodyMuted, marginTop: 2 },
});
