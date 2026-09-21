import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, CaretRightIcon, FileTextIcon, ShieldCheckIcon } from 'phosphor-react-native';
import { RealmPicker, SkinPicker } from '../components/pickers';
import { Backdrop, Chip, GlassCard, PillButton, RoundButton } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pro = useStore((s) => s.pro);
  const realm = useStore((s) => s.realm);
  const skin = useStore((s) => s.skin);
  const setRealm = useStore((s) => s.setRealm);
  const setSkin = useStore((s) => s.setSkin);
  const resetAll = useStore((s) => s.resetAll);

  function startOver() {
    Alert.alert('Start over?', 'This clears your goal, your hero and your check-ins from this phone.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Start over',
        style: 'destructive',
        onPress: () => {
          resetAll();
          router.replace('/welcome');
        },
      },
    ]);
  }

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
          Settings
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <GlassCard>
            <View style={styles.top}>
              <Text style={styles.title}>Hatua Pro</Text>
              <Chip label={pro ? 'On' : 'Off'} active={pro} />
            </View>
            <Text style={styles.body}>
              {pro ? 'Thank you. Every realm and look is yours.' : 'New realms and hero looks. Progress is never for sale.'}
            </Text>
            {!pro ? <PillButton label="See Pro" onPress={() => router.push('/paywall')} /> : null}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.section}>Realms</Text>
          <RealmPicker
            value={realm}
            pro={pro}
            onPick={(id, locked) => (locked ? router.push('/paywall') : setRealm(id))}
          />
          <Text style={styles.section}>Hero looks</Text>
          <SkinPicker
            value={skin}
            pro={pro}
            onPick={(id, locked) => (locked ? router.push('/paywall') : setSkin(id))}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.legal}>
          <GlassCard>
            <Pressable
              style={styles.link}
              onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}
            >
              <FileTextIcon size={22} color={colors.cobalt} weight="bold" />
              <Text style={styles.linkText}>Terms of use</Text>
              <CaretRightIcon size={18} color={colors.slate} weight="bold" />
            </Pressable>
            <Pressable
              style={styles.link}
              onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}
            >
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
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.title, color: colors.navy },
  body: { ...typography.body, color: colors.bodyMuted, marginTop: 8, marginBottom: 16 },
  section: { ...typography.heading, color: colors.navy, marginTop: 26, marginBottom: 12 },
  legal: { marginTop: 26, gap: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  linkText: { ...typography.body, color: colors.navy, flex: 1 },
});
