import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Briefcase, Presentation, MessageCircle, Pencil } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { PracticeMode } from '@/types';

interface ModeOption {
  mode: PracticeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tips: string[];
}

const MODES: ModeOption[] = [
  { mode: 'interview', label: 'Job Interview', description: 'Practice answering tough questions with clarity and confidence.', icon: <Briefcase size={26} color="#7C6FFF" />, color: '#7C6FFF', tips: ['Avoid filler words', 'Use the STAR method', 'Stay concise'] },
  { mode: 'presentation', label: 'Presentation', description: 'Sharpen your delivery for pitches, talks, and demos.', icon: <Presentation size={26} color="#FF6B9D" />, color: '#FF6B9D', tips: ['Control your pacing', 'Vary your tone', 'Pause for emphasis'] },
  { mode: 'casual', label: 'Casual Conversation', description: 'Work on everyday speaking habits and self-awareness.', icon: <MessageCircle size={26} color="#4ADE80" />, color: '#4ADE80', tips: ['Be direct', 'Reduce hedging', 'Sound present'] },
  { mode: 'custom', label: 'Open Practice', description: 'Free-form session — say whatever you want to work on.', icon: <Pencil size={26} color="#FBBF24" />, color: '#FBBF24', tips: ['No constraints', 'Freestyle speaking', 'Build any habit'] },
];

export default function PracticeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose a Mode</Text>
        <Text style={styles.subtitle}>Pick what you want to practice today</Text>
        {MODES.map((option) => (
          <TouchableOpacity
            key={option.mode} style={styles.card} activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/session/record', params: { mode: option.mode, label: option.label } })}
          >
            <View style={[styles.iconBox, { backgroundColor: option.color + '20' }]}>{option.icon}</View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{option.label}</Text>
              <Text style={styles.cardDesc}>{option.description}</Text>
              <View style={styles.tipsRow}>
                {option.tips.map((tip) => (
                  <View key={tip} style={styles.tipBadge}><Text style={styles.tipText}>{tip}</Text></View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: typography.base, color: colors.textSecondary, marginBottom: 28 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  tipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tipBadge: { backgroundColor: colors.surfaceElevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tipText: { fontSize: typography.xs, color: colors.textSecondary, fontWeight: typography.medium },
});
