import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../services/storage';
import { loginWithFirebase, saveUserProfileToFirestore } from '../services/firestore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => sub?.remove();
  }, []);

  const isWide = screenWidth > 768;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithFirebase(email, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
        setLoading(false);
        return;
      }
      const userData = {
        id: result.user.uid,
        email: result.user.email,
        fullName: result.user.displayName || email.split('@')[0],
        loginAt: new Date().toISOString(),
        role: 'clinician',
      };
      await StorageService.saveCurrentUser(userData);
      await StorageService.saveTermsAcceptance(true);
      await saveUserProfileToFirestore(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      setLoading(false);
    }
  };

  const features = [
    { icon: 'shield-checkmark', text: 'Secure & HIPAA-aligned' },
    { icon: 'cloud-done', text: 'Real-time cloud sync' },
    { icon: 'stats-chart', text: 'Evidence-based CAT scoring' },
    { icon: 'people', text: 'Multi-clinician support' },
  ];

  const brandPanel = (
    <LinearGradient
      colors={['#0d2137', '#1a3a5c', '#2c5aa0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.brandPanel, isWide ? styles.brandPanelWide : styles.brandPanelNarrow]}
    >
      <View style={styles.logoCircle}>
        <Ionicons name="fitness" size={isWide ? 52 : 40} color="#ff9500" />
      </View>
      <Text style={styles.brandName}>MFB Balance App</Text>
      <Text style={styles.brandTagline}>
        Professional Balance{'\n'}Assessment Tool
      </Text>
      {isWide && (
        <>
          <View style={styles.brandDivider} />
          {features.map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={15} color="#ff9500" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
          <Text style={styles.brandFooter}>
            Mary Free Bed Rehabilitation Hospital{'\n'}Grand Rapids, Michigan
          </Text>
        </>
      )}
    </LinearGradient>
  );

  const formPanel = (
    <View style={[styles.formPanel, isWide && styles.formPanelWide]}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Sign in to your account to continue</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={17} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            placeholderTextColor="#bbb"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={17} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            disabled={loading}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={17}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.loginBtnText}>Signing in…</Text>
          </>
        ) : (
          <>
            <Text style={styles.loginBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.termsNote}>
        By signing in you agree to our{' '}
        <Text style={styles.termsLink} onPress={() => navigation.navigate('TermsAndConditions')}>
          Terms & Conditions
        </Text>
        {' '}and{' '}
        <Text style={styles.termsLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
          Privacy Policy
        </Text>
      </Text>

      <View style={styles.adminNote}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#999" />
        <Text style={styles.adminNoteText}>
          Account access is managed by your administrator
        </Text>
      </View>

      {!isWide && (
        <Text style={styles.mobileOrgText}>
          Mary Free Bed Rehabilitation Hospital
        </Text>
      )}
    </View>
  );

  if (isWide) {
    return (
      <View style={styles.wideRoot}>
        <View style={styles.wideCard}>
          {brandPanel}
          {formPanel}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.narrowRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.narrowScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {brandPanel}
        {formPanel}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ── Wide (desktop) ──────────────────────────────────────────
  wideRoot: {
    flex: 1,
    backgroundColor: '#dde3eb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  wideCard: {
    flexDirection: 'row',
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 860,
    minHeight: 540,
    ...Platform.select({
      web: { boxShadow: '0 24px 64px rgba(0,0,0,0.18)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24 },
      android: { elevation: 12 },
    }),
  },

  // ── Brand panel ──────────────────────────────────────────────
  brandPanel: {
    padding: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandPanelWide: {
    width: 300,
    minWidth: 280,
  },
  brandPanelNarrow: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 36,
    paddingHorizontal: 30,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 21,
    marginBottom: 4,
  },
  brandDivider: {
    width: 36,
    height: 2,
    backgroundColor: '#ff9500',
    borderRadius: 1,
    marginVertical: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,149,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  brandFooter: {
    marginTop: 28,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 17,
  },

  // ── Form panel ───────────────────────────────────────────────
  formPanel: {
    flex: 1,
    backgroundColor: 'white',
    padding: 28,
    justifyContent: 'center',
  },
  formPanelWide: {
    padding: 44,
  },
  formHeader: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 13,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: '#111827',
    outlineStyle: 'none',
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#ff9500',
    paddingVertical: 15,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(255,149,0,0.38)' },
      ios: { shadowColor: '#ff9500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  termsNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  termsLink: {
    color: '#ff9500',
    fontWeight: '600',
  },
  adminNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  adminNoteText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  mobileOrgText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#c0c4cc',
    marginTop: 24,
    fontStyle: 'italic',
  },

  // ── Narrow (mobile) ──────────────────────────────────────────
  narrowRoot: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  narrowScroll: {
    flexGrow: 1,
  },
});
