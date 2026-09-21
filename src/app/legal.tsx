import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretLeftIcon } from 'phosphor-react-native';
import { Backdrop, RoundButton } from '../components/ui';
import { colors, typography } from '../theme';

type Doc = { title: string; updated: string; sections: { h: string; p: string }[] };

const DOCS: Record<'terms' | 'privacy', Doc> = {
  terms: {
    title: 'Terms of use',
    updated: 'Updated 21 September 2026',
    sections: [
      { h: 'Using Hatua', p: 'Hatua is for personal use by people aged 13 and over. Please use it honestly. It only works if you do.' },
      { h: 'What it is', p: 'Hatua is a game that reacts to your daily check-ins. It does not teach you how to reach your goal, and it is not medical, legal, financial or mental health advice. If your goal touches your health, talk to a qualified person.' },
      { h: 'The AI can be wrong', p: 'An AI reads your check-ins and can misjudge them. Its verdicts only change your hero, your XP and your bars inside the game. If you disagree, say it again with more detail.' },
      { h: 'Your words', p: 'You own what you write. When you send a check-in, you let Hatua and its AI provider read it so you get an answer.' },
      { h: 'Pro and purchases', p: 'Pro is offered through the app store and managed by RevenueCat. Prices, renewals and refunds follow the store rules. In this build, purchases run in a test mode. Progress, XP and levels can never be bought.' },
      { h: 'Open source', p: 'The code is open source under the MIT license at github.com/good-tech3y/hatua.' },
      { h: 'No warranty', p: 'Hatua is provided as it is and may change or stop at any time. As far as the law allows, its makers are not responsible for losses from using it.' },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    updated: 'Updated 21 September 2026',
    sections: [
      { h: 'The short version', p: 'Your goal, quests, check-ins and hero live on your phone. When you send a check-in, the words you type go to an AI service so it can read them. There are no accounts, no ads and no analytics.' },
      { h: 'On your phone', p: 'Your goal, quests, check-ins, XP, hero looks and any proof photos you add are saved on your phone only. Start over in Settings clears them, and so does uninstalling the app.' },
      { h: 'What leaves your phone', p: 'When you make quests or send a check-in, the text you typed goes to a small server run by the Hatua project. It passes the text to an AI provider and returns the answer. The Hatua server does not store it, and the provider handles it under its own terms. In demo mode nothing is sent. Photos are never sent. Please do not put passwords or private health details in a check-in.' },
      { h: 'Purchases', p: 'RevenueCat manages Pro. It receives an anonymous app user ID and purchase details, never your goals or check-ins. The app store handles your payment details.' },
      { h: 'Age', p: 'Hatua is not made for children under 13.' },
      { h: 'Questions', p: 'Open an issue at github.com/good-tech3y/hatua and we will answer there.' },
    ],
  },
};

export default function Legal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const d = DOCS[doc === 'privacy' ? 'privacy' : 'terms'];

  return (
    <>
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
          {d.title}
        </Animated.Text>
        <Text style={styles.date}>{d.updated}</Text>
        {d.sections.map((s) => (
          <Animated.View key={s.h} entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.h}>{s.h}</Text>
            <Text style={styles.p}>{s.p}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headline: { ...typography.display, color: colors.cobalt, marginTop: 20 },
  date: { ...typography.caption, color: colors.bodyMuted, marginTop: 6, marginBottom: 8 },
  h: { ...typography.heading, color: colors.navy, marginTop: 22 },
  p: { ...typography.body, color: colors.bodyMuted, marginTop: 6 },
});
