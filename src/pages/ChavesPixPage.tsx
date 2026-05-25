import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getChavesPix, registerChavePix, deleteChavePix, ChavePix } from '../services/apiService';
import { APP_VERSION } from '../utils';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ChavesPixPageProps {
  navigation?: any;
}

// FIX: casing exato conforme o backend Go aceita
// Backend suporta: 'CPF' | 'Email' | 'Telefone' | 'Aleatoria'
// (CNPJ foi removido - não é suportado pelo backend)
type KeyTypeOption = 'CPF' | 'Email' | 'Telefone' | 'Aleatoria';

const keyTypeOptions: {
  key: KeyTypeOption;
  label: string;
  placeholder: string;
  icon: string;
}[] = [
  {
    key: 'CPF',
    label: 'CPF',
    placeholder: 'Seu CPF será usado automaticamente',
    icon: 'card-account-details-outline',
  },
  {
    key: 'Email',
    label: 'E-mail',
    placeholder: 'seu@email.com',
    icon: 'email-outline',
  },
  {
    key: 'Telefone',
    label: 'Telefone',
    placeholder: '(11) 99999-9999',
    icon: 'phone-outline',
  },
  {
    key: 'Aleatoria',
    label: 'Aleatória',
    placeholder: 'Gerada automaticamente',
    icon: 'dice-multiple-outline',
  },
];

const keyTypeColors: Record<KeyTypeOption, string> = {
  CPF: '#00A878',
  Email: '#5C6BC0',
  Telefone: '#EF6C00',
  Aleatoria: '#7E57C2',
};

