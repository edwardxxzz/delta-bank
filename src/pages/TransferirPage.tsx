import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { makePix, brlToCents, centsToBRL, formatBRL, validatePixKey } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface TransferirPageProps {
  navigation?: any;
  route?: any;
}

type KeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
type Step = 'select' | 'form' | 'confirm';

export const TransferirPage: React.FC<TransferirPageProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
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
  const [validating, setValidating] = useState(false);
  const [validatedDest, setValidatedDest] = useState<{ nome: string; cpf: string } | null>(null);

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

  // Validate the Pix key against Delta Bank database
  const validateKey = async (): Promise<string | null> => {
    if (!chavePix.trim()) {
      Alert.alert('Erro', 'Digite a chave Pix');
      return null;
    }

    // For CPF type, validate directly
    if (keyType === 'cpf') {
      const cleanCpf = chavePix.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        Alert.alert('Erro', 'CPF deve conter 11 dígitos');
        return null;
      }
      if (cleanCpf === userData?.cpf) {
        Alert.alert('Erro', 'Você não pode enviar Pix para si mesmo');
        return null;
      }

      setValidating(true);
      try {
        const res = await validatePixKey(cleanCpf);
        if (res.sucesso && res.dados?.Conta) {
          const destName = res.dados.Conta.nome;
          const destCpf = res.dados.Conta.cpf;
          setNomeDest(destName);
          setValidatedDest({ nome: destName, cpf: destCpf });
          return destCpf;
        } else {
          Alert.alert('Chave não encontrada', 'Este CPF não possui conta no Delta Bank.');
          return null;
        }
      } catch {
        Alert.alert('Erro', 'Erro ao validar chave. Tente novamente.');
        return null;
      } finally {
        setValidating(false);
      }
    }

    // For other key types, we can't validate via CPF lookup yet
    // but we still proceed with the key value
    setValidatedDest(null);
    return chavePix.trim();
  };

  const handleContinue = async () => {
    const destinoCpf = await validateKey();
    if (destinoCpf) {
      setStep('form');
    }
  };

  const handleContinueToConfirm = () => {
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (!valorBRL || valorBRL <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (valorBRL > balance) {
      Alert.alert('Saldo insuficiente', 'Você não tem saldo suficiente para esta transferência.');
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
      // For CPF key type, use the validated destination CPF
      // For other types, use the key value as-is (backend needs CPF)
      const cpfDestino = validatedDest?.cpf || (keyType === 'cpf' ? chavePix.replace(/\D/g, '') : chavePix);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {step !== 'select' ? (
          <TouchableOpacity style={styles.backButton} onPress={() => {
            if (step === 'form') setStep('select');
            else if (step === 'confirm') setStep('form');
          }}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Enviar Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${getStepProgress() * 100}%`, backgroundColor: colors.accent }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Step 1: Select key type + validate */}
          {step === 'select' && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Selecione o tipo de chave</Text>
              <View style={styles.keyTypesRow}>
                {keyTypes.map((kt) => (
                  <TouchableOpacity
                    key={kt.key}
                    style={[
                      styles.keyTypeBtn,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      keyType === kt.key && { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                    onPress={() => { setKeyType(kt.key); setValidatedDest(null); setNomeDest(''); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.keyTypeText, { color: colors.textSecondary }, keyType === kt.key && styles.keyTypeTextActive]}>
                      {kt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Chave Pix</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="key-variant" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={colors.textMuted}
                    value={chavePix}
                    onChangeText={(v) => { setChavePix(v); setValidatedDest(null); }}
                    autoCapitalize="none"
                    keyboardType={keyType === 'cpf' || keyType === 'cnpj' || keyType === 'telefone' ? 'numeric' : 'default'}
                  />
                </View>
              </View>

              {/* Validated destination info */}
              {validatedDest && (
                <View style={[styles.validatedCard, { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' }]}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  <View style={styles.validatedInfo}>
                    <Text style={[styles.validatedName, { color: colors.accent }]}>{validatedDest.nome}</Text>
                    <Text style={[styles.validatedDetail, { color: colors.textSecondary }]}>Conta verificada no Delta Bank</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.continueBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }, validating && styles.continueBtnDisabled]}
                onPress={handleContinue}
                disabled={validating}
                activeOpacity={0.8}
              >
                {validating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.continueText}>Validar e continuar</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Value and message */}
          {step === 'form' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Destinatário</Text>
                <View style={[styles.destCard, { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' }]}>
                  <View style={[styles.destAvatar, { backgroundColor: colors.accent }]}>
                    <Text style={styles.destAvatarText}>{(nomeDest || chavePix).charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.destInfo}>
                    <Text style={[styles.destName, { color: colors.textPrimary }]}>{nomeDest || 'Destinatário'}</Text>
                    <Text style={[styles.destKey, { color: colors.textSecondary }]}>{chavePix}</Text>
                  </View>
                  {validatedDest && (
                    <View style={[styles.verifiedBadge, { backgroundColor: colors.accent }]}>
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Valor</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.currencyPrefix, { color: colors.accent }]}>R$</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="0,00"
                    placeholderTextColor={colors.textMuted}
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={[styles.balanceHint, { color: colors.textMuted }]}>Saldo disponível: R$ {formatBRL(balance)}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Mensagem (opcional)</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Adicione uma mensagem"
                    placeholderTextColor={colors.textMuted}
                    value={mensagem}
                    onChangeText={setMensagem}
                  />
                </View>
              </View>

              <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]} onPress={handleContinueToConfirm} activeOpacity={0.8}>
                <Text style={styles.continueText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <>
              <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>Confirme os dados</Text>

              <View style={[styles.confirmCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Para</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{nomeDest || chavePix}</Text>
                </View>
                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Chave</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{chavePix}</Text>
                </View>
                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tipo</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{keyType.toUpperCase()}</Text>
                </View>
                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Valor</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>
                    R$ {parseFloat(valor.replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {mensagem ? (
                  <>
                    <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.confirmRow}>
                      <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Mensagem</Text>
                      <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{mensagem}</Text>
                    </View>
                  </>
                ) : null}
                {validatedDest && (
                  <>
                    <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.confirmRow}>
                      <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Verificação</Text>
                      <View style={styles.verifiedRow}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                        <Text style={[styles.verifiedText, { color: colors.accent }]}>Destinatário validado</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Sua senha</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Digite sua senha"
                    placeholderTextColor={colors.textMuted}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }, loading && styles.confirmBtnDisabled]}
                onPress={handleConfirmPix}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={22} color={colors.white} />
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  progressBar: {
    height: 3, marginHorizontal: Spacing.xxl,
    borderRadius: 2, marginBottom: Spacing.lg, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: Spacing.lg },
  keyTypesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  keyTypeBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  keyTypeTextActive: { color: '#FFFFFF', fontWeight: '600' },
  keyTypeText: { fontSize: FontSizes.md, fontWeight: '500' },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, fontSize: FontSizes.lg },
  eyeBtn: { padding: Spacing.sm },
  balanceHint: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  // Validated card
  validatedCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, marginBottom: Spacing.lg,
  },
  validatedInfo: { flex: 1 },
  validatedName: { fontSize: FontSizes.lg, fontWeight: '700' },
  validatedDetail: { fontSize: FontSizes.sm },
  // Continue button
  continueBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xl, elevation: 3,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  // Destination card (step 2)
  destCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  destAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  destAvatarText: { color: '#FFFFFF', fontSize: FontSizes.lg, fontWeight: '700' },
  destInfo: { flex: 1 },
  destName: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 2 },
  destKey: { fontSize: FontSizes.sm },
  verifiedBadge: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  // Confirm step
  confirmTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: Spacing.xl },
  confirmCard: {
    borderRadius: BorderRadii.lg,
    padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  confirmLabel: { fontSize: FontSizes.md },
  confirmValue: { fontSize: FontSizes.md, fontWeight: '600', flex: 1, textAlign: 'right' },
  confirmDivider: { height: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  verifiedText: { fontSize: FontSizes.md, fontWeight: '600' },
  confirmBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
});
