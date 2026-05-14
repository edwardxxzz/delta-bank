import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getChavesPix, registerChavePix, ChavePix } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ChavesPixPageProps {
  navigation?: any;
}

type KeyTypeOption = 'CPF' | 'EMAIL' | 'TELEFONE' | 'CNPJ' | 'ALEATORIA';

const keyTypeLabels: { key: KeyTypeOption; label: string; placeholder: string; icon: string }[] = [
  { key: 'CPF', label: 'CPF', placeholder: '000.000.000-00', icon: 'card-account-details-outline' },
  { key: 'EMAIL', label: 'E-mail', placeholder: 'seu@email.com', icon: 'email-outline' },
  { key: 'TELEFONE', label: 'Telefone', placeholder: '(11) 99999-9999', icon: 'phone-outline' },
  { key: 'CNPJ', label: 'CNPJ', placeholder: '00.000.000/0001-00', icon: 'domain' },
  { key: 'ALEATORIA', label: 'Aleatória', placeholder: 'Gerada automaticamente', icon: 'dice-multiple-outline' },
];

const keyTypeColors: Record<string, string> = {
  CPF: '#10B981',
  EMAIL: '#6366F1',
  TELEFONE: '#F97316',
  CNPJ: '#3B82F6',
  ALEATORIA: '#8B5CF6',
};

