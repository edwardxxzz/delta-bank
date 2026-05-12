import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
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
    <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.appName}>Delta Bank</Text>
          <Text style={styles.appSubtitle}>
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={Colors.textMuted}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🪪</Text>
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor={Colors.textMuted}
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={Colors.textMuted}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'Entrar' : 'Criar conta'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleLink}>
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -2,
  },
  appName: {
    fontSize: FontSizes.huge,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  form: { gap: Spacing.lg },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  inputIcon: { marginRight: Spacing.md, fontSize: 18 },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  eyeButton: { padding: Spacing.sm },
  eyeIcon: { fontSize: 18 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadii.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  toggleText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  toggleLink: {
    fontSize: FontSizes.md,
    color: Colors.accent,
    fontWeight: '600',
  },
});
