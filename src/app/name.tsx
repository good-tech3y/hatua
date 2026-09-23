import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native';
import { HeroFigure } from '../components/art';
import { Backdrop, GlassCard, PillButton } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, typography } from '../theme';

export default function NameStep() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setName = useStore((s) => s.setName);
  const [text, setText] = useState('');

  function next() {
    if (text.trim()) setName(text.trim());
    router.push('/goal');
  }

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 28, paddingHorizontal: 22, paddingBottom: 40 }}
      >
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotOn]} />
          <View style={styles.dot} />
        </View>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.avatar}>
          <HeroFigure size={72} alive />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.headline}>
          What should Hatua call you?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(180).duration(600)} style={styles.lead}>
          Just a first name. You can skip this.
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(260).duration(600)}>
          <GlassCard style={styles.card}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              maxLength={24}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={next}
              style={styles.input}
            />
          </GlassCard>
        </Animated.View>
        <PillButton
          label={text.trim() ? 'Continue' : 'Skip for now'}
          icon={<ArrowRightIcon size={18} color={colors.white} weight="bold" />}
          onPress={next}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  dot: { width: 20, height: 5, borderRadius: 3, backgroundColor: 'rgba(80,100,118,0.2)' },
  dotOn: { backgroundColor: colors.cobalt },
  avatar: { alignSelf: 'center', marginBottom: 12 },
  headline: { ...typography.title, color: colors.cobalt, textAlign: 'center' },
  lead: { ...typography.body, color: colors.navy, marginTop: 8, marginBottom: 20, textAlign: 'center' },
  card: { marginBottom: 16 },
  input: { ...typography.body, fontSize: 18, color: colors.navy, padding: 0 },
});
