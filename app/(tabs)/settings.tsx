import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Crown, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

function SettingsRow({ icon, label, value, onPress, danger }: { icon: React.ReactNode; label: string; value?: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>{icon}<Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text></View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <ChevronRight color={danger ? colors.error : colors.textMuted} size={16} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { profile, signOut } = useAuthStore();
  const isPro = profile?.subscription_tier === 'pro';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{profile?.full_name ?? 'Your Account'}</Text>
            <View style={styles.tierBadge}>
              {isPro && <Crown color="#FBBF24" size={12} />}
              <Text style={[styles.tierText, isPro && { color: '#FBBF24' }]}>{isPro ? 'Pro' : 'Free Plan'}</Text>
            </View>
          </View>
        </View>

        {!isPro && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={() => router.push('/paywall')} activeOpacity={0.85}>
            <Crown color="#FBBF24" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeSubtitle}>Unlimited sessions, deeper insights</Text>
            </View>
            <ChevronRight color="#FBBF24" size={18} />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingsRow icon={<User color={colors.textSecondary} size={18} />} label="Edit Profile" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon={<Bell color={colors.textSecondary} size={18} />} label="Notifications" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsRow icon={<Shield color={colors.textSecondary} size={18} />} label="Privacy" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingsRow icon={<HelpCircle color={colors.textSecondary} size={18} />} label="Help & FAQ" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <SettingsRow icon={<LogOut color={colors.error} size={18} />} label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>

        <Text style={styles.version}>Telltale v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 20 },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginBottom: 20 },
  profileCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.primary },
  profileName: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: 4 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  upgradeBanner: { backgroundColor: '#FBBF2415', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: '#FBBF2440' },
  upgradeTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: '#FBBF24' },
  upgradeSubtitle: { fontSize: typography.xs, color: '#FBBF2490', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: typography.base, color: colors.textPrimary },
  rowLabelDanger: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: typography.sm, color: colors.textSecondary },
  version: { textAlign: 'center', fontSize: typography.xs, color: colors.textMuted, marginTop: 8 },
});
