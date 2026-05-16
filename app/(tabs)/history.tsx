import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Mic, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { colors, scoreColor } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Session } from '@/types';

const MODE_LABELS: Record<string, string> = { interview: 'Job Interview', presentation: 'Presentation', casual: 'Casual', custom: 'Open Practice' };
const MODE_COLORS: Record<string, string> = { interview: '#7C6FFF', presentation: '#FF6B9D', casual: '#4ADE80', custom: '#FBBF24' };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function groupByMonth(sessions: Session[]): Record<string, Session[]> {
  return sessions.reduce((acc, session) => {
    const key = new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {} as Record<string, Session[]>);
}

function SessionRow({ session }: { session: Session }) {
  const modeColor = MODE_COLORS[session.mode] ?? colors.primary;
  return (
    <TouchableOpacity style={styles.sessionRow} onPress={() => router.push(`/session/results/${session.id}`)} activeOpacity={0.75}>
      <View style={[styles.modeDot, { backgroundColor: modeColor + '25' }]}><Mic color={modeColor} size={18} /></View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionMode}>{MODE_LABELS[session.mode] ?? session.mode}</Text>
        <View style={styles.sessionMeta}>
          <Clock color={colors.textMuted} size={12} />
          <Text style={styles.sessionMetaText}>{formatDuration(session.duration_seconds)}</Text>
          <Text style={styles.sessionMetaDot}>·</Text>
          <Text style={styles.sessionMetaText}>{formatDate(session.created_at)}</Text>
        </View>
      </View>
      <View style={styles.sessionRight}>
        {session.overall_score !== null
          ? <Text style={[styles.sessionScore, { color: scoreColor(session.overall_score) }]}>{session.overall_score}</Text>
          : <Text style={styles.sessionScorePending}>--</Text>}
        <ChevronRight color={colors.textMuted} size={16} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { sessions, fetchSessions, isLoading } = useSessionStore();

  useEffect(() => { if (user?.id) fetchSessions(user.id); }, [user?.id]);

  const grouped = groupByMonth(sessions);
  const months = Object.keys(grouped);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.sessionCount}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingState}><ActivityIndicator color={colors.primary} /></View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Mic color={colors.textMuted} size={44} />
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptyText}>Complete a practice session to see it here.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/practice')}>
            <Text style={styles.emptyBtnText}>Start Practicing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {months.map((month) => (
            <View key={month} style={styles.monthGroup}>
              <Text style={styles.monthLabel}>{month}</Text>
              {grouped[month].map((session) => <SessionRow key={session.id} session={session} />)}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  sessionCount: { fontSize: typography.sm, color: colors.textSecondary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  monthGroup: { marginBottom: 28 },
  monthLabel: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  modeDot: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionInfo: { flex: 1 },
  sessionMode: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary, marginBottom: 4 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionMetaText: { fontSize: typography.xs, color: colors.textMuted },
  sessionMetaDot: { fontSize: typography.xs, color: colors.textMuted },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sessionScore: { fontSize: typography.lg, fontWeight: typography.bold },
  sessionScorePending: { fontSize: typography.base, color: colors.textMuted },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  emptyText: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText: { color: '#fff', fontSize: typography.base, fontWeight: typography.semibold },
});
