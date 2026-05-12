import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, getExtrato, formatBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';

export interface DisplayTransaction {
  id: string;
  type: 'pix_received' | 'pix_sent' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
}

interface HomePageProps {
  navigation?: any;
}

export const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [extratoError, setExtratoError] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (userData?.cpf) {
      try {
        setExtratoError(false);
        const res = await getExtrato(userData.cpf);
        if (res.sucesso && res.dados && Array.isArray(res.dados)) {
          const mapped: DisplayTransaction[] = res.dados.map((t: any, idx: number) => ({
            id: String(idx + 1),
            type: t.tipo === 'pix_enviado' ? 'pix_sent' as const
              : t.tipo === 'pix_recebido' ? 'pix_received' as const
              : t.tipo === 'deposito' ? 'deposit' as const
              : 'withdraw' as const,
            title: t.tipo === 'pix_enviado' ? 'Pix enviado'
              : t.tipo === 'pix_recebido' ? 'Pix recebido'
              : t.tipo === 'deposito' ? 'Depósito'
              : 'Saque',
            subtitle: t.nome_destinatario || t.nome_remetente || 'Delta Bank',
            amount: t.tipo === 'pix_enviado' || t.tipo === 'saque'
              ? -centsToBRL(t.valor_centavos)
              : centsToBRL(t.valor_centavos),
            date: new Date(t.data_hora).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }),
          }));
          setTransactions(mapped);
        } else {
          setExtratoError(true);
        }
      } catch (e) {
        console.error('Erro ao carregar extrato:', e);
        setExtratoError(true);
      }
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.cpf) {
      loadTransactions();
    }
  }, [userData, loadTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    await loadTransactions();
    setRefreshing(false);
  };

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;
  const firstName = userData?.nome?.split(' ')[0] || 'Usuário';

  const quickActions = [
    { label: 'Pix', icon: 'swap-horizontal-bold', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.pixBg, iconColor: Colors.pixIcon, onPress: () => navigation?.navigate?.('Pix') },
    { label: 'Pagar', icon: 'barcode-scan', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.pagarBg, iconColor: Colors.pagarIcon, onPress: () => {} },
    { label: 'Depositar', icon: 'cash-plus', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.depositarBg, iconColor: Colors.depositarIcon, onPress: () => navigation?.navigate?.('Depositar') },
    { label: 'Sacar', icon: 'cash-minus', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.sacarBg, iconColor: Colors.sacarIcon, onPress: () => navigation?.navigate?.('Sacar') },
  ];

  const renderIcon = (action: typeof quickActions[0]) => {
    const size = 24;
    if (action.iconSet === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={action.icon as any} size={size} color={action.iconColor} />;
    }
    return <Ionicons name={action.icon as any} size={size} color={action.iconColor} />;
  };

  const getTransactionIcon = (type: DisplayTransaction['type']) => {
    switch (type) {
      case 'pix_received':
        return { name: 'arrow-down-left', color: Colors.positive, bg: Colors.pixBg };
      case 'pix_sent':
        return { name: 'arrow-up-right', color: Colors.negative, bg: 'rgba(255, 82, 82, 0.12)' };
      case 'deposit':
        return { name: 'cash-plus', color: Colors.depositarIcon, bg: Colors.depositarBg };
      case 'withdraw':
        return { name: 'cash-minus', color: Colors.sacarIcon, bg: Colors.sacarBg };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName}</Text>
            <Text style={styles.greetingSub}>Bem-vindo ao Delta Bank</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation?.navigate?.('Profile')}>
            <Ionicons name="person" size={22} color={Colors.accent} />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#0D1F3C', '#162240', '#0D1F3C']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} hitSlop={8}>
              <Ionicons name={balanceVisible ? 'eye' : 'eye-off'} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? `R$ ${formatBRL(balance)}` : 'R$ ••••••'}
          </Text>
          <View style={styles.balanceFooter}>
            <TouchableOpacity style={styles.statementBtn} onPress={() => navigation?.navigate?.('extrato')}>
              <Feather name="file-text" size={14} color={Colors.accent} />
              <Text style={styles.statementBtnText}>Ver extrato</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                {renderIcon(action)}
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades recentes</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('extrato')}>
              <Text style={styles.viewAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {extratoError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
              <Text style={styles.errorBannerText}>
                Extrato temporariamente indisponível no servidor
              </Text>
            </View>
          )}

          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((tx) => {
              const iconCfg = getTransactionIcon(tx.type);
              const isPositive = tx.amount >= 0;
              return (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={[styles.txIconCircle, { backgroundColor: iconCfg.bg }]}>
                    <MaterialCommunityIcons name={iconCfg.name as any} size={20} color={iconCfg.color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: isPositive ? Colors.positive : Colors.negative }]}>
                      {isPositive ? '+' : '-'} R$ {formatBRL(Math.abs(tx.amount))}
                    </Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                </View>
              );
            })
          ) : !extratoError ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bank-off-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
              <Text style={styles.emptySub}>Suas transações aparecerão aqui</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 100 },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.white },
  greetingSub: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 2 },
  profileButton: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, position: 'relative',
  },
  onlineDot: {
    position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface,
  },
  // Balance Card
  balanceCard: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl, paddingTop: Spacing.xl,
    marginHorizontal: Spacing.xxl, marginVertical: Spacing.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm,
  },
  balanceLabel: { color: Colors.textSecondary, fontSize: FontSizes.md },
  balanceAmount: {
    color: Colors.white, fontSize: FontSizes.balance, fontWeight: '700',
    marginBottom: Spacing.lg, letterSpacing: -0.5,
  },
  balanceFooter: { flexDirection: 'row', justifyContent: 'flex-start' },
  statementBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.08)', paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg, borderRadius: BorderRadii.md,
  },
  statementBtnText: { color: Colors.accent, fontSize: FontSizes.md, fontWeight: '600' },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  actionItem: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconContainer: {
    width: 54, height: 54, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  // Transactions
  transactionsSection: {
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  viewAllText: { fontSize: FontSizes.md, color: Colors.accent, fontWeight: '600' },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  txIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white, marginBottom: 2 },
  txSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: FontSizes.md, fontWeight: '700', marginBottom: 2 },
  txDate: { fontSize: FontSizes.xs, color: Colors.textMuted },
  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255, 215, 64, 0.08)', borderRadius: BorderRadii.md,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(255, 215, 64, 0.15)',
  },
  errorBannerText: { fontSize: FontSizes.sm, color: Colors.warning, flex: 1 },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyText: { fontSize: FontSizes.lg, color: Colors.textSecondary, marginTop: Spacing.lg },
  emptySub: { fontSize: FontSizes.md, color: Colors.textMuted, marginTop: Spacing.xs },
});
