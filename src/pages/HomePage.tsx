import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, getExtrato, formatBRL, PixTransaction } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export interface DisplayTransaction {
  id: string;
  type: 'pix_received' | 'pix_sent' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number; // R$ float, negativo = saída
  date: string;
}

interface HomePageProps {
  navigation?: any;
}

export const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [extratoError, setExtratoError] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!userData?.cpf) return;
    try {
      setExtratoError(false);
      const res = await getExtrato(userData.cpf);

      if (res.sucesso && res.dados) {
        // FIX: backend retorna { transacoes: [...], saldo_atual: number } dentro de "dados"
        // (antes o código fazia Array.isArray(res.dados) que sempre era false)
        const lista: PixTransaction[] = Array.isArray(res.dados)
          ? res.dados
          : (res.dados.transacoes ?? []);

        const mapped: DisplayTransaction[] = lista.map((t, idx) => {
          // FIX: backend retorna tipo como 'TRANSACAO_PIX' | 'DEPOSITO' | 'SAQUE'
          // Pix enviado/recebido é determinado pelo cpf_remetente vs cpf do usuário
          const isPixSent =
            t.tipo === 'TRANSACAO_PIX' && t.cpf_remetente === userData.cpf;
          const isPixReceived =
            t.tipo === 'TRANSACAO_PIX' && t.cpf_destinatario === userData.cpf;
          const isDeposit = t.tipo === 'DEPOSITO';

          const type: DisplayTransaction['type'] = isPixSent
            ? 'pix_sent'
            : isPixReceived
            ? 'pix_received'
            : isDeposit
            ? 'deposit'
            : 'withdraw';

          const amountBRL = centsToBRL(t.valor_centavos);

          return {
            id: String(t.id ?? idx + 1),
            type,
            title: isPixSent
              ? 'Pix enviado'
              : isPixReceived
              ? 'Pix recebido'
              : isDeposit
              ? 'Depósito'
              : 'Saque',
            subtitle: isPixSent
              ? t.nome_destinatario || 'Delta Bank'
              : isPixReceived
              ? t.nome_remetente || 'Delta Bank'
              : 'Delta Bank',
            // Saída: valor negativo; entrada: valor positivo
            amount: type === 'pix_sent' || type === 'withdraw' ? -amountBRL : amountBRL,
            date: new Date(t.data_hora).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });

        setTransactions(mapped);
      } else {
        setExtratoError(true);
      }
    } catch {
      setExtratoError(true);
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
    {
      label: 'Pix',
      icon: 'swap-horizontal-bold',
      iconSet: 'MaterialCommunityIcons' as const,
      bgColor: colors.pixBg,
      iconColor: colors.pixIcon,
      onPress: () => navigation?.navigate?.('Transferir'),
    },
    {
      label: 'Pagar',
      icon: 'qrcode-scan',
      iconSet: 'MaterialCommunityIcons' as const,
      bgColor: colors.pagarBg,
      iconColor: colors.pagarIcon,
      onPress: () => navigation?.navigate?.('Pagar'),
    },
    {
      label: 'Transferir',
      icon: 'arrow-up-right',
      iconSet: 'MaterialCommunityIcons' as const,
      bgColor: colors.transferirBg,
      iconColor: colors.transferirIcon,
      onPress: () => navigation?.navigate?.('Transferir'),
    },
    {
      label: 'Receber',
      icon: 'qrcode',
      iconSet: 'MaterialCommunityIcons' as const,
      bgColor: colors.emprestimoBg,
      iconColor: colors.emprestimoIcon,
      onPress: () => navigation?.navigate?.('Receber'),
    },
  ];

  const renderActionIcon = (action: (typeof quickActions)[0]) => {
    const size = 24;
    if (action.iconSet === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons name={action.icon as any} size={size} color={action.iconColor} />
      );
    }
    return <Ionicons name={action.icon as any} size={size} color={action.iconColor} />;
  };

  const getTransactionIcon = (type: DisplayTransaction['type']) => {
    switch (type) {
      case 'pix_received':
        return { name: 'arrow-down-left', color: colors.positive, bg: colors.pixBg };
      case 'pix_sent':
        return { name: 'arrow-up-right', color: colors.negative, bg: colors.sacarBg };
      case 'deposit':
        return { name: 'cash-plus', color: colors.depositarIcon, bg: colors.depositarBg };
      case 'withdraw':
        return { name: 'cash-minus', color: colors.sacarIcon, bg: colors.sacarBg };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>Olá {firstName}</Text>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surfaceLight }]}
            onPress={() => navigation?.navigate?.('Profile', { scrollToLogout: true })}
          >
            <Ionicons name="person" size={22} color={colors.primary} />
            <View style={[styles.onlineDot, { backgroundColor: colors.accent }]} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardTriangleDecor} />

          <View style={styles.cardLogoRow}>
            <View style={[styles.cardLogoTriangle, { borderBottomColor: colors.accent }]} />
            <Text style={styles.cardBankName}>DELTA BANK</Text>
          </View>

          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo em conta</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} hitSlop={8}>
              <Ionicons
                name={balanceVisible ? 'eye' : 'eye-off'}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceVisible ? `R$ ${formatBRL(balance)}` : 'R$ ••••••'}
          </Text>

          <View style={styles.monthlyRow}>
            <MaterialCommunityIcons name="autorenew" size={16} color={colors.accent} />
            <Text style={[styles.monthlyText, { color: colors.accent }]}>
              + R$ 320,40 este mês
            </Text>
            <TouchableOpacity hitSlop={8}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.statementButton}
            onPress={() => navigation?.navigate?.('Extrato')}
          >
            <Feather name="file-text" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statementText}>Ver extrato</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionItem}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                {renderActionIcon(action)}
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Últimas atividades
            </Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Extrato')}>
              <Text style={[styles.viewAllText, { color: colors.accent }]}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {extratoError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorBannerBg }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
              <Text style={[styles.errorBannerText, { color: colors.warning }]}>
                Extrato temporariamente indisponível
              </Text>
            </View>
          )}

          {transactions.length > 0
            ? transactions.slice(0, 5).map((tx) => {
                const iconCfg = getTransactionIcon(tx.type);
                const isPositive = tx.amount >= 0;
                return (
                  <View
                    key={tx.id}
                    style={[styles.transactionItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={[styles.txIconCircle, { backgroundColor: iconCfg.bg }]}>
                      <MaterialCommunityIcons
                        name={iconCfg.name as any}
                        size={20}
                        color={iconCfg.color}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={[styles.txTitle, { color: colors.textPrimary }]}>
                        {tx.title}
                      </Text>
                      <Text style={[styles.txSubtitle, { color: colors.textSecondary }]}>
                        {tx.subtitle}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: isPositive ? colors.positive : colors.negative },
                        ]}
                      >
                        {isPositive ? '+' : '-'} R$ {formatBRL(Math.abs(tx.amount))}
                      </Text>
                      <Text style={[styles.txDate, { color: colors.textMuted }]}>{tx.date}</Text>
                    </View>
                  </View>
                );
              })
            : !extratoError && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="bank-off-outline" size={44} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nenhuma atividade recente
                  </Text>
                </View>
              )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSizes.xxl, fontWeight: '700' },
  profileButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute', top: 2, right: 2,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  balanceCard: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl, paddingTop: Spacing.xl,
    marginHorizontal: Spacing.xxl, marginVertical: Spacing.lg, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardTriangleDecor: {
    position: 'absolute', top: -15, right: -15,
    width: 0, height: 0,
    borderLeftWidth: 50, borderLeftColor: 'transparent',
    borderRightWidth: 50, borderRightColor: 'transparent',
    borderBottomWidth: 80, borderBottomColor: '#10B981',
    opacity: 0.15,
  },
  cardLogoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  cardLogoTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderLeftColor: 'transparent',
    borderRightWidth: 8, borderRightColor: 'transparent',
    borderBottomWidth: 14,
  },
  cardBankName: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 },
  balanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: { color: '#FFFFFF', fontSize: FontSizes.md, opacity: 0.9 },
  balanceAmount: {
    color: '#FFFFFF', fontSize: FontSizes.balance, fontWeight: '700',
    marginBottom: Spacing.md, letterSpacing: -0.5,
  },
  monthlyRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  monthlyText: { fontSize: FontSizes.md, fontWeight: '500' },
  statementButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: BorderRadii.sm, alignSelf: 'flex-start',
  },
  statementText: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: '500' },
  quickActionsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  actionItem: { alignItems: 'center', gap: Spacing.sm },
  iconContainer: {
    width: 56, height: 56, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: FontSizes.sm, fontWeight: '500' },
  transactionsSection: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  viewAllText: { fontSize: FontSizes.md, fontWeight: '600' },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  txIconCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: 2 },
  txSubtitle: { fontSize: FontSizes.sm },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: FontSizes.md, fontWeight: '700', marginBottom: 2 },
  txDate: { fontSize: FontSizes.xs },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadii.md, padding: Spacing.md, marginBottom: Spacing.md,
  },
  errorBannerText: { fontSize: FontSizes.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyText: { fontSize: FontSizes.lg, marginTop: Spacing.lg },
});