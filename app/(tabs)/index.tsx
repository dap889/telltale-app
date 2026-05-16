import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Mic, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { colors, scoreColor } from '@/constants/colors';
import { typography } from '@/constants/typography';

export default function HomeScreen() {
  const { profile, user } = useAuthStore();
  const { sessions, fetchSessions } = useSessionStore();

  useEffect(() => {
    if (user?.id) fetchSessions(user.id);
  }, [user?.id]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const recentSessions = sessions.slice(0, 3);
  const scoredSessions = sessions.filter((s) => s.overall_score !== null);
  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((acc, s) => acc + (s.overall_score ?? 0), 0) / scoredSessions.length)
    : null;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Ready to level up?</Text>
          </View>
        </View>

        {sessions.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, avgScore !== null && { color: scoreColor(avgScore) }]}>
                {avgScore ?? '--'}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalMinutes}m</Text>
              <Text style={styles.statLabel}>Practiced</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(tabs)/practice')} activeOpacity={0.85}>
          <Mic color="#fff" size={22} />
          <Text style={styles.ctaText}>Start Practice Session</Text>
        </TouchableOpacity>

        {recentSessions.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.sectionLink}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentSessions.map((session) => (
              <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => router.push(`/session/results/${session.id}`)}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionMode}>{session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}</Text>
                  <Text style={styles.sessionDate}>{new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                </View>
                <View style={styles.sessionRight}>
                  {session.overall_score !== null && (
                    <Text style={[styles.sessionScore, { color: scoreColor(session.overall_score) }]}>{session.overall_score}</Text>
                  )}
                  <ChevronRight color={colors.textMuted} size={18} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <TrendingUp color={colors.textMuted} size={40} />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyText}>Record your first practice session to start getting feedback.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginBottom: 28 },
  greeting: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary },
  subGreeting: { fontSize: typography.base, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  statLabel: { fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 },
  ctaButton: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  ctaText: { color: '#fff', fontSize: typography.md, fontWeight: typography.semibold },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary },
  sectionLink: { fontSize: typography.sm, color: colors.primary },
  sessionCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  sessionInfo: { flex: 1 },
  sessionMode: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  sessionDate: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionScore: { fontSize: typography.lg, fontWeight: typography.bold },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary },
  emptyText: { fontSize: typography.sm, color: colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
