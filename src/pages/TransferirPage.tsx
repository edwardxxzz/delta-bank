import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { makePix, brlToCents, centsToBRL, formatBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface TransferirPageProps {
  navigation?: any;
  route?: any;
}

type KeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
type Step = 'select' | 'form' | 'confirm';

export const TransferirPage: React.FC<TransferirPageProps> = ({ navigation, route }) => {
  const { userData, refreshUserData } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [keyType, setKeyType] = useState<KeyType>('cpf');
  const [chavePix, setChavePix] = useState(route?.params?.chaveDestino || '');
  const [nomeDest, setNomeDest] = useState('');
  const [valor, setValor] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  const keyTypes: { key: KeyType; label: string }[] = [
    { key: 'cpf', label: 'CPF' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'aleatoria', label: 'Chave aleatória' },
  ];

  const getPlaceholder = () => {
    switch (keyType) {
      case 'cpf': return 'Digite a chave CPF';
      case 'cnpj': return 'Digite o CNPJ';
      case 'email': return 'Digite o e-mail';
      case 'telefone': return 'Digite o telefone';
      case 'aleatoria': return 'Digite a chave aleatória';
    }
  };

  const handleContinue = () => {
    if (!chavePix) {
      Alert.alert('Erro', 'Digite a chave Pix');
      return;
    }
    setStep('form');
  };

  const handleContinueToConfirm = () => {
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (!valorBRL || valorBRL <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPix = async () => {
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
      const valorBRL = parseFloat(valor.replace(',', '.'));
      const valorCentavos = brlToCents(valorBRL);
      // For CPF key type, use the key as destination CPF
      const cpfDestino = keyType === 'cpf' ? chavePix.replace(/\D/g, '') : chavePix;
      const res = await makePix(userData.cpf, cpfDestino, valorCentavos, senha);
      if (res.sucesso) {
        Alert.alert('Sucesso', `Pix de R$ ${valorBRL.toFixed(2)} enviado com sucesso!`, [
          { text: 'OK', onPress: () => navigation?.goBack?.() },
        ]);
        await refreshUserData();
      } else {
        Alert.alert('Erro', res.mensagem || 'Falha ao enviar Pix');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    if (step === 'select') return 0.33;
    if (step === 'form') return 0.66;
    return 1;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step !== 'select' ? (
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (step === 'form') setStep('select');
            else if (step === 'confirm') setStep('form');
          }}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Enviar Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${getStepProgress() * 100}%` }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Step 1: Select key type */}
          {step === 'select' && (
            <>
              <Text style={styles.sectionTitle}>Selecione o tipo de chave</Text>
              <View style={styles.keyTypesRow}>
                {keyTypes.map((kt) => (
                  <TouchableOpacity
                    key={kt.key}
                    style={[styles.keyTypeBtn, keyType === kt.key && styles.keyTypeBtnActive]}
                    onPress={() => setKeyType(kt.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.keyTypeText, keyType === kt.key && styles.keyTypeTextActive]}>
                      {kt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Chave Pix</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="key-variant" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={Colors.textMuted}
                    value={chavePix}
                    onChangeText={setChavePix}
                    autoCapitalize="none"
                    keyboardType={keyType === 'cpf' || keyType === 'cnpj' || keyType === 'telefone' ? 'numeric' : 'default'}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do destinatário (opcional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    placeholderTextColor={Colors.textMuted}
                    value={nomeDest}
                    onChangeText={setNomeDest}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
                <Text style={styles.continueText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Value and message */}
          {step === 'form' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destinatário</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome do destinatário"
                    placeholderTextColor={Colors.textMuted}
                    value={nomeDest}
                    onChangeText={setNomeDest}
                  />
                </View>
                <Text style={styles.inputHelper}>{chavePix}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor</Text>
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mensagem (opcional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Adicione uma mensagem"
                    placeholderTextColor={Colors.textMuted}
                    value={mensagem}
                    onChangeText={setMensagem}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.continueBtn} onPress={handleContinueToConfirm} activeOpacity={0.8}>
                <Text style={styles.continueText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <>
              <Text style={styles.confirmTitle}>Confirme os dados</Text>

              <View style={styles.confirmCard}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Para</Text>
                  <Text style={styles.confirmValue}>{nomeDest || chavePix}</Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Chave</Text>
                  <Text style={styles.confirmValue}>{chavePix}</Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Valor</Text>
                  <Text style={styles.confirmValue}>
                    R$ {parseFloat(valor.replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {mensagem ? (
                  <>
                    <View style={styles.confirmDivider} />
                    <View style={styles.confirmRow}>
                      <Text style={styles.confirmLabel}>Mensagem</Text>
                      <Text style={styles.confirmValue}>{mensagem}</Text>
                    </View>
                  </>
                ) : null}
              </View>

              {/* Password */}
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

              <TouchableOpacity
                style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                onPress={handleConfirmPix}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={22} color={Colors.white} />
                    <Text style={styles.confirmBtnText}>Confirmar Pix</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  progressBar: {
    height: 3, backgroundColor: Colors.border, marginHorizontal: Spacing.xxl,
    borderRadius: 2, marginBottom: Spacing.lg, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.lg },
  keyTypesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  keyTypeBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadii.lg, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  keyTypeBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  keyTypeText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
  keyTypeTextActive: { color: Colors.white, fontWeight: '600' },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  inputHelper: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700', color: Colors.accent },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.textPrimary },
  eyeBtn: { padding: Spacing.sm },
  continueBtn: {
    flexDirection: 'row', backgroundColor: Colors.accent, borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xl, elevation: 3, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  continueText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
  // Confirm step
  confirmTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
  confirmCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  confirmLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  confirmValue: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  confirmDivider: { height: 1, backgroundColor: Colors.border },
  confirmBtn: {
    flexDirection: 'row', backgroundColor: Colors.accent, borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    elevation: 3, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
});