// Gera uma chave aleatória no formato UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ChavesPixPage: React.FC<ChavesPixPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedType, setSelectedType] = useState<KeyTypeOption>('Email');
  const [keyValue, setKeyValue] = useState('');
  const [registering, setRegistering] = useState(false);

  const loadChaves = useCallback(async () => {
    if (!userData?.cpf) return;
    try {
      const res = await getChavesPix(userData.cpf);
      setChaves(res.sucesso && res.dados ? res.dados : []);
    } catch {
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
      Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
      return;
    }

    let valor = keyValue.trim();

    // Resolve o valor conforme o tipo selecionado
    if (selectedType === 'CPF') {
      valor = userData.cpf;
    } else if (selectedType === 'Aleatoria') {
      // FIX: gera UUID v4 conforme padrão esperado pelo backend
      valor = generateUUID();
    } else if (!valor) {
      Alert.alert('Atenção', 'Preencha o valor da chave.');
      return;
    }

    // Verifica se já existe chave do mesmo tipo
    if (chaves.some((c) => c.tipo === selectedType)) {
      Alert.alert(
        'Chave duplicada',
        `Você já possui uma chave do tipo ${selectedType} cadastrada.`
      );
      return;
    }

    setRegistering(true);
    try {
      // FIX: 'tipo' agora tem casing correto ('CPF', 'Email', 'Telefone', 'Aleatoria')
      const res = await registerChavePix(userData.cpf, selectedType, valor);
      if (res.sucesso) {
        Alert.alert('Sucesso', 'Chave Pix cadastrada com sucesso!');
        setKeyValue('');
        setShowRegister(false);
        await loadChaves();
      } else {
        Alert.alert('Erro', res.mensagem || 'Falha ao cadastrar chave.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = (chave: ChavePix) => {
    Alert.alert(
      'Remover chave',
      `Deseja remover a chave ${chave.tipo}: ${getFormattedKey(chave)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try{
              const res = await deleteChavePix(userData!.cpf, chave.tipo, chave.valor);
              if (res.sucesso) {
                await loadChaves();
              } else {
                Alert.alert('Erro', res.mensagem || 'Falha ao remover chave.');
              }
            } catch {
              Alert.alert('Erro', 'Erro de conexão.');
            }
          },
        },
      ]
    );
  };

  const getFormattedKey = (chave: ChavePix): string => {
    if (chave.tipo === 'CPF') {
      return chave.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (chave.tipo === 'Telefone') {
      return chave.valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return chave.valor;
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
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
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Minhas Chaves Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
        {/* Info */}
        <View
          style={[
            styles.infoBanner,
            { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' },
          ]}
        >
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.accent} />
          <Text style={[styles.infoBannerText, { color: colors.accent }]}>
            Suas chaves Pix permitem que outras pessoas lhe enviem dinheiro facilmente. Limite: 5
            chaves por conta.
          </Text>
        </View>

        {/* Chaves cadastradas */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CHAVES CADASTRADAS</Text>

        {chaves.length > 0 ? (
          <View
            style={[
              styles.keysCard,
              { backgroundColor: colors.sectionCardBg, borderColor: colors.border },
            ]}
          >
            {chaves.map((chave, idx) => {
              const color =
                keyTypeColors[chave.tipo as KeyTypeOption] || colors.accent;
              const option = keyTypeOptions.find((k) => k.key === chave.tipo);
              return (
                <View key={chave.id ?? idx}>
                  <View style={styles.keyItem}>
                    <View style={[styles.keyIcon, { backgroundColor: color + '20' }]}>
                      <MaterialCommunityIcons
                        name={(option?.icon || 'key-variant') as any}
                        size={22}
                        color={color}
                      />
                    </View>
                    <View style={styles.keyInfo}>
                      <Text style={[styles.keyType, { color }]}>{chave.tipo}</Text>
                      <Text style={[styles.keyValue, { color: colors.textPrimary }]}>
                        {getFormattedKey(chave)}
                      </Text>
                      <Text style={[styles.keyDate, { color: colors.textMuted }]}>
                        Criada em {formatDate(chave.criada_em)}
                      </Text>
                    </View>
                    <View style={styles.keyActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() =>
                          Alert.alert('Chave copiada!', getFormattedKey(chave))
                        }
                        hitSlop={8}
                      >
                        <Feather name="copy" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(chave)}
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={18} color={colors.negative} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {idx < chaves.length - 1 && (
                    <View
                      style={[styles.keyDivider, { backgroundColor: colors.menuDivider }]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.sectionCardBg, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name="key-remove" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhuma chave cadastrada
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Cadastre sua primeira chave Pix para receber transferências.
            </Text>
          </View>
        )}

        {/* Formulário de cadastro */}
        {chaves.length < 5 && (
          <>
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
              <View
                style={[
                  styles.registerForm,
                  { backgroundColor: colors.sectionCardBg, borderColor: colors.border },
                ]}
              >
                <View style={styles.formHeader}>
                  <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                    Nova chave Pix
                  </Text>
                  <TouchableOpacity
                    onPress={() => { setShowRegister(false); setKeyValue(''); }}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  Tipo de chave
                </Text>
                <View style={styles.typeRow}>
                  {keyTypeOptions.map((kt) => (
                    <TouchableOpacity
                      key={kt.key}
                      style={[
                        styles.typeBtn,
                        { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                        selectedType === kt.key && {
                          backgroundColor: colors.accent,
                          borderColor: colors.accent,
                        },
                      ]}
                      onPress={() => { setSelectedType(kt.key); setKeyValue(''); }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          { color: colors.textSecondary },
                          selectedType === kt.key && styles.typeBtnTextActive,
                        ]}
                      >
                        {kt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input de valor (apenas Email e Telefone) */}
                {(selectedType === 'Email' || selectedType === 'Telefone') && (
                  <View style={{ marginTop: Spacing.lg }}>
                    <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                      {selectedType === 'Email' ? 'E-mail' : 'Telefone'}
                    </Text>
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
                        placeholder={
                          keyTypeOptions.find((k) => k.key === selectedType)?.placeholder || ''
                        }
                        placeholderTextColor={colors.textMuted}
                        value={keyValue}
                        onChangeText={setKeyValue}
                        autoCapitalize="none"
                        keyboardType={selectedType === 'Telefone' ? 'numeric' : 'email-address'}
                      />
                    </View>
                  </View>
                )}

                {selectedType === 'CPF' && (
                  <View
                    style={[styles.infoCard, { backgroundColor: colors.pixBg }]}
                  >
                    <MaterialCommunityIcons
                      name="card-account-details-outline"
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={[styles.infoCardText, { color: colors.accent }]}>
                      Seu CPF (***.***.***-{userData?.cpf?.slice(-2)}) será usado como chave Pix.
                    </Text>
                  </View>
                )}

                {selectedType === 'Aleatoria' && (
                  <View
                    style={[styles.infoCard, { backgroundColor: colors.transferirBg }]}
                  >
                    <MaterialCommunityIcons
                      name="dice-multiple-outline"
                      size={20}
                      color={colors.transferirIcon}
                    />
                    <Text style={[styles.infoCardText, { color: colors.transferirIcon }]}>
                      Uma chave UUID será gerada automaticamente.
                    </Text>
                  </View>
                )}

                {/* Aviso de chave duplicada */}
                {chaves.some((c) => c.tipo === selectedType) && (
                  <View style={[styles.warnCard, { backgroundColor: colors.sacarBg }]}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={colors.sacarIcon}
                    />
                    <Text style={[styles.warnText, { color: colors.sacarIcon }]}>
                      Você já possui uma chave do tipo {selectedType}.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: colors.accent },
                    (registering || chaves.some((c) => c.tipo === selectedType)) &&
                      styles.confirmBtnDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={registering || chaves.some((c) => c.tipo === selectedType)}
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
          </>
        )}

        {chaves.length >= 5 && (
          <View style={[styles.limitBanner, { backgroundColor: colors.sacarBg }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.sacarIcon} />
            <Text style={[styles.limitBannerText, { color: colors.sacarIcon }]}>
              Limite de 5 chaves atingido. Remova uma chave para cadastrar outra.
            </Text>
          </View>
        )}

        <Text style={[styles.version, { color: colors.textMuted }]}>{APP_VERSION}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  scrollContent: { paddingBottom: Spacing.xxxl },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl,
    padding: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  infoBannerText: { flex: 1, fontSize: FontSizes.md, lineHeight: 20 },
  sectionLabel: {
    fontSize: FontSizes.sm, fontWeight: '700', letterSpacing: 0.5,
    textTransform: 'uppercase', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md,
  },
  keysCard: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1,
  },
  keyItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
  },
  keyIcon: {
    width: 44, height: 44, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  keyInfo: { flex: 1 },
  keyType: { fontSize: FontSizes.sm, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  keyValue: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 2 },
  keyDate: { fontSize: FontSizes.xs },
  keyActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  keyDivider: { height: 1, marginLeft: Spacing.xxxl + 44 + Spacing.lg },
  emptyCard: {
    marginHorizontal: Spacing.xxl, alignItems: 'center',
    paddingVertical: Spacing.huge, borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  emptyTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginTop: Spacing.lg },
  emptySubtitle: {
    fontSize: FontSizes.md, textAlign: 'center',
    marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.xl,
  },
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
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.lg, borderRadius: BorderRadii.md, marginTop: Spacing.lg,
  },
  infoCardText: { flex: 1, fontSize: FontSizes.md, fontWeight: '500' },
  warnCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadii.md, marginTop: Spacing.lg,
  },
  warnText: { flex: 1, fontSize: FontSizes.sm, fontWeight: '500' },
  confirmBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.xl, elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  limitBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
  },
  limitBannerText: { flex: 1, fontSize: FontSizes.md },
  version: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
