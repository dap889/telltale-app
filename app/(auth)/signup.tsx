import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (authError) { setLoading(false); setError(authError.message); return; }

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName.trim(), subscription_tier: 'free' });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start sounding like you mean it</Text>

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textMuted} value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Password (min 8 characters)" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginHighlight}>Log in</Text></Text>
        </TouchableOpacity>

        <Text style={styles.legal}>By signing up, you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48, backgroundColor: colors.bg },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: typography.base, color: colors.textSecondary, marginBottom: 36 },
  errorBox: { backgroundColor: '#2D1515', borderRadius: 10, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.error },
  errorText: { color: colors.error, fontSize: typography.sm },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, fontSize: typography.base, color: colors.textPrimary, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: typography.md, fontWeight: typography.semibold },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: colors.textSecondary, fontSize: typography.sm },
  loginHighlight: { color: colors.primary, fontWeight: typography.semibold },
  legal: { marginTop: 24, fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
