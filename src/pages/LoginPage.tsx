import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Validate CPF check digits
const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // All same digit

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
};

export const LoginPage: React.FC = () => {
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const getRawCPF = (formatted: string) => formatted.replace(/\D/g, '');

  const handleSubmit = async () => {
    setError('');
    const rawCPF = getRawCPF(cpf);

    // Validate fields
    if (!rawCPF) {
      setError('Preencha o campo CPF.');
      return;
    }
    if (rawCPF.length !== 11) {
      setError('CPF deve conter 11 dígitos.');
      return;
    }
    if (!validateCPF(rawCPF)) {
      setError('CPF inválido. Verifique os dígitos.');
      return;
    }
    if (!senha) {
      setError('Preencha o campo senha.');
      return;
    }
    if (senha.length < 6) {
      setError('Senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (!isLogin && !nome.trim()) {
      setError('Preencha seu nome completo.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(rawCPF, senha);
      } else {
        await register(nome.trim(), rawCPF, senha);
      }
    } catch (error: any) {
      const msg = error.message || 'Erro na autenticação';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <View style={[styles.logoTriangle, { borderBottomColor: colors.accent }]} />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Delta Bank</Text>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
              {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.bloquearBtnBg, borderColor: colors.negative }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.negative} />
              <Text style={[styles.errorText, { color: colors.negative }]}>{error}</Text>
              <TouchableOpacity onPress={() => setError('')} hitSlop={8}>
                <Ionicons name="close" size={16} color={colors.negative} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBgColor, borderColor: colors.inputBorder }]}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBgColor, borderColor: colors.inputBorder }]}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="CPF"
                placeholderTextColor={colors.textMuted}
                value={cpf}
                onChangeText={(text) => { setCpf(formatCPF(text)); setError(''); }}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.inputBgColor, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Senha"
                placeholderTextColor={colors.textMuted}
                value={senha}
                onChangeText={(text) => { setSenha(text); setError(''); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Test account hint */}
            {isLogin && (
              <TouchableOpacity
                style={[styles.testAccountHint, { backgroundColor: colors.pixBg, borderColor: colors.border }]}
                onPress={() => {
                  setCpf('987.654.321-00');
                  setSenha('delta123');
                  setError('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
                <Text style={[styles.testAccountText, { color: colors.accent }]}>Usar conta de teste</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Entrar' : 'Criar conta'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            </Text>
            <TouchableOpacity onPress={switchMode}>
              <Text style={[styles.toggleLink, { color: colors.accent }]}>
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scrollContent: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
  },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 18, borderLeftColor: 'transparent',
    borderRightWidth: 18, borderRightColor: 'transparent',
    borderBottomWidth: 30,
    marginTop: 6,
  },
  appName: { fontSize: FontSizes.huge, fontWeight: '700', marginBottom: Spacing.xs },
  appSubtitle: { fontSize: FontSizes.lg },
  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    marginBottom: Spacing.lg, borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: FontSizes.md, fontWeight: '500' },
  // Form
  form: { gap: Spacing.lg },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg },
  eyeButton: { padding: Spacing.sm },
  testAccountHint: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  testAccountText: { fontSize: FontSizes.sm, fontWeight: '500' },
  primaryButton: {
    borderRadius: BorderRadii.lg, height: 54,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  toggleText: { fontSize: FontSizes.md },
  toggleLink: { fontSize: FontSizes.md, fontWeight: '600' },
});
