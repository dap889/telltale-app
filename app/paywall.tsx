import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { X, Crown, Check, RotateCcw } from 'lucide-react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePackage } from '@/lib/revenuecat';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

const PRO_FEATURES = [
  { icon: '🎙️', text: 'Unlimited practice sessions' },
  { icon: '📊', text: 'Deep analysis across all categories' },
  { icon: '📈', text: 'Full progress history & trends' },
  { icon: '💡', text: 'Personalized coaching tips' },
  { icon: '🔁', text: 'Session replays with annotations' },
  { icon: '🎯', text: 'Custom practice goals' },
];

const FALLBACK_PACKAGES = [
  { label: 'Annual', price: '$39.99', period: '/ year', perMonth: '$3.33 / mo', best: true },
  { label: 'Monthly', price: '$6.99', period: '/ month', perMonth: null, best: false },
];

export default function PaywallScreen() {
  const { handleRestore, checkSubscription } = useSubscription();
  const [offering, setOffering] = useState<any>(null);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    getOfferings().then((o) => {
      setOffering(o);
      if (o?.annual) setSelectedPkg(o.annual);
      else if (o?.monthly) setSelectedPkg(o.monthly);
      setIsLoading(false);
    });
  }, []);

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setIsPurchasing(true);
    const result = await purchasePackage(selectedPkg);
    setIsPurchasing(false);
    if (result.success) {
      await checkSubscription();
      Alert.alert('🎉 Welcome to Pro!', "You now have full access to Telltale Pro.", [{ text: 'Start Practicing', onPress: () => router.replace('/(tabs)') }]);
    } else if (result.error !== 'cancelled') {
      Alert.alert('Purchase Failed', result.error ?? 'Please try again.');
    }
  };

  const handleRestorePress = async () => {
    setIsRestoring(true);
    const info = await handleRestore();
    setIsRestoring(false);
    if (info && Object.keys(info.entitlements.active).length > 0) {
      Alert.alert('Restored!', 'Your Pro subscription has been restored.', [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]);
    } else {
      Alert.alert('Nothing to restore', 'No active subscription found for this account.');
    }
  };

  if (isLoading) return <SafeAreaView style={styles.container}><View style={styles.loadingState}><ActivityIndicator color={colors.primary} size="large" /></View></SafeAreaView>;

  const packages: PurchasesPackage[] = offering ? [offering.annual, offering.monthly].filter(Boolean) : [];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <X color={colors.textMuted} size={22} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Crown color="#FBBF24" size={44} />
          <Text style={styles.heroTitle}>Telltale Pro</Text>
          <Text style={styles.heroSubtitle}>Sound more confident, every single day.</Text>
        </View>

        <View style={styles.featureList}>
          {PRO_FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Check color={colors.success} size={16} />
            </View>
          ))}
        </View>

        <View style={styles.packagesRow}>
          {packages.length > 0 ? packages.map((pkg) => {
            const isSelected = selectedPkg?.identifier === pkg.identifier;
            const isAnnual = pkg.packageType === 'ANNUAL';
            return (
              <TouchableOpacity key={pkg.identifier} style={[styles.packageCard, isSelected && styles.packageCardSelected]} onPress={() => setSelectedPkg(pkg)} activeOpacity={0.8}>
                {isAnnual && <View style={styles.savingsBadge}><Text style={styles.savingsText}>BEST VALUE</Text></View>}
                <Text style={styles.packagePeriodLabel}>{isAnnual ? 'Annual' : 'Monthly'}</Text>
                <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                <Text style={styles.packagePeriod}>{isAnnual ? '/ year' : '/ month'}</Text>
                {isAnnual && <Text style={styles.packagePerMonth}>{(pkg.product.price / 12).toFixed(2)} / mo</Text>}
              </TouchableOpacity>
            );
          }) : FALLBACK_PACKAGES.map((p) => (
            <TouchableOpacity key={p.label} style={[styles.packageCard, p.best && styles.packageCardSelected]} activeOpacity={0.8}>
              {p.best && <View style={styles.savingsBadge}><Text style={styles.savingsText}>BEST VALUE</Text></View>}
              <Text style={styles.packagePeriodLabel}>{p.label}</Text>
              <Text style={styles.packagePrice}>{p.price}</Text>
              <Text style={styles.packagePeriod}>{p.period}</Text>
              {p.perMonth && <Text style={styles.packagePerMonth}>{p.perMonth}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.ctaBtn, isPurchasing && { opacity: 0.6 }]} onPress={handlePurchase} disabled={isPurchasing || !selectedPkg} activeOpacity={0.85}>
          {isPurchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>{selectedPkg ? 'Start Pro' : 'Select a Plan'}</Text>}
        </TouchableOpacity>

        <Text style={styles.legal}>Subscription renews automatically. Cancel anytime in your App Store or Play Store settings.</Text>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestorePress} disabled={isRestoring}>
          {isRestoring ? <ActivityIndicator color={colors.textMuted} size="small" /> : <><RotateCcw color={colors.textMuted} size={14} /><Text style={styles.restoreText}>Restore Purchases</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 32 },
  hero: { alignItems: 'center', marginBottom: 32, gap: 10 },
  heroTitle: { fontSize: typography['3xl'], fontWeight: typography.extrabold, color: colors.textPrimary, letterSpacing: -1 },
  heroSubtitle: { fontSize: typography.base, color: colors.textSecondary, textAlign: 'center' },
  featureList: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 14, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { flex: 1, fontSize: typography.base, color: colors.textPrimary },
  packagesRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  packageCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: colors.border, gap: 4 },
  packageCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  savingsBadge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  savingsText: { fontSize: 9, fontWeight: typography.bold, color: '#fff', letterSpacing: 0.5 },
  packagePeriodLabel: { fontSize: typography.xs, color: colors.textSecondary, fontWeight: typography.medium },
  packagePrice: { fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.textPrimary, marginTop: 4 },
  packagePeriod: { fontSize: typography.xs, color: colors.textSecondary },
  packagePerMonth: { fontSize: typography.xs, color: colors.primary, fontWeight: typography.semibold, marginTop: 2 },
  ctaBtn: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  ctaText: { color: '#fff', fontSize: typography.md, fontWeight: typography.bold },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16, marginBottom: 16 },
  restoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  restoreText: { fontSize: typography.sm, color: colors.textMuted },
});
