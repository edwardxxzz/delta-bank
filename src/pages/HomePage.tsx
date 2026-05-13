import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
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
    { label: 'Pix', icon: 'swap-horizontal-bold', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.pixBg, iconColor: Colors.pixIcon, onPress: () => navigation?.navigate?.('Transferir') },
    { label: 'Pagar', icon: 'qrcode-scan', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.pagarBg, iconColor: Colors.pagarIcon, onPress: () => navigation?.navigate?.('Pagar') },
    { label: 'Transferir', icon: 'arrow-up-right', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.transferirBg, iconColor: Colors.transferirIcon, onPress: () => navigation?.navigate?.('Transferir') },
    { label: 'Receber', icon: 'qrcode', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.emprestimoBg, iconColor: Colors.emprestimoIcon, onPress: () => navigation?.navigate?.('Receber') },
  ];

  const renderActionIcon = (action: typeof quickActions[0]) => {
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
        return { name: 'arrow-up-right', color: Colors.negative, bg: Colors.sacarBg };
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
          <View style={styles.headerLeft}>
            <View style={styles.logoTriangle} />
            <Text style={styles.logoText}>DELTA BANK</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation?.navigate?.('Profile')}>
            <Ionicons name="person" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[Colors.cardGradientStart, Colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          {/* Triangle decoration */}
          <View style={styles.cardTriangleDecor} />

          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo em conta</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} hitSlop={8}>
              <Ionicons name={balanceVisible ? 'eye' : 'eye-off'} size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? `R$ ${formatBRL(balance)}` : 'R$ ••••••'}
          </Text>
          <View style={styles.monthlyRow}>
            <MaterialCommunityIcons name="autorenew" size={16} color={Colors.accent} />
            <Text style={styles.monthlyText}>+ R$ 320,40 este mês</Text>
          </View>
          <TouchableOpacity style={styles.statementButton} onPress={() => navigation?.navigate?.('Extrato')}>
            <Feather name="file-text" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statementText}>Ver extrato</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
              <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                {renderActionIcon(action)}
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas atividades</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Extrato')}>
              <Text style={styles.viewAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {extratoError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
              <Text style={styles.errorBannerText}>Extrato temporariamente indisponível</Text>
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
              <MaterialCommunityIcons name="bank-off-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderLeftColor: 'transparent',
    borderRightWidth: 10, borderRightColor: 'transparent',
    borderBottomWidth: 16, borderBottomColor: Colors.accent,
  },
  logoText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.5 },
  profileButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
  },
  // Balance Card
  balanceCard: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl, paddingTop: Spacing.xl,
    marginHorizontal: Spacing.xxl, marginVertical: Spacing.lg, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardTriangleDecor: {
    position: 'absolute', top: -15, left: -15,
    width: 0, height: 0,
    borderLeftWidth: 50, borderLeftColor: 'transparent',
    borderRightWidth: 50, borderRightColor: 'transparent',
    borderBottomWidth: 80, borderBottomColor: Colors.accent,
    opacity: 0.15,
  },
  balanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm,
  },
  balanceLabel: { color: Colors.textWhite, fontSize: FontSizes.md, opacity: 0.9 },
  balanceAmount: {
    color: Colors.textWhite, fontSize: FontSizes.balance, fontWeight: '700',
    marginBottom: Spacing.md, letterSpacing: -0.5,
  },
  monthlyRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  monthlyText: { color: Colors.accent, fontSize: FontSizes.md, fontWeight: '500' },
  statementButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg, borderRadius: BorderRadii.md,
  },
  statementText: { color: Colors.textWhite, fontSize: FontSizes.md, fontWeight: '500' },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  actionItem: { alignItems: 'center', gap: Spacing.sm },
  iconContainer: {
    width: 56, height: 56, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  // Transactions
  transactionsSection: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  viewAllText: { fontSize: FontSizes.md, color: Colors.accent, fontWeight: '600' },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  txIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  txSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: FontSizes.md, fontWeight: '700', marginBottom: 2 },
  txDate: { fontSize: FontSizes.xs, color: Colors.textMuted },
  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#FFF7ED', borderRadius: BorderRadii.md,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  errorBannerText: { fontSize: FontSizes.sm, color: Colors.warning },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyText: { fontSize: FontSizes.lg, color: Colors.textSecondary, marginTop: Spacing.lg },
});
