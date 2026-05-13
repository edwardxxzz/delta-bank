import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const LoginPage: React.FC = () => {
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const rawCPF = getRawCPF(cpf);
    if (!rawCPF || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (!isLogin && !nome) {
      Alert.alert('Erro', 'Informe seu nome completo');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(rawCPF, senha);
      } else {
        await register(nome, rawCPF, senha);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
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

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
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

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="CPF"
              placeholderTextColor={colors.textMuted}
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
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
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={[styles.toggleLink, { color: colors.accent }]}>
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
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
  form: { gap: Spacing.lg },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg },
  eyeButton: { padding: Spacing.sm },
  primaryButton: {
    borderRadius: BorderRadii.lg, height: 54,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  toggleText: { fontSize: FontSizes.md },
  toggleLink: { fontSize: FontSizes.md, fontWeight: '600' },
});
