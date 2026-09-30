import { Redirect, useRouter } from 'expo-router';
import { CameraIcon, CaretLeftIcon, ImageIcon, PaperPlaneRightIcon, XIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop, GlassCard, PillButton, RoundButton } from '../components/ui';
import { judge } from '../lib/ai';
import { currentQuestIndex, dayKey, settle } from '../lib/game';
import { pickProofPhoto, readProofPhotoBase64 } from '../lib/photo';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function CheckIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goal = useStore((s) => s.goal);
  const checkIns = useStore((s) => s.checkIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const today = dayKey();
  const checkedInToday = checkIns.some((checkIn) => checkIn.day === today);
  if (!goal) return <Redirect href="/welcome" />;
  if (checkedInToday) return <Redirect href="/" />;
  const ready = text.trim().length >= 3 && !busy && (!goal.photoRequired || !!photoUri);

  async function addPhoto(fromCamera: boolean) {
    const uri = await pickProofPhoto(fromCamera);
    if (uri) setPhotoUri(uri);
  }

  async function send() {
    if (!goal || !ready) return;
    setBusy(true);
    setError('');
    try {
      const clean = text.trim();
      const questIndex = currentQuestIndex(goal.quests);
      const quest = goal.quests[questIndex];
      const stepsRemaining = goal.quests.reduce((sum, item) => sum + item.need - item.done, 0);
      const raw = await judge({
        goal: goal.text,
        quest: quest ? quest.title : 'The finish line',
        text: clean,
        recent: checkIns.slice(0, 3).map((c) => c.text),
        ...(photoUri ? { photoBase64: await readProofPhotoBase64(photoUri) } : {}),
        photoRequired: goal.photoRequired,
        questIndex,
        questTotal: goal.quests.length,
        stepsRemaining,
      });
      const settled = settle(checkIns, raw, Boolean(photoUri), stepsRemaining);
      const id = String(Date.now());
      addCheckIn({
        id,
        at: Date.now(),
        day: dayKey(),
        text: clean,
        score: raw.score,
        ...settled,
        ...(photoUri ? { photoUri } : {}),
      });
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

        <Animated.View entering={FadeInDown.delay(250).duration(600)}>
          {photoUri ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <Pressable style={styles.photoRemove} onPress={() => setPhotoUri(null)}>
                <XIcon size={14} color={colors.white} weight="bold" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoRow}>
              <Pressable style={styles.photoBtn} onPress={() => addPhoto(true)} disabled={busy}>
                <CameraIcon size={18} color={colors.navy} weight="bold" />
                <Text style={styles.photoBtnText}>Camera</Text>
              </Pressable>
              <Pressable style={styles.photoBtn} onPress={() => addPhoto(false)} disabled={busy}>
                <ImageIcon size={18} color={colors.navy} weight="bold" />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.photoNote}>
            {goal.photoRequired
              ? 'Photo proof is required for this goal and is sent with your check-in for review.'
              : 'Optional proof can support visible progress. Photos are sent with your check-in for review.'}
          </Text>
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
  photoRow: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(252,254,255,0.7)',
  },
  photoBtnText: { ...typography.label, color: colors.navy },
  photoWrap: { alignSelf: 'flex-start' },
  photo: { width: 96, height: 96, borderRadius: 16 },
  photoRemove: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center',
  },
  photoNote: { ...typography.caption, color: colors.bodyMuted, marginTop: 8, marginBottom: 4 },
  note: { ...typography.caption, color: colors.bodyMuted, marginTop: 12 },
});
