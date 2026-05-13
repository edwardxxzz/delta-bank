import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { sacar, brlToCents, formatBRL, centsToBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface SacarPageProps {
  navigation?: any;
}

export const SacarPage: React.FC<SacarPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, refreshUserData } = useAuth();
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  const handleSacar = async () => {
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorBRL) || valorBRL <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!senha) {
      Alert.alert('Erro', 'Digite sua senha');
      return;
    }
    if (!userData?.cpf) {
      Alert.alert('Erro', 'Sessão inválida');
      return;
    }
    setLoading(true);
    try {
      const valorCentavos = brlToCents(valorBRL);
      const res = await sacar(userData.cpf, valorCentavos, senha);
      if (res.sucesso) {
        Alert.alert('Sucesso', `Saque de R$ ${valorBRL.toFixed(2)} realizado!`);
        setValor('');
        setSenha('');
        await refreshUserData();
        navigation?.goBack?.();
      } else {
        Alert.alert('Erro', res.mensagem || 'Falha ao sacar');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
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
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>Retire dinheiro da sua conta Delta Bank</Text>
            <View style={[styles.balanceChip, { backgroundColor: colors.pixBg }]}>
              <Text style={[styles.balanceChipLabel, { color: colors.textSecondary }]}>Saldo disponível</Text>
              <Text style={[styles.balanceChipValue, { color: colors.accent }]}>R$ {formatBRL(balance)}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Valor do saque</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.accent }]}>R$</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]} placeholder="0,00" placeholderTextColor={colors.textMuted}
                  value={valor} onChangeText={setValor} keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.quickAmountsRow}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity key={amount} style={[styles.quickAmountBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={() => setValor(String(amount))}>
                  <Text style={[styles.quickAmountText, { color: colors.textSecondary }]}>R$ {amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Sua senha</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]} placeholder="Digite sua senha" placeholderTextColor={colors.textMuted}
                  value={senha} onChangeText={setSenha} secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.sacarIcon }]} onPress={handleSacar} disabled={loading} activeOpacity={0.8}>
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
    marginTop: Spacing.xxl,
  },
  sendText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
});
