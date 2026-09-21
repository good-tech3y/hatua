import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native';
import { Backdrop, GlassCard, PillButton } from '../components/ui';
import { isDemo, makeQuests } from '../lib/ai';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function Goal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startGoal = useStore((s) => s.startGoal);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = text.trim().length >= 4 && !busy;

  async function submit() {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      const goal = text.trim();
      const titles = await makeQuests(goal);
      startGoal(goal, titles);
      router.replace({ pathname: '/path', params: { intro: '1' } });
    } catch {
      setError('I could not reach the AI just now. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 28, paddingHorizontal: 22, paddingBottom: 40 }}
      >
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          What do you want to work toward?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.lead}>
          One goal at a time. Keep it short and honest.
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <GlassCard style={styles.card}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="For example: run a 5k by December"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={120}
              autoFocus
              editable={!busy}
              style={styles.input}
            />
          </GlassCard>
        </Animated.View>
        {error ? <Text style={styles.note}>{error}</Text> : null}
        <View style={{ opacity: ready ? 1 : 0.45 }}>
          <PillButton
            label={busy ? 'Building your path' : 'Make my quests'}
            onPress={submit}
            icon={
              busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <ArrowRightIcon size={18} color={colors.white} weight="bold" />
              )
            }
          />
        </View>
        {isDemo ? (
          <Text style={styles.note}>Demo mode: quests are generic until the AI is connected.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.title, color: colors.cobalt },
  lead: { ...typography.body, color: colors.navy, marginTop: 8, marginBottom: 20 },
  card: { marginBottom: 16 },
  input: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 26,
    color: colors.navy,
    minHeight: 84,
    textAlignVertical: 'top',
    padding: 0,
  },
  note: { ...typography.caption, color: colors.bodyMuted, marginTop: 12 },
});
