import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    setLoading(false);
    if (authError) setError(authError.message);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your practice</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted}
          value={email} onChangeText={setEmail} keyboardType="email-address"
          autoCapitalize="none" autoCorrect={false}
        />
        <TextInput
          style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted}
          value={password} onChangeText={setPassword} secureTextEntry
        />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/(auth)/signup')}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 40 },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: typography.base, color: colors.textSecondary, marginBottom: 36 },
  errorBox: { backgroundColor: '#2D1515', borderRadius: 10, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.error },
  errorText: { color: colors.error, fontSize: typography.sm },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, fontSize: typography.base, color: colors.textPrimary, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: typography.md, fontWeight: typography.semibold },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: typography.sm },
  linkHighlight: { color: colors.primary, fontWeight: typography.semibold },
});
