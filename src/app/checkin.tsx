import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { judge } from '../lib/ai';
import { currentQuestIndex, dayKey, settle } from '../lib/game';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function CheckIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goal = useStore((s) => s.goal);
  const checkIns = useStore((s) => s.checkIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return <Redirect href="/welcome" />;

  const ready = text.trim().length >= 3 && !busy;

  async function send() {
    if (!goal || !ready) return;
    setBusy(true);
    setError('');
    try {
      const clean = text.trim();
      const quest = goal.quests[currentQuestIndex(goal.quests)];
      const raw = await judge({
        goal: goal.text,
        quest: quest ? quest.title : 'The finish line',
        text: clean,
        recent: checkIns.slice(0, 3).map((c) => c.text),
      });
      const settled = settle(checkIns, raw);
      const id = String(Date.now());
      addCheckIn({ id, at: Date.now(), day: dayKey(), text: clean, score: raw.score, ...settled });
      router.replace({ pathname: '/verdict', params: { id } });
    } catch {
      setError('I could not reach the judge just now. Your words are still here. Try again.');
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 40 }}
      >
        <RoundButton onPress={() => router.back()}>
          <CaretLeftIcon size={22} color={colors.navy} weight="bold" />
        </RoundButton>
        <Animated.Text entering={FadeInDown.duration(600)} style={styles.headline}>
          What did you actually do?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.lead}>
          Say it plainly. What did you do, and how much of it?
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <GlassCard style={styles.card}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write it like you would tell a friend"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={400}
              autoFocus
              editable={!busy}
              style={styles.input}
            />
          </GlassCard>
        </Animated.View>
        {error ? <Text style={styles.note}>{error}</Text> : null}
        <View style={{ opacity: ready ? 1 : 0.45 }}>
          <PillButton
            label={busy ? 'Reading it' : 'Send to Hatua'}
            onPress={send}
            icon={
              busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <PaperPlaneRightIcon size={18} color={colors.white} weight="bold" />
              )
            }
          />
        </View>
        <Text style={styles.note}>Specific beats long. Hatua reads for what really changed.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  headline: { ...typography.title, color: colors.cobalt, marginTop: 20 },
  lead: { ...typography.body, color: colors.navy, marginTop: 8, marginBottom: 20 },
  card: { marginBottom: 16 },
  input: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 25,
    color: colors.navy,
    minHeight: 110,
    textAlignVertical: 'top',
    padding: 0,
  },
  note: { ...typography.caption, color: colors.bodyMuted, marginTop: 12 },
});
