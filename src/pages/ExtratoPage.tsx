import React, { useState, useCallback, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, RefreshControl, Text,
  TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, getExtrato, formatBRL, PixTransaction } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export interface DisplayTransaction {
  id: string;
  type: 'pix_received' | 'pix_sent' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  rawDate: Date;
}

type FilterKey = 'todos' | 'pix' | 'deposito' | 'saque';

interface ExtratoPageProps {
  navigation?: any;
}

export const ExtratoPage: React.FC<ExtratoPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData, refreshUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [searchText, setSearchText] = useState('');

  // Same parsing logic as HomePage — handles backend format correctly
  const loadTransactions = useCallback(async () => {
    if (!userData?.cpf) return;
    try {
      setError('');
      const res = await getExtrato(userData.cpf);

      if (res.sucesso && res.dados) {
        // Backend returns { transacoes: [...], saldo_atual: number } inside "dados"
        const lista: PixTransaction[] = Array.isArray(res.dados)
          ? res.dados
          : (res.dados.transacoes ?? []);

        const mapped: DisplayTransaction[] = lista.map((t, idx) => {
          // Backend returns tipo as 'TRANSACAO_PIX' | 'DEPOSITO' | 'SAQUE'
          // Pix sent/received is determined by cpf_remetente vs user's cpf
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
            amount: type === 'pix_sent' || type === 'withdraw' ? -amountBRL : amountBRL,
            date: new Date(t.data_hora).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            rawDate: new Date(t.data_hora),
          };
        });

        setTransactions(mapped);
      } else {
        setError(res.mensagem || 'Erro ao carregar extrato');
      }
    } catch (e) {
      setError('Erro de conexão ao buscar extrato');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    await loadTransactions();
    setRefreshing(false);
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

  // Filter transactions by type and search text
  const filteredTransactions = transactions.filter((tx) => {
    // Filter by type
    if (filter === 'pix') return tx.type === 'pix_sent' || tx.type === 'pix_received';
    if (filter === 'deposito') return tx.type === 'deposit';
    if (filter === 'saque') return tx.type === 'withdraw';
    return true;
  }).filter((tx) => {
    // Filter by search text
    if (!searchText) return true;
    const lower = searchText.toLowerCase();
    return tx.title.toLowerCase().includes(lower) || tx.subtitle.toLowerCase().includes(lower);
  });

  // Group by month
  const groupByMonth = (txs: DisplayTransaction[]) => {
    const groups: { month: string; items: DisplayTransaction[] }[] = [];
    const monthMap = new Map<string, DisplayTransaction[]>();
    txs.forEach((tx) => {
      const monthKey = tx.rawDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalized = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
      if (!monthMap.has(capitalized)) monthMap.set(capitalized, []);
      monthMap.get(capitalized)!.push(tx);
    });
    monthMap.forEach((items, month) => groups.push({ month, items }));
    return groups;
  };

  const grouped = groupByMonth(filteredTransactions);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pix', label: 'Pix' },
    { key: 'deposito', label: 'Depósito' },
    { key: 'saque', label: 'Saque' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Extrato</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={onRefresh}>
          <Feather name="download" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Balance Summary */}
      <View style={[styles.balanceSummary, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Saldo atual</Text>
        <Text style={[styles.balanceValue, { color: colors.textPrimary }]}>R$ {formatBRL(balance)}</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar transação..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              filter === f.key && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active filter info */}
      {(filter !== 'todos' || searchText) && (
        <View style={styles.activeFilterRow}>
          <Text style={[styles.activeFilterText, { color: colors.textMuted }]}>
            {filteredTransactions.length} resultado{filteredTransactions.length !== 1 ? 's' : ''}
            {filter !== 'todos' && ` • ${filters.find(f => f.key === filter)?.label}`}
            {searchText && ` • "${searchText}"`}
          </Text>
          <TouchableOpacity onPress={() => { setFilter('todos'); setSearchText(''); }}>
            <Text style={[styles.clearFilterText, { color: colors.accent }]}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando extrato...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <View style={[styles.errorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={56} color={colors.warning} />
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Extrato indisponível</Text>
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              {error.includes('ambiguous')
                ? 'O servidor está com um problema técnico na consulta de extrato. Nossa equipe já foi notificada.'
                : error
              }
            </Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.pixBg }]} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color={colors.accent} />
              <Text style={[styles.retryBtnText, { color: colors.accent }]}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : grouped.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {grouped.map((group, gIdx) => (
            <View key={gIdx} style={styles.monthGroup}>
              <Text style={[styles.monthHeader, { color: colors.textSecondary }]}>{group.month}</Text>
              {group.items.map((tx) => {
                const iconCfg = getTransactionIcon(tx.type);
                const isPositive = tx.amount >= 0;
                return (
                  <View key={tx.id} style={[styles.transactionItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <View style={[styles.txIconCircle, { backgroundColor: iconCfg.bg }]}>
                      <MaterialCommunityIcons name={iconCfg.name as any} size={20} color={iconCfg.color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{tx.title}</Text>
                      <Text style={[styles.txSubtitle, { color: colors.textSecondary }]}>{tx.subtitle}</Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: isPositive ? colors.positive : colors.negative }]}>
                        {isPositive ? '+' : '-'} R$ {formatBRL(Math.abs(tx.amount))}
                      </Text>
                      <Text style={[styles.txDate, { color: colors.textMuted }]}>{tx.date}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="bank-off-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Nenhuma transação</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {filter !== 'todos' || searchText
              ? 'Nenhum resultado encontrado. Tente outros filtros.'
              : 'Suas transações aparecerão aqui.'
            }
          </Text>
        </View>
      )}
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
  downloadBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  balanceSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadii.lg, borderWidth: 1,
  },
  balanceLabel: { fontSize: FontSizes.md },
  balanceValue: { fontSize: FontSizes.xxl, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, height: 48,
  },
  searchIcon: { marginRight: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSizes.md },
  filtersRow: { flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md, maxHeight: 44 },
  filterBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadii.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  filterText: { fontSize: FontSizes.sm, fontWeight: '500' },
  activeFilterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm,
  },
  activeFilterText: { fontSize: FontSizes.sm },
  clearFilterText: { fontSize: FontSizes.sm, fontWeight: '600' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  loadingText: { marginTop: Spacing.lg },
  errorCard: {
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxxl, alignItems: 'center', borderWidth: 1, width: '100%',
  },
  errorTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  errorMessage: { fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl,
  },
  retryBtnText: { fontSize: FontSizes.lg, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  monthGroup: { marginBottom: Spacing.lg },
  monthHeader: {
    fontSize: FontSizes.md, fontWeight: '600',
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginBottom: Spacing.sm,
    borderWidth: 1,
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
  emptyTitle: { fontSize: FontSizes.xxl, fontWeight: '600', marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.xl },
});
