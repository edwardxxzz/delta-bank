import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { makePix, centsToBRL, formatBRL, validatePixKey } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TransferirPageProps {
  navigation?: any;
  route?: any;
}

type KeyType = 'cpf' | 'email' | 'telefone' | 'aleatoria';
type Step = 'select' | 'form' | 'confirm';

export const TransferirPage: React.FC<TransferirPageProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userData, refreshUserData } = useAuth();

  const [step, setStep] = useState<Step>('select');
  const [keyType, setKeyType] = useState<KeyType>('cpf');
  const [chavePix, setChavePix] = useState<string>(route?.params?.chaveDestino || '');
  const [nomeDest, setNomeDest] = useState('');
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validatedDest, setValidatedDest] = useState<{ nome: string; cpf: string } | null>(null);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  const keyTypes: { key: KeyType; label: string; note?: string }[] = [
    { key: 'cpf', label: 'CPF' },
    { key: 'email', label: 'E-mail', note: 'apenas contas Delta Bank' },
    { key: 'telefone', label: 'Telefone', note: 'apenas contas Delta Bank' },
    { key: 'aleatoria', label: 'Chave aleatória', note: 'apenas contas Delta Bank' },
  ];

  const getPlaceholder = () => {
    switch (keyType) {
      case 'cpf': return 'Digite o CPF do destinatário';
      case 'email': return 'Digite o e-mail cadastrado';
      case 'telefone': return 'Digite o telefone cadastrado';
      case 'aleatoria': return 'Cole a chave aleatória';
    }
  };

  const formatCPFInput = (value: string) => {
    if (keyType !== 'cpf') return value;
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Valida a chave Pix e resolve o CPF do destinatário
  const validateAndResolveDestination = async (): Promise<string | null> => {
    const raw = chavePix.trim();

    if (!raw) {
      Alert.alert('Atenção', 'Digite a chave Pix do destinatário.');
      return null;
    }

    if (keyType === 'cpf') {
      const cleanCpf = raw.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        Alert.alert('Erro', 'CPF deve conter 11 dígitos.');
        return null;
      }
      if (cleanCpf === userData?.cpf) {
        Alert.alert('Erro', 'Você não pode enviar Pix para si mesmo.');
        return null;
      }

      setValidating(true);
      try {
        const res = await validatePixKey(cleanCpf);
        if (res.sucesso && res.dados?.Conta) {
          const { nome, cpf } = res.dados.Conta;
          setNomeDest(nome);
          setValidatedDest({ nome, cpf });
          return cpf;
        } else {
          Alert.alert(
            'Conta não encontrada',
            'Este CPF não possui conta no Delta Bank. Verifique o número digitado.'
          );
          return null;
        }
      } catch {
        Alert.alert('Erro', 'Falha ao validar chave. Verifique sua conexão e tente novamente.');
        return null;
      } finally {
        setValidating(false);
      }
    }

    // Para outros tipos de chave: o backend /api/pix aceita apenas cpf_destino.
    // A chave (email, telefone, aleatória) é usada para localizar o dono da conta no banco,
    // mas essa consulta não tem endpoint público exposto ainda.
    // Por enquanto passamos a chave como cpf_destino — o backend retornará erro caso
    // não seja um CPF válido, e o usuário verá a mensagem de erro normalmente.
    setValidatedDest(null);
    setNomeDest('');
    return raw;
  };

  const handleContinue = async () => {
    const destCpf = await validateAndResolveDestination();
    if (destCpf) {
      setStep('form');
    }
  };

  const handleContinueToConfirm = () => {
    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (!valorBRL || valorBRL <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }
    if (valorBRL < 1) {
      Alert.alert('Erro', 'O valor mínimo para Pix é R$ 1,00.');
      return;
    }
    if (valorBRL > balance) {
      Alert.alert('Saldo insuficiente', `Seu saldo disponível é R$ ${formatBRL(balance)}.`);
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPix = async () => {
    if (!senha) {
      Alert.alert('Erro', 'Digite sua senha para confirmar.');
      return;
    }
    if (!userData?.cpf) {
      Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      // FIX: backend espera "valor" em R$ float (ex: 50.00), não em centavos.
      // Antes estava passando brlToCents(valorBRL) = 5000 quando deveria ser 50.00
      const valorBRL = parseFloat(valor.replace(',', '.'));

      const cpfDestino =
        validatedDest?.cpf ??
        (keyType === 'cpf' ? chavePix.replace(/\D/g, '') : chavePix.trim());

      const res = await makePix(userData.cpf, cpfDestino, valorBRL, senha);

      if (res.sucesso) {
        await refreshUserData();
        // Navigate to success screen instead of Alert
        navigation?.replace('PixEnviado', {
          nomeDest: nomeDest || cpfDestino,
          chavePix,
          valor: parseFloat(valor.replace(',', '.')).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          }),
          tipoChave: keyType.toUpperCase(),
        });
      } else {
        Alert.alert('Erro no Pix', res.mensagem || 'Falha ao enviar Pix. Tente novamente.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    if (step === 'select') return 0.33;
    if (step === 'form') return 0.66;
    return 1;
  };

  const handleBack = () => {
    if (step === 'form') setStep('select');
    else if (step === 'confirm') setStep('form');
    else navigation?.goBack?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Enviar Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${getStepProgress() * 100}%`, backgroundColor: colors.accent },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Step 1: Chave ── */}
          {step === 'select' && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Tipo de chave
              </Text>

              <View style={styles.keyTypesRow}>
                {keyTypes.map((kt) => (
                  <TouchableOpacity
                    key={kt.key}
                    style={[
                      styles.keyTypeBtn,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      keyType === kt.key && {
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() => {
                      setKeyType(kt.key);
                      setValidatedDest(null);
                      setNomeDest('');
                      setChavePix('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.keyTypeText,
                        { color: colors.textSecondary },
                        keyType === kt.key && styles.keyTypeTextActive,
                      ]}
                    >
                      {kt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Nota para tipos não-CPF */}
              {keyType !== 'cpf' && (
                <View
                  style={[
                    styles.infoBanner,
                    { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={[styles.infoBannerText, { color: colors.accent }]}>
                    Para este tipo de chave, o destinatário deve ter conta no Delta Bank com essa
                    chave cadastrada.
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Chave Pix</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="key-variant"
                    size={18}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={colors.textMuted}
                    value={chavePix}
                    onChangeText={(v) => {
                      setChavePix(formatCPFInput(v));
                      setValidatedDest(null);
                    }}
                    autoCapitalize="none"
                    keyboardType={
                      keyType === 'cpf' || keyType === 'telefone' ? 'numeric' : 'default'
                    }
                  />
                </View>
              </View>

              {/* Destinatário validado */}
              {validatedDest && (
                <View
                  style={[
                    styles.validatedCard,
                    { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  <View style={styles.validatedInfo}>
                    <Text style={[styles.validatedName, { color: colors.accent }]}>
                      {validatedDest.nome}
                    </Text>
                    <Text style={[styles.validatedDetail, { color: colors.textSecondary }]}>
                      Conta verificada no Delta Bank
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.continueBtn,
                  { backgroundColor: colors.accent, shadowColor: colors.accent },
                  validating && styles.btnDisabled,
                ]}
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

          {/* ── Step 2: Valor ── */}
          {step === 'form' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Destinatário</Text>
                <View
                  style={[
                    styles.destCard,
                    { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' },
                  ]}
                >
                  <View style={[styles.destAvatar, { backgroundColor: colors.accent }]}>
                    <Text style={styles.destAvatarText}>
                      {(nomeDest || chavePix).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.destInfo}>
                    <Text style={[styles.destName, { color: colors.textPrimary }]}>
                      {nomeDest || 'Destinatário'}
                    </Text>
                    <Text style={[styles.destKey, { color: colors.textSecondary }]}>
                      {chavePix}
                    </Text>
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
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.currencyPrefix, { color: colors.accent }]}>R$</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="0,00"
                    placeholderTextColor={colors.textMuted}
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                <Text style={[styles.balanceHint, { color: colors.textMuted }]}>
                  Saldo disponível: R$ {formatBRL(balance)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueBtn,
                  { backgroundColor: colors.accent, shadowColor: colors.accent },
                ]}
                onPress={handleContinueToConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.continueText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: Confirmação ── */}
          {step === 'confirm' && (
            <>
              <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>
                Confirme os dados
              </Text>

              <View
                style={[
                  styles.confirmCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                ]}
              >
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Para</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>
                    {nomeDest || chavePix}
                  </Text>
                </View>

                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Chave</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>
                    {chavePix}
                  </Text>
                </View>

                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tipo</Text>
                  <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>
                    {keyType.toUpperCase()}
                  </Text>
                </View>

                <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Valor</Text>
                  <Text style={[styles.confirmValueHighlight, { color: colors.accent }]}>
                    R${' '}
                    {parseFloat(valor.replace(',', '.')).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                {validatedDest && (
                  <>
                    <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.confirmRow}>
                      <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                        Status
                      </Text>
                      <View style={styles.verifiedRow}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                        <Text style={[styles.verifiedText, { color: colors.accent }]}>
                          Destinatário validado
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Senha */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Sua senha</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Digite sua senha"
                    placeholderTextColor={colors.textMuted}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  { backgroundColor: colors.accent, shadowColor: colors.accent },
                  loading && styles.btnDisabled,
                ]}
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
  keyTypesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  keyTypeBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  keyTypeText: { fontSize: FontSizes.md, fontWeight: '500' },
  keyTypeTextActive: { color: '#FFFFFF', fontWeight: '600' },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadii.md, borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  infoBannerText: { flex: 1, fontSize: FontSizes.sm, lineHeight: 18 },
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
  validatedCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1, marginBottom: Spacing.lg,
  },
  validatedInfo: { flex: 1 },
  validatedName: { fontSize: FontSizes.lg, fontWeight: '700' },
  validatedDetail: { fontSize: FontSizes.sm },
  continueBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xl, elevation: 3,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  btnDisabled: { opacity: 0.6 },
  continueText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  destCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  destAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  destAvatarText: { color: '#FFFFFF', fontSize: FontSizes.lg, fontWeight: '700' },
  destInfo: { flex: 1 },
  destName: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 2 },
  destKey: { fontSize: FontSizes.sm },
  verifiedBadge: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: Spacing.xl },
  confirmCard: {
    borderRadius: BorderRadii.lg, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1,
  },
  confirmRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  confirmLabel: { fontSize: FontSizes.md },
  confirmValue: { fontSize: FontSizes.md, fontWeight: '600', flex: 1, textAlign: 'right' },
  confirmValueHighlight: { fontSize: FontSizes.lg, fontWeight: '700', flex: 1, textAlign: 'right' },
  confirmDivider: { height: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  verifiedText: { fontSize: FontSizes.md, fontWeight: '600' },
  confirmBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    elevation: 3, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
});