export const ChavesPixPage: React.FC<ChavesPixPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedType, setSelectedType] = useState<KeyTypeOption>('EMAIL');
  const [keyValue, setKeyValue] = useState('');
  const [registering, setRegistering] = useState(false);

  const loadChaves = useCallback(async () => {
    if (!userData?.cpf) return;
    try {
      const res = await getChavesPix(userData.cpf);
      if (res.sucesso && res.dados) {
        setChaves(res.dados);
      } else {
        setChaves([]);
      }
    } catch (e) {
      setChaves([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.cpf]);

  useEffect(() => {
    loadChaves();
  }, [loadChaves]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChaves();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    if (!userData?.cpf) {
      Alert.alert('Erro', 'Sessão inválida');
      return;
    }

    let valor = keyValue.trim();
    if (selectedType === 'ALEATORIA') {
      // Generate random key
      valor = `delta-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`;
    }

    if (!valor && selectedType !== 'ALEATORIA') {
      Alert.alert('Erro', 'Preencha o valor da chave');
      return;
    }

    // For CPF type, use the user's own CPF
    if (selectedType === 'CPF') {
      valor = userData.cpf;
    }

    setRegistering(true);
    try {
      const res = await registerChavePix(userData.cpf, selectedType, valor);
      if (res.sucesso) {
        Alert.alert('Sucesso', 'Chave Pix registrada com sucesso!');
        setKeyValue('');
        setShowRegister(false);
        await loadChaves();
      } else {
        Alert.alert('Erro', res.mensagem || 'Falha ao registrar chave');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão');
    } finally {
      setRegistering(false);
    }
  };

  const getFormattedKey = (chave: ChavePix) => {
    if (chave.tipo === 'CPF') {
      return chave.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (chave.tipo === 'TELEFONE') {
      return chave.valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return chave.valor;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch {
      return '---';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Minhas Chaves Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' }]}>
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.accent} />
          <Text style={[styles.infoBannerText, { color: colors.accent }]}>
            Suas chaves Pix permitem que outras pessoas lhe enviem dinheiro facilmente.
          </Text>
        </View>

        {/* Registered Keys */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CHAVES CADASTRADAS</Text>

        {chaves.length > 0 ? (
          <View style={[styles.keysCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
            {chaves.map((chave, idx) => {
              const color = keyTypeColors[chave.tipo] || colors.accent;
              return (
                <View key={chave.id || idx}>
                  <View style={styles.keyItem}>
                    <View style={[styles.keyIcon, { backgroundColor: color + '20' }]}>
                      <MaterialCommunityIcons
                        name={(keyTypeLabels.find(k => k.key === chave.tipo)?.icon || 'key-variant') as any}
                        size={22}
                        color={color}
                      />
                    </View>
                    <View style={styles.keyInfo}>
                      <Text style={[styles.keyType, { color: color }]}>{chave.tipo}</Text>
                      <Text style={[styles.keyValue, { color: colors.textPrimary }]}>{getFormattedKey(chave)}</Text>
                      <Text style={[styles.keyDate, { color: colors.textMuted }]}>Criada em {formatDate(chave.criada_em)}</Text>
                    </View>
                    <TouchableOpacity style={styles.copyBtn} onPress={() => Alert.alert('Chave copiada!', getFormattedKey(chave))} hitSlop={8}>
                      <Feather name="copy" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  {idx < chaves.length - 1 && <View style={[styles.keyDivider, { backgroundColor: colors.menuDivider }]} />}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="key-remove" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhuma chave cadastrada</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Cadastre sua primeira chave Pix para começar a receber transferências.
            </Text>
          </View>
        )}

        {/* Register Button / Form */}
        {!showRegister ? (
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: colors.accent }]}
            onPress={() => setShowRegister(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.white} />
            <Text style={styles.registerBtnText}>Cadastrar nova chave</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.registerForm, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Nova chave Pix</Text>
              <TouchableOpacity onPress={() => { setShowRegister(false); setKeyValue(''); }} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Key Type Selector */}
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Tipo de chave</Text>
            <View style={styles.typeRow}>
              {keyTypeLabels.map((kt) => (
                <TouchableOpacity
                  key={kt.key}
                  style={[
                    styles.typeBtn,
                    { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                    selectedType === kt.key && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                  onPress={() => setSelectedType(kt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeBtnText, { color: colors.textSecondary }, selectedType === kt.key && styles.typeBtnTextActive]}>
                    {kt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Value Input */}
            {selectedType !== 'CPF' && selectedType !== 'ALEATORIA' && (
              <View style={{ marginTop: Spacing.lg }}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  {selectedType === 'EMAIL' ? 'E-mail' : selectedType === 'TELEFONE' ? 'Telefone' : selectedType === 'CNPJ' ? 'CNPJ' : 'Valor'}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="key-variant" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={keyTypeLabels.find(k => k.key === selectedType)?.placeholder || 'Digite a chave'}
                    placeholderTextColor={colors.textMuted}
                    value={keyValue}
                    onChangeText={setKeyValue}
                    autoCapitalize={selectedType === 'EMAIL' ? 'none' : 'sentences'}
                    keyboardType={selectedType === 'TELEFONE' || selectedType === 'CNPJ' ? 'numeric' : 'default'}
                  />
                </View>
              </View>
            )}

            {selectedType === 'CPF' && (
              <View style={[styles.cpfInfoCard, { backgroundColor: colors.pixBg }]}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.accent} />
                <Text style={[styles.cpfInfoText, { color: colors.accent }]}>
                  Seu CPF será usado como chave Pix
                </Text>
              </View>
            )}

            {selectedType === 'ALEATORIA' && (
              <View style={[styles.cpfInfoCard, { backgroundColor: colors.transferirBg }]}>
                <MaterialCommunityIcons name="dice-multiple-outline" size={20} color={colors.transferirIcon} />
                <Text style={[styles.cpfInfoText, { color: colors.transferirIcon }]}>
                  Uma chave aleatória será gerada automaticamente
                </Text>
              </View>
            )}

            {/* Check if key already exists */}
            {chaves.some(c => c.tipo === selectedType) && selectedType === 'CPF' && (
              <View style={[styles.warnCard, { backgroundColor: colors.sacarBg }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.sacarIcon} />
                <Text style={[styles.warnText, { color: colors.sacarIcon }]}>
                  Você já possui uma chave do tipo CPF cadastrada.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.accent }, registering && styles.confirmBtnDisabled]}
              onPress={handleRegister}
              disabled={registering}
              activeOpacity={0.8}
            >
              {registering ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.white} />
                  <Text style={styles.confirmBtnText}>Cadastrar chave</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.version, { color: colors.textMuted }]}>Delta Bank v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  scrollContent: { paddingBottom: Spacing.xxxl },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl,
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  infoBannerText: { flex: 1, fontSize: FontSizes.md, lineHeight: 20 },
  sectionLabel: {
    fontSize: FontSizes.sm, fontWeight: '700',
    letterSpacing: 0.5, textTransform: 'uppercase',
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md,
  },
  keysCard: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1,
  },
  keyItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg,
  },
  keyIcon: {
    width: 44, height: 44, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  keyInfo: { flex: 1 },
  keyType: { fontSize: FontSizes.sm, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  keyValue: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 2 },
  keyDate: { fontSize: FontSizes.xs },
  copyBtn: { padding: Spacing.sm },
  keyDivider: { height: 1, marginLeft: Spacing.xxxl + 44 + Spacing.lg },
  emptyCard: {
    marginHorizontal: Spacing.xxl,
    alignItems: 'center', paddingVertical: Spacing.huge,
    borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  emptyTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.xl },
  registerBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  registerForm: {
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    borderRadius: BorderRadii.lg, padding: Spacing.xl, borderWidth: 1,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  formLabel: { fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  typeBtnText: { fontSize: FontSizes.md, fontWeight: '500' },
  typeBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54, marginTop: Spacing.sm,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg },
  cpfInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.lg, borderRadius: BorderRadii.md, marginTop: Spacing.lg,
  },
  cpfInfoText: { fontSize: FontSizes.md, fontWeight: '500' },
  warnCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadii.md, marginTop: Spacing.lg,
  },
  warnText: { fontSize: FontSizes.sm, fontWeight: '500' },
  confirmBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xl,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
