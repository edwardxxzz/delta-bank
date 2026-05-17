import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { depositar, formatBRL, centsToBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface DepositarPageProps {
  navigation?: any;
}

export const DepositarPage: React.FC<DepositarPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, refreshUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const [valor, setValor] = useState('');
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

  const handleDepositar = async () => {
    setShowError(false);
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorBRL) || valorBRL <= 0) {
      showErrorMsg('Informe um valor válido para depósito.');
      return;
    }
    if (valorBRL < 0.01) {
      showErrorMsg('O valor mínimo para depósito é R$ 0,01.');
      return;
    }
    if (valorBRL > 10000) {
      showErrorMsg('O valor máximo para depósito é R$ 10.000,00 por transação.');
      return;
    }
    if (!userData?.cpf) {
      showErrorMsg('Sessão inválida. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      // API expects valor in R$ float (e.g. 50.00), NOT centavos
      const res = await depositar(userData.cpf, valorBRL);
      if (res.sucesso) {
        await refreshUserData();
        setSuccessVisible(true);
        setValor('');
        // Navigate back after showing success briefly
        setTimeout(() => {
          setSuccessVisible(false);
          navigation?.goBack?.();
        }, 1500);
      } else {
        const msg = (res.mensagem || '').toLowerCase();
        if (msg.includes('inválido') || msg.includes('invalid')) {
          showErrorMsg('Valor inválido para depósito. Verifique o valor informado.');
        } else {
          showErrorMsg(res.mensagem || 'Falha ao realizar depósito. Tente novamente.');
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Depositar</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: colors.depositarBg }]}>
              <MaterialCommunityIcons name="cash-plus" size={36} color={colors.depositarIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Depósito</Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Adicione dinheiro à sua conta Delta Bank
            </Text>
            <View style={[styles.balanceChip, { backgroundColor: colors.pixBg }]}>
              <Text style={[styles.balanceChipLabel, { color: colors.textSecondary }]}>Saldo atual</Text>
              <Text style={[styles.balanceChipValue, { color: colors.accent }]}>R$ {formatBRL(balance)}</Text>
            </View>
          </View>

          {/* Success Banner */}
          {successVisible && (
            <View style={[styles.successBanner, { backgroundColor: colors.pixBg, borderColor: colors.accent + '40' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.successText, { color: colors.accent }]}>Depósito realizado com sucesso!</Text>
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
              <Text style={[styles.label, { color: colors.textPrimary }]}>Valor do depósito</Text>
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
                Mínimo R$ 0,01 • Máximo R$ 10.000,00
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
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.depositarIcon }]}
            onPress={handleDepositar}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="cash-plus" size={22} color={colors.white} />
                <Text style={styles.sendText}>Confirmar depósito</Text>
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
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, fontSize: FontSizes.lg },
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
