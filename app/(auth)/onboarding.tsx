import { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', emoji: '🎙️',
    title: 'Record Yourself Speaking',
    body: 'Practice interview answers, pitches, or just free-talk. Telltale listens without judgment.',
    accent: colors.primary,
  },
  {
    id: '2', emoji: '🧠',
    title: 'AI Breaks Down Every Word',
    body: 'We analyze filler words, pacing, tone, and confidence — so you know exactly what to fix.',
    accent: '#FF6B9D',
  },
  {
    id: '3', emoji: '📈',
    title: 'Watch Yourself Improve',
    body: 'Every session builds your history. Track your score over time and become a stronger communicator.',
    accent: '#4ADE80',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/signup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(auth)/signup')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.emojiContainer, { backgroundColor: item.accent + '20' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].accent }]}
          onPress={handleNext} activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
        {currentIndex === SLIDES.length - 1 && (
          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Log in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { fontSize: typography.base, color: colors.textSecondary },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 20 },
  emojiContainer: { width: 110, height: 110, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emoji: { fontSize: 52 },
  slideTitle: { fontSize: typography['2xl'], fontWeight: typography.extrabold, color: colors.textPrimary, textAlign: 'center', lineHeight: 34 },
  slideBody: { fontSize: typography.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.primary },
  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  nextBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: typography.md, fontWeight: typography.bold },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: typography.sm, color: colors.textSecondary },
  loginHighlight: { color: colors.primary, fontWeight: typography.semibold },
});
