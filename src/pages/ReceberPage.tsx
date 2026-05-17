import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, formatBRL, getChavesPix, ChavePix } from '../services/apiService';

interface ReceberPageProps {
  navigation?: any;
}

export const ReceberPage: React.FC<ReceberPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-$4')
    : '---';

  const loadChaves = useCallback(async () => {
    if (!userData?.cpf) return;
    try {
      const res = await getChavesPix(userData.cpf);
      if (res.sucesso && res.dados) {
        setChaves(res.dados);
      } else {
        setChaves([]);
      }
    } catch {
      setChaves([]);
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

  const getFormattedKey = (chave: ChavePix) => {
    if (chave.tipo === 'CPF') {
      return chave.valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (chave.tipo === 'TELEFONE') {
      return chave.valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return chave.valor;
  };

  const handleCopyKey = (chave: ChavePix) => {
    Alert.alert('Chave copiada!', `${chave.tipo}: ${getFormattedKey(chave)}`);
  };

  const handleShareKey = (chave: ChavePix) => {
    Alert.alert('Compartilhar chave', `${chave.tipo}: ${getFormattedKey(chave)}\nDelta Bank - ${userData?.nome || ''}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Receber Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* QR Code Card */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => navigation?.navigate('QRCode')}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.pagarBg }]}>
            <MaterialCommunityIcons name="qrcode" size={32} color={colors.pagarIcon} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>QR Code</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Gere um código para receber</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* My Pix Keys */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SUAS CHAVES PIX</Text>

        {chaves.length > 0 ? (
          <View style={[styles.keysCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
            {chaves.map((chave, idx) => (
              <View key={chave.id || idx}>
                <View style={styles.keyItem}>
                  <View style={[styles.keyIcon, { backgroundColor: colors.pixBg }]}>
                    <MaterialCommunityIcons name="key-variant" size={22} color={colors.accent} />
                  </View>
                  <View style={styles.keyInfo}>
                    <Text style={[styles.keyType, { color: colors.accent }]}>{chave.tipo}</Text>
                    <Text style={[styles.keyValue, { color: colors.textPrimary }]}>{getFormattedKey(chave)}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtnSmall} onPress={() => handleCopyKey(chave)} hitSlop={8}>
                    <Feather name="copy" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {idx < chaves.length - 1 && <View style={[styles.keyDivider, { backgroundColor: colors.menuDivider }]} />}
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.noKeysCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}
            onPress={() => navigation?.navigate('ChavesPix')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="key-remove" size={28} color={colors.textMuted} />
            <Text style={[styles.noKeysTitle, { color: colors.textPrimary }]}>Nenhuma chave cadastrada</Text>
            <Text style={[styles.noKeysSub, { color: colors.accent }]}>Cadastrar chaves Pix</Text>
          </TouchableOpacity>
        )}

        {/* Manage Keys Button */}
        <TouchableOpacity
          style={[styles.manageBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => navigation?.navigate('ChavesPix')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog-outline" size={20} color={colors.accent} />
          <Text style={[styles.manageBtnText, { color: colors.accent }]}>Gerenciar chaves Pix</Text>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Dados Bancários Card */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => {
            Alert.alert('Dados bancários', 'Agência: 0001\nConta: 88028-5\nBanco: Delta Bank (000)');
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.pixBg }]}>
            <Ionicons name="business-outline" size={32} color={colors.accent} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Dados bancários</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Copie agência e conta</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: 4 },
  optionSub: { fontSize: FontSizes.md },
  sectionLabel: {
    fontSize: FontSizes.sm, fontWeight: '700',
    letterSpacing: 0.5, textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  keysCard: {
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
  keyValue: { fontSize: FontSizes.lg, fontWeight: '600' },
  copyBtnSmall: { padding: Spacing.sm },
  keyDivider: { height: 1, marginLeft: Spacing.xxxl + 44 + Spacing.lg },
  noKeysCard: {
    alignItems: 'center', paddingVertical: Spacing.xl,
    borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  noKeysTitle: { fontSize: FontSizes.lg, fontWeight: '600', marginTop: Spacing.sm },
  noKeysSub: { fontSize: FontSizes.md, fontWeight: '600', marginTop: Spacing.xs },
  manageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  manageBtnText: { flex: 1, fontSize: FontSizes.md, fontWeight: '600' },
});
