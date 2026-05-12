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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0D1F3C', '#0A1628']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inner}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="alpha-d-circle" size={52} color={Colors.accent} />
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
                <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
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
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  gradient: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.huge },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
    borderWidth: 2, borderColor: Colors.accent,
    elevation: 8, shadowColor: '#00E676', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16,
  },
  appName: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs, letterSpacing: 0.5 },
  appSubtitle: { fontSize: FontSizes.lg, color: Colors.textSecondary },
  form: { gap: Spacing.lg },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.white },
  eyeButton: { padding: Spacing.sm },
  primaryButton: {
    backgroundColor: Colors.accent, borderRadius: BorderRadii.lg, height: 54,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
    elevation: 4, shadowColor: '#00E676', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryButtonText: { color: Colors.primary, fontSize: FontSizes.xxl, fontWeight: '700' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  toggleText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  toggleLink: { fontSize: FontSizes.md, color: Colors.accent, fontWeight: '600' },
});
