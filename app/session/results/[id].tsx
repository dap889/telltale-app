import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react-native';
import { useSessionStore } from '@/store/sessionStore';
import { colors, scoreColor } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { SessionFeedback } from '@/types';

const CATEGORY_LABELS: Record<string, string> = { filler_words: 'Filler Words', pacing: 'Pacing', tone: 'Tone', confidence: 'Confidence', clarity: 'Clarity' };
const CATEGORY_ICONS: Record<string, string> = { filler_words: '🗣️', pacing: '⏱️', tone: '🎵', confidence: '💪', clarity: '💡' };

function getScoreMessage(score: number): string {
  if (score >= 80) return 'Excellent work — you sound confident and clear.';
  if (score >= 65) return 'Good session! A few tweaks will sharpen your delivery.';
  if (score >= 45) return "You're making progress. Focus on the suggestions below.";
  return 'Great start. Consistent practice will get you there.';
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
      <Text style={styles.scoreLabel}>/ 100</Text>
    </View>
  );
}

function FeedbackCard({ feedback }: { feedback: SessionFeedback }) {
  const label = CATEGORY_LABELS[feedback.category] ?? feedback.category;
  const icon = CATEGORY_ICONS[feedback.category] ?? '📊';
  const color = scoreColor(feedback.score);
  return (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.feedbackCategory}>{label}</Text>
          <Text style={styles.feedbackSummary}>{feedback.details.summary}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.scoreBadgeText, { color }]}>{feedback.score}</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${feedback.score}%` as any, backgroundColor: color }]} />
      </View>
      {feedback.details.examples && feedback.details.examples.length > 0 && (
        <View style={styles.examplesBox}>
          <Text style={styles.examplesLabel}>Detected</Text>
          <View style={styles.examplesList}>
            {feedback.details.examples.slice(0, 4).map((ex) => (
              <View key={ex} style={styles.exampleChip}><Text style={styles.exampleText}>"{ex}"</Text></View>
            ))}
          </View>
        </View>
      )}
      <View style={styles.suggestions}>
        {feedback.details.suggestions.map((s) => (
          <View key={s} style={styles.suggestionRow}>
            <CheckCircle color={colors.success} size={14} />
            <Text style={styles.suggestionText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentSession, fetchSessionById, isLoading } = useSessionStore();

  useEffect(() => {
    if (id && id !== 'error') fetchSessionById(id);
  }, [id]);

  if (id === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMsg}>Something went wrong. Your recording was saved — please try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.retryText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading results…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { feedback = [] } = currentSession;
  const modeLabel = currentSession.mode.charAt(0).toUpperCase() + currentSession.mode.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <ChevronLeft color={colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Results</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/practice')}>
          <RotateCcw color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMode}>{modeLabel} Session</Text>
            <Text style={styles.heroDuration}>{Math.floor(currentSession.duration_seconds / 60)}m {currentSession.duration_seconds % 60}s</Text>
          </View>
          {currentSession.overall_score !== null && <ScoreRing score={currentSession.overall_score} />}
          <Text style={styles.heroSubtext}>{getScoreMessage(currentSession.overall_score ?? 0)}</Text>
        </View>
        {feedback.map((fb) => <FeedbackCard key={fb.id} feedback={fb} />)}
        <TouchableOpacity style={styles.practiceAgainBtn} onPress={() => router.push('/(tabs)/practice')}>
          <Text style={styles.practiceAgainText}>Practice Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  heroCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  heroMeta: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  heroMode: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  heroDuration: { fontSize: typography.base, color: colors.textSecondary },
  scoreRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 5, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreNumber: { fontSize: typography['3xl'], fontWeight: typography.extrabold, lineHeight: 44 },
  scoreLabel: { fontSize: typography.xs, color: colors.textMuted },
  heroSubtext: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
  feedbackCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border, gap: 12 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  feedbackIcon: { fontSize: 22, marginTop: 2 },
  feedbackCategory: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: 2 },
  feedbackSummary: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: 19 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  scoreBadgeText: { fontSize: typography.md, fontWeight: typography.bold },
  progressTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  examplesBox: { gap: 6 },
  examplesLabel: { fontSize: typography.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: typography.semibold },
  examplesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exampleChip: { backgroundColor: colors.surfaceElevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  exampleText: { fontSize: typography.xs, color: colors.textSecondary, fontStyle: 'italic' },
  suggestions: { gap: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  suggestionText: { fontSize: typography.sm, color: colors.textSecondary, flex: 1, lineHeight: 19 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: typography.base, color: colors.textSecondary },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  errorMsg: { fontSize: typography.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  retryBtn: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  retryText: { color: '#fff', fontSize: typography.base, fontWeight: typography.semibold },
  practiceAgainBtn: { marginTop: 24, backgroundColor: colors.surfaceElevated, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  practiceAgainText: { color: colors.textPrimary, fontSize: typography.base, fontWeight: typography.semibold },
});
