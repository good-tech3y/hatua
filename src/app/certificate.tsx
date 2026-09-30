import { Redirect, useRouter } from 'expo-router';
import { CaretLeftIcon, DownloadSimpleIcon, TrophyIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { saveCertificate } from '../lib/certificate';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Certificate() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goal = useStore((s) => s.goal);
  const name = useStore((s) => s.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!goal || !goal.quests.every((quest) => quest.done >= quest.need)) return <Redirect href="/" />;
  const currentGoal = goal;

  async function download() {
    setBusy(true);
    setError('');
    try {
      await saveCertificate(name, currentGoal.text, currentGoal.completedAt ?? currentGoal.createdAt);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not prepare your certificate.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 22 }}>
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>
        <View style={styles.heading}>
          <TrophyIcon size={28} color={colors.cobalt} weight="fill" />
          <Text style={styles.title}>You earned this.</Text>
        </View>
        <GlassCard style={styles.certificate}>
          <Text style={styles.brand}>HATUA</Text>
          <Text style={styles.certificateTitle}>Certificate of Completion</Text>
          <Text style={styles.caption}>Presented to</Text>
          <Text style={styles.name}>{name.trim() || 'Goal Achiever'}</Text>
          <Text style={styles.caption}>for completing</Text>
          <Text style={styles.goal}>{currentGoal.text}</Text>
          <Text style={styles.date}>{new Date(currentGoal.completedAt ?? currentGoal.createdAt).toLocaleDateString()}</Text>
        </GlassCard>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PillButton
          label={busy ? 'Preparing certificate' : 'Download certificate'}
          onPress={busy ? undefined : download}
          icon={busy ? <ActivityIndicator color={colors.white} /> : <DownloadSimpleIcon size={18} color={colors.white} weight="bold" />}
        />
        <Text style={styles.note}>On web, choose “Save as PDF” in the print dialog. On mobile, save or share the PDF.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26, marginBottom: 18 },
  title: { ...typography.title, color: colors.cobalt },
  certificate: { alignItems: 'center', borderColor: colors.lemon, borderWidth: 2, paddingVertical: 34 },
  brand: { ...typography.label, color: colors.cobalt },
  certificateTitle: { ...typography.heading, color: colors.navy, textAlign: 'center', marginTop: 16 },
  caption: { ...typography.caption, color: colors.bodyMuted, marginTop: 18 },
  name: { ...typography.display, color: colors.cobalt, textAlign: 'center', marginTop: 6 },
  goal: { ...typography.heading, color: colors.navy, textAlign: 'center', marginTop: 8 },
  date: { ...typography.caption, color: colors.bodyMuted, marginTop: 22 },
  error: { ...typography.caption, color: colors.coral, marginVertical: 12 },
  note: { ...typography.caption, color: colors.bodyMuted, textAlign: 'center', marginTop: 12 },
});