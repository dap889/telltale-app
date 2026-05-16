import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { colors, scoreColor } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Session } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 180;
const PAD = { top: 16, bottom: 32, left: 28, right: 16 };

function LineChart({ data }: { data: { score: number; label: string }[] }) {
  if (data.length < 2) return null;
  const scores = data.map((d) => d.score);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const range = maxScore - minScore || 1;
  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const toY = (score: number) => PAD.top + plotH - ((score - minScore) / range) * plotH;
  const gridLines = [0, 25, 50, 75, 100].filter((v) => v >= minScore - 5 && v <= maxScore + 5);

  return (
    <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
      {gridLines.map((v) => (
        <View key={v} style={[chartStyles.gridLine, { top: toY(v), left: PAD.left, width: plotW }]}>
          <Text style={chartStyles.gridLabel}>{v}</Text>
        </View>
      ))}
      {data.map((d, i) => {
        if (i === 0) return null;
        const x1 = toX(i - 1), y1 = toY(data[i - 1].score), x2 = toX(i), y2 = toY(d.score);
        const dx = x2 - x1, dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return <View key={i} style={[chartStyles.segment, { width: length, left: x1, top: y1, transform: [{ rotate: `${angle}deg` }] }]} />;
      })}
      {data.map((d, i) => (
        <View key={`dot-${i}`} style={[chartStyles.dot, { left: toX(i) - 5, top: toY(d.score) - 5, backgroundColor: scoreColor(d.score) }]} />
      ))}
      {data.map((d, i) => {
        if (data.length > 6 && i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
        return <Text key={`label-${i}`} style={[chartStyles.xLabel, { left: toX(i) - 16, top: CHART_HEIGHT - PAD.bottom + 6 }]}>{d.label}</Text>;
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  gridLine: { position: 'absolute', height: 1, backgroundColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  gridLabel: { position: 'absolute', left: -24, fontSize: 10, color: colors.textMuted, width: 22, textAlign: 'right' },
  segment: { position: 'absolute', height: 2.5, backgroundColor: colors.primary, transformOrigin: 'left center', borderRadius: 2 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.bg },
  xLabel: { position: 'absolute', fontSize: 10, color: colors.textMuted, width: 32, textAlign: 'center' },
});

function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const practiceDays = new Set(sessions.map((s) => { const d = new Date(s.created_at); d.setHours(0, 0, 0, 0); return d.getTime(); }));
  let streak = 0, cursor = today.getTime();
  while (practiceDays.has(cursor)) { streak++; cursor -= 86400000; }
  return streak;
}

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const { sessions, fetchSessions } = useSessionStore();

  useEffect(() => { if (user?.id) fetchSessions(user.id); }, [user?.id]);

  const scoredSessions = useMemo(() => sessions.filter((s) => s.overall_score !== null), [sessions]);
  const chartData = useMemo(() => [...scoredSessions].reverse().slice(-10).map((s) => ({ score: s.overall_score!, label: new Date(s.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) })), [scoredSessions]);
  const avgScore = scoredSessions.length > 0 ? Math.round(scoredSessions.reduce((a, s) => a + s.overall_score!, 0) / scoredSessions.length) : null;
  const bestScore = scoredSessions.length > 0 ? Math.max(...scoredSessions.map((s) => s.overall_score!)) : null;
  const improvement = useMemo(() => {
    if (scoredSessions.length < 4) return null;
    const recent = [...scoredSessions].slice(0, 3), early = [...scoredSessions].slice(-3);
    return Math.round(recent.reduce((a, s) => a + s.overall_score!, 0) / recent.length - early.reduce((a, s) => a + s.overall_score!, 0) / early.length);
  }, [scoredSessions]);
  const streak = calculateStreak(sessions);

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📈</Text>
          <Text style={styles.emptyTitle}>No progress yet</Text>
          <Text style={styles.emptyText}>Complete a few sessions and your progress chart will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.statsRow}>
          {[
            { value: avgScore !== null ? String(avgScore) : '--', label: 'Avg Score', color: avgScore !== null ? scoreColor(avgScore) : colors.textPrimary },
            { value: bestScore !== null ? String(bestScore) : '--', label: 'Best Score', color: bestScore !== null ? scoreColor(bestScore) : colors.textPrimary },
            { value: String(streak), label: 'Streak 🔥', color: colors.textPrimary },
            { value: String(sessions.length), label: 'Sessions', color: colors.textPrimary },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {improvement !== null && (
          <View style={[styles.improvementBanner, { backgroundColor: improvement >= 0 ? colors.success + '18' : colors.warning + '18', borderColor: improvement >= 0 ? colors.success : colors.warning }]}>
            <Text style={styles.improvementEmoji}>{improvement >= 0 ? '📈' : '📉'}</Text>
            <Text style={[styles.improvementText, { color: improvement >= 0 ? colors.success : colors.warning }]}>
              {improvement >= 0 ? '+' : ''}{improvement} pts vs. your first sessions
            </Text>
          </View>
        )}

        {chartData.length >= 2 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Score Over Time</Text>
            <Text style={styles.chartSubtitle}>Last {chartData.length} sessions</Text>
            <View style={{ marginTop: 12 }}><LineChart data={chartData} /></View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sessions by Mode</Text>
          {(['interview', 'presentation', 'casual', 'custom'] as const).map((mode) => {
            const count = sessions.filter((s) => s.mode === mode).length;
            if (count === 0) return null;
            const modeScored = scoredSessions.filter((s) => s.mode === mode);
            const modeAvg = modeScored.length > 0 ? Math.round(modeScored.reduce((a, s) => a + s.overall_score!, 0) / modeScored.length) : 0;
            const modeLabels: Record<string, string> = { interview: 'Job Interview', presentation: 'Presentation', casual: 'Casual', custom: 'Open Practice' };
            const modeIcons: Record<string, string> = { interview: '💼', presentation: '🎤', casual: '💬', custom: '✏️' };
            return (
              <View key={mode} style={styles.modeRow}>
                <Text style={styles.modeIcon}>{modeIcons[mode]}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.modeHeader}>
                    <Text style={styles.modeLabel}>{modeLabels[mode]}</Text>
                    <Text style={styles.modeCount}>{count} sessions</Text>
                  </View>
                  {modeAvg > 0 && <Text style={[styles.modeAvg, { color: scoreColor(modeAvg) }]}>avg {modeAvg}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.timeEmoji}>⏱️</Text>
          <View>
            <Text style={styles.timeValue}>{Math.floor(sessions.reduce((a, s) => a + s.duration_seconds, 0) / 60)} min</Text>
            <Text style={styles.timeLabel}>Total practice time</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 20 },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: typography.xl, fontWeight: typography.bold },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  improvementBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 16 },
  improvementEmoji: { fontSize: 20 },
  improvementText: { fontSize: typography.base, fontWeight: typography.semibold },
  chartCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  chartTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary },
  chartSubtitle: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border, gap: 14 },
  cardTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeIcon: { fontSize: 22 },
  modeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modeLabel: { fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.medium },
  modeCount: { fontSize: typography.xs, color: colors.textMuted },
  modeAvg: { fontSize: typography.xs, fontWeight: typography.semibold, marginTop: 2 },
  timeCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.border },
  timeEmoji: { fontSize: 28 },
  timeValue: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  timeLabel: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  emptyText: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
