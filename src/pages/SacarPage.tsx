import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sacar, brlToCents, formatBRL, centsToBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface SacarPageProps {
  navigation?: any;
}

export const SacarPage: React.FC<SacarPageProps> = ({ navigation }) => {
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
    <View style={styles.container}>
      <LinearGradient colors={['#0D1F3C', '#162240']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sacar</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="cash-minus" size={36} color={Colors.sacarIcon} />
            </View>
            <Text style={styles.infoTitle}>Saque</Text>
            <Text style={styles.infoSubtitle}>
              Retire dinheiro da sua conta Delta Bank
            </Text>
            <View style={styles.balanceChip}>
              <Text style={styles.balanceChipLabel}>Saldo disponível</Text>
              <Text style={styles.balanceChipValue}>R$ {formatBRL(balance)}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor do saque</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textMuted}
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.quickAmountsRow}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountBtn}
                  onPress={() => setValor(String(amount))}
                >
                  <Text style={styles.quickAmountText}>R$ {amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sua senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor={Colors.textMuted}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={handleSacar} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="cash-minus" size={22} color={Colors.white} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: 60 },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadii.xl,
    padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoIconContainer: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.sacarBg, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  infoSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  balanceChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.08)', borderRadius: BorderRadii.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  balanceChipLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  balanceChipValue: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.accent },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadii.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700', color: Colors.accent },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.white },
  eyeBtn: { padding: Spacing.sm },
  quickAmountsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  quickAmountBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadii.md,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  quickAmountText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
  sendButton: {
    flexDirection: 'row', backgroundColor: Colors.sacarIcon, borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xxl, elevation: 4, shadowColor: Colors.sacarIcon,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  sendText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
});
