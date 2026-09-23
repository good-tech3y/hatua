import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, CaretRightIcon, FileTextIcon, ShieldCheckIcon } from 'phosphor-react-native';
import { HeroFigure } from '../components/art';
import { RealmPicker, SkinPicker } from '../components/pickers';
import { Backdrop, Chip, GlassCard, PillButton, RoundButton } from '../components/ui';
import { useAccess } from '../lib/access';
import { levelOf, longestStreak, realDays, streakDays } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unlocked, pro, trialActive, daysLeft } = useAccess();
  const name = useStore((s) => s.name);
  const setName = useStore((s) => s.setName);
  const installedAt = useStore((s) => s.installedAt);
  const xp = useStore((s) => s.xp);
  const checkIns = useStore((s) => s.checkIns);
  const realm = useStore((s) => s.realm);
  const skin = useStore((s) => s.skin);
  const setRealm = useStore((s) => s.setRealm);
  const setSkin = useStore((s) => s.setSkin);
  const resetAll = useStore((s) => s.resetAll);
  const [draft, setDraft] = useState(name);

  const since = installedAt
    ? new Date(installedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'today';

  function startOver() {
    Alert.alert('Start over?', 'This clears your goal, your hero and your check-ins from this phone.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: () => { resetAll(); router.replace('/welcome'); } },
    ]);
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28, paddingHorizontal: 22 }}
      >
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          Profile
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <GlassCard>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <HeroFigure size={58} alive />
              </View>
              <View style={styles.profileBody}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onEndEditing={() => setName(draft.trim())}
                  placeholder="Add your name"
                  placeholderTextColor={colors.muted}
                  maxLength={24}
                  style={styles.nameInput}
                />
                <Text style={styles.sub}>Level {levelOf(xp)} · Playing since {since}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{streakDays(checkIns)}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{longestStreak(checkIns)}</Text>
                <Text style={styles.statLabel}>Best streak</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{realDays(checkIns)}</Text>
                <Text style={styles.statLabel}>Real days</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(600)}>
          <GlassCard>
            <View style={styles.top}>
              <Text style={styles.title}>Hatua Pro</Text>
              <Chip label={pro ? 'On' : trialActive ? `Trial, ${daysLeft}d` : 'Off'} active={unlocked} />
            </View>
            <Text style={styles.body}>
              {pro
                ? 'Thank you. Every realm and look is yours.'
                : trialActive
                  ? 'Everything is unlocked while your free trial runs.'
                  : 'Your trial has ended. Subscribe to keep every realm and look.'}
            </Text>
            {!pro ? <PillButton label="See Pro" onPress={() => router.push('/paywall')} /> : null}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(600)}>
          <Text style={styles.section}>Realms</Text>
          <RealmPicker value={realm} pro={unlocked} onPick={(id, locked) => (locked ? router.push('/paywall') : setRealm(id))} />
          <Text style={styles.section}>Hero colors</Text>
          <SkinPicker value={skin} pro={unlocked} onPick={(id, locked) => (locked ? router.push('/paywall') : setSkin(id))} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).duration(600)} style={styles.legal}>
          <GlassCard>
            <Pressable style={styles.link} onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}>
              <FileTextIcon size={22} color={colors.cobalt} weight="bold" />
              <Text style={styles.linkText}>Terms of use</Text>
              <CaretRightIcon size={18} color={colors.slate} weight="bold" />
            </Pressable>
            <Pressable style={styles.link} onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}>
              <ShieldCheckIcon size={22} color={colors.cobalt} weight="bold" />
              <Text style={styles.linkText}>Privacy policy</Text>
              <CaretRightIcon size={18} color={colors.slate} weight="bold" />
            </Pressable>
          </GlassCard>
          <PillButton tone="light" label="Start over" onPress={startOver} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 20, marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.periwinkle },
  profileBody: { flex: 1 },
  nameInput: { ...typography.heading, fontSize: 18, color: colors.navy, padding: 0 },
  sub: { ...typography.caption, color: colors.bodyMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(80,100,118,0.14)' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { ...typography.title, fontSize: 22, color: colors.cobalt },
  statLabel: { ...typography.caption, color: colors.bodyMuted, marginTop: 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.title, color: colors.navy },
  body: { ...typography.body, color: colors.bodyMuted, marginTop: 8, marginBottom: 16 },
  section: { ...typography.heading, color: colors.navy, marginTop: 26, marginBottom: 12 },
  legal: { marginTop: 26, gap: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  linkText: { ...typography.body, color: colors.navy, flex: 1 },
});
