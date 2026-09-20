import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRightIcon,
  CameraIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  PersonSimpleWalkIcon,
} from 'phosphor-react-native';
import { HatuaMark, HeroFigure } from '../components/art';
import {
  Backdrop,
  Chip,
  GlassCard,
  PillButton,
  ProgressBar,
  RoundButton,
  Toolbar,
} from '../components/ui';
import { colors, typography } from '../theme';

export default function Today() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('checkin');

  return (
    <View style={styles.root}>
      <Backdrop variant="sky" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: 22,
        }}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <RoundButton>
            <HatuaMark size={26} />
          </RoundButton>
          <RoundButton>
            <DotsThreeIcon size={26} color={colors.navy} weight="bold" />
          </RoundButton>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(80).duration(600)} style={styles.headline}>
          One small step today.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(160).duration(600)} style={styles.lead}>
          Do the next thing, then tell Hatua what really changed.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(240).duration(600)} style={styles.chips}>
          <Chip label="Quest 2 of 6" active />
          <Chip label="Steps" />
          <Chip label="Proof" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(600)}>
          <GlassCard>
            <View style={styles.heroRow}>
              <View style={styles.avatar}>
                <HeroFigure size={50} />
              </View>
              <View>
                <Text style={styles.name}>Your hero</Text>
                <Text style={styles.sub}>Level 1</Text>
              </View>
            </View>
            <ProgressBar value={0.4} />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <GlassCard>
            <Text style={styles.kicker}>Today’s quest</Text>
            <Text style={styles.questTitle}>Do one focused session</Text>
            <Text style={styles.body}>When you are done, check in and tell it straight.</Text>
            <PillButton
              label="Check in"
              icon={<ArrowRightIcon size={18} color={colors.white} weight="bold" />}
            />
          </GlassCard>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(500).springify().damping(16)}
        style={[styles.dock, { bottom: insets.bottom + 18 }]}
      >
        <Toolbar
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'checkin',
              icon: (c) => <PencilSimpleIcon size={22} color={c} weight="bold" />,
            },
            {
              key: 'steps',
              icon: (c) => <PersonSimpleWalkIcon size={22} color={c} weight="bold" />,
            },
            {
              key: 'proof',
              icon: (c) => <CameraIcon size={22} color={c} weight="bold" />,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  headline: { ...typography.display, color: colors.cobalt, marginTop: 30 },
  lead: { ...typography.body, color: colors.navy, marginTop: 10, maxWidth: 330 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22, marginBottom: 22 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.periwinkle,
  },
  name: { ...typography.heading, color: colors.navy },
  sub: { ...typography.caption, color: colors.bodyMuted },
  kicker: { ...typography.label, color: colors.cobalt },
  questTitle: { ...typography.title, color: colors.navy, marginTop: 6 },
  body: { ...typography.body, color: colors.bodyMuted, marginTop: 8, marginBottom: 20 },
  dock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
