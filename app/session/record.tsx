import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Square, ChevronLeft, Mic } from 'lucide-react-native';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAuthStore } from '@/store/authStore';
import { hasReachedFreeLimit } from '@/lib/freeTierGuard';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { PracticeMode } from '@/types';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getTips(mode: PracticeMode): string[] {
  switch (mode) {
    case 'interview': return ['Answer as if in a real interview', 'Use complete sentences', 'Aim for 60–90 seconds per answer'];
    case 'presentation': return ['Speak to an imaginary audience', 'Use natural pauses', 'Vary your tone and energy'];
    case 'casual': return ['Speak naturally — no pressure', 'Talk about your day or an idea', 'Even 30 seconds gives useful data'];
    default: return ['Speak freely on any topic', 'Be yourself', 'Longer sessions give better feedback'];
  }
}

export default function RecordScreen() {
  const { mode, label } = useLocalSearchParams<{ mode: PracticeMode; label: string }>();
  const { status, durationMs, startRecording, stopRecording, error } = useAudioRecorder();
  const { user, profile } = useAuthStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (status === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  const handleStart = async () => {
    // Check free tier limit
    if (profile?.subscription_tier === 'free' && user?.id) {
      const limited = await hasReachedFreeLimit(user.id);
      if (limited) { router.push('/paywall'); return; }
    }
    setHasStarted(true);
    await startRecording();
  };

  const handleStop = async () => {
    if (durationMs < 5000) {
      Alert.alert('Too Short', 'Please record at least 5 seconds for a useful analysis.', [{ text: 'OK' }]);
      return;
    }
    try {
      const localUri = await stopRecording();
      if (!localUri) throw new Error('No recording file found.');
      router.replace({ pathname: '/session/processing', params: { localUri, mode: mode ?? 'casual', durationSeconds: Math.floor(durationMs / 1000).toString() } });
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleBack = () => {
    if (status === 'recording') {
      Alert.alert('Stop Recording?', 'Going back will discard your current session.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: async () => { await stopRecording(); router.back(); } },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color={colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{label ?? 'Practice'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.timer}>{formatDuration(durationMs)}</Text>
        <Text style={styles.timerLabel}>{status === 'recording' ? 'Recording…' : 'Tap to start'}</Text>

        <View style={styles.micContainer}>
          {status === 'recording' && (
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          )}
          <TouchableOpacity
            style={[styles.micButton, status === 'recording' && styles.micButtonActive]}
            onPress={status === 'recording' ? handleStop : handleStart} activeOpacity={0.85}
          >
            {status === 'recording' ? <Square color="#fff" size={32} fill="#fff" /> : <Mic color="#fff" size={36} />}
          </TouchableOpacity>
        </View>

        {!hasStarted && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Before you start</Text>
            {getTips(mode ?? 'casual').map((tip) => <Text key={tip} style={styles.tipItem}>· {tip}</Text>)}
          </View>
        )}

        {status === 'recording' && <Text style={styles.hint}>Tap the square to stop and analyze</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  timer: { fontSize: 64, fontWeight: typography.extrabold, color: colors.textPrimary, letterSpacing: -2 },
  timerLabel: { fontSize: typography.base, color: colors.textSecondary, marginTop: -8, marginBottom: 24 },
  micContainer: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pulseRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary + '30' },
  micButton: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  micButtonActive: { backgroundColor: colors.error, shadowColor: colors.error },
  tipBox: { backgroundColor: colors.surface, borderRadius: 14, padding: 18, width: '100%', borderWidth: 1, borderColor: colors.border, gap: 6 },
  tipTitle: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  tipItem: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: 20 },
  hint: { fontSize: typography.sm, color: colors.textMuted, marginTop: 8 },
  errorText: { color: colors.error, fontSize: typography.sm, textAlign: 'center' },
});
