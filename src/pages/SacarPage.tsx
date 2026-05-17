import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { sacar, formatBRL, centsToBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SacarPageProps {
  navigation?: any;
}

export const SacarPage: React.FC<SacarPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, refreshUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  const showErrorMsg = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const handleSacar = async () => {
    setShowError(false);
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorBRL) || valorBRL <= 0) {
      showErrorMsg('Informe um valor válido para saque.');
      return;
    }
    if (valorBRL < 0.01) {
      showErrorMsg('O valor mínimo para saque é R$ 0,01.');
      return;
    }
    if (valorBRL > 2000) {
      showErrorMsg('O valor máximo por saque é R$ 2.000,00.');
      return;
    }
    // Backend requires saque to be multiple of 10
    if (valorBRL % 10 !== 0) {
      showErrorMsg('O valor do saque deve ser múltiplo de R$ 10,00.');
      return;
    }
    if (valorBRL > balance) {
      showErrorMsg('Saldo insuficiente para realizar este saque.');
      return;
    }
    if (!senha) {
      showErrorMsg('Digite sua senha para confirmar o saque.');
      return;
    }
    if (!userData?.cpf) {
      showErrorMsg('Sessão inválida. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      // API expects valor in R$ float (e.g. 50.00), NOT centavos
      const res = await sacar(userData.cpf, valorBRL, senha);
      if (res.sucesso) {
        await refreshUserData();
        setSuccessVisible(true);
        setValor('');
        setSenha('');
        setTimeout(() => {
          setSuccessVisible(false);
          navigation?.goBack?.();
        }, 1500);
      } else {
        const msg = (res.mensagem || '').toLowerCase();
        if (msg.includes('senha') || msg.includes('password') || msg.includes('incorreta') || msg.includes('invalida')) {
          showErrorMsg('Senha incorreta. Verifique e tente novamente.');
        } else if (msg.includes('saldo') || msg.includes('insuficiente')) {
          showErrorMsg('Saldo insuficiente para realizar este saque.');
        } else if (msg.includes('limite') || msg.includes('diário') || msg.includes('diario')) {
          showErrorMsg('Limite diário de saque atingido. Tente novamente amanhã.');
        } else if (msg.includes('múltiplo') || msg.includes('multiplo')) {
          showErrorMsg('O valor do saque deve ser múltiplo de R$ 10,00.');
        } else {
          showErrorMsg(res.mensagem || 'Falha ao realizar saque. Tente novamente.');
        }
      }
    } catch (error: any) {
      showErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sacar</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.sacarBg }]}>
              <MaterialCommunityIcons name="cash-minus" size={36} color={colors.sacarIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Saque</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Retire dinheiro da sua conta Delta Bank
            </Text>
            <View style={[styles.balanceChip, { backgroundColor: colors.pixBg }]}>
              <Text style={[styles.balanceChipLabel, { color: colors.textSecondary }]}>Saldo disponível</Text>
              <Text style={[styles.balanceChipValue, { color: colors.accent }]}>R$ {formatBRL(balance)}</Text>
            </View>
          </View>

          {/* Success Banner */}
          {successVisible && (
            <View style={[styles.successBanner, { backgroundColor: colors.pixBg, borderColor: colors.accent + '40' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.successText, { color: colors.accent }]}>Saque realizado com sucesso!</Text>
            </View>
          )}

          {/* Error Banner */}
          {showError && errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Ionicons name="alert-circle" size={20} color={colors.errorBorder} />
              <Text style={[styles.errorText, { color: colors.errorBorder }]}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setShowError(false)} style={styles.errorCloseBtn}>
                <Ionicons name="close" size={18} color={colors.errorBorder} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Valor do saque</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.accent }]}>R$</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  value={valor}
                  onChangeText={(v) => { setValor(v); setShowError(false); }}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                Múltiplo de R$ 10,00 • Máximo R$ 2.000,00
              </Text>
            </View>

            <View style={styles.quickAmountsRow}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  onPress={() => { setValor(String(amount)); setShowError(false); }}
                >
                  <Text style={[styles.quickAmountText, { color: colors.textSecondary }]}>R$ {amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Sua senha</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.textMuted}
                  value={senha}
                  onChangeText={(v) => { setSenha(v); setShowError(false); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.sacarIcon }]}
            onPress={handleSacar}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="cash-minus" size={22} color={colors.white} />
                <Text style={styles.sendText}>Confirmar saque</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: 60 },
  infoCard: {
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  infoIconContainer: {
    width: 68, height: 68, borderRadius: 34,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: Spacing.xs, marginTop: Spacing.sm },
  infoSubtitle: { fontSize: FontSizes.md, textAlign: 'center', lineHeight: 20 },
  balanceChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadii.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.lg,
  },
  balanceChipLabel: { fontSize: FontSizes.sm },
  balanceChipValue: { fontSize: FontSizes.md, fontWeight: '700' },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, marginBottom: Spacing.lg,
  },
  successText: { flex: 1, fontSize: FontSizes.md, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  errorText: { flex: 1, fontSize: FontSizes.md, fontWeight: '500', lineHeight: 20 },
  errorCloseBtn: { padding: Spacing.xs },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: FontSizes.md, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, fontSize: FontSizes.lg },
  eyeBtn: { padding: Spacing.sm },
  hint: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  quickAmountsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  quickAmountBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadii.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  quickAmountText: { fontSize: FontSizes.md, fontWeight: '500' },
  sendButton: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xxl, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  sendText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
});
