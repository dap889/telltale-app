import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { PracticeMode } from '@/types';

const STEPS = [
  'Uploading your recording…',
  'Transcribing speech…',
  'Analyzing tone & pacing…',
  'Detecting filler words…',
  'Generating your report…',
];

export default function ProcessingScreen() {
  const { localUri, mode, durationSeconds } = useLocalSearchParams<{ localUri: string; mode: PracticeMode; durationSeconds: string }>();
  const { uploadAudio, createSession, analyzeSession } = useSession();
  const stepIndex = useRef(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const hasRun = useRef(false);

  useEffect(() => {
    Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: true })).start();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    runPipeline();
  }, []);

  const advanceStep = (index: number) => { stepIndex.current = index; };

  const runPipeline = async () => {
    try {
      advanceStep(0);
      const audioUrl = await uploadAudio(localUri);
      advanceStep(1);
      const sessionId = await createSession(mode ?? 'casual', parseInt(durationSeconds ?? '0', 10), audioUrl);
      advanceStep(3);
      await analyzeSession(sessionId, audioUrl);
      advanceStep(4);
      setTimeout(() => router.replace(`/session/results/${sessionId}`), 600);
    } catch (err) {
      console.error('Pipeline error:', err);
      router.replace({ pathname: '/session/results/error', params: { message: 'Something went wrong analyzing your session.' } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
        <Text style={styles.title}>Analyzing your session</Text>
        <Text style={styles.subtitle}>This usually takes 15–30 seconds</Text>
        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepDot, stepIndex.current >= i && styles.stepDotActive, stepIndex.current > i && styles.stepDotDone]} />
              <Text style={[styles.stepText, stepIndex.current === i && styles.stepTextActive, stepIndex.current > i && styles.stepTextDone]}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  spinner: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: colors.primary + '40', borderTopColor: colors.primary, marginBottom: 8 },
  title: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: 24 },
  steps: { width: '100%', gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepText: { fontSize: typography.base, color: colors.textMuted },
  stepTextActive: { color: colors.textPrimary, fontWeight: typography.medium },
  stepTextDone: { color: colors.textSecondary },
});
