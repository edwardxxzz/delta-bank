import React, { useState, useCallback, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, RefreshControl, Text,
  TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
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
  rawDate: Date;
}

interface ExtratoPageProps {
  navigation?: any;
}

export const ExtratoPage: React.FC<ExtratoPageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'todos' | 'pix' | 'cartao' | 'transferencias'>('todos');
  const [searchText, setSearchText] = useState('');

  const loadTransactions = useCallback(async () => {
    if (userData?.cpf) {
      try {
        setError('');
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
              day: '2-digit', month: 'short',
            }),
            rawDate: new Date(t.data_hora),
          }));
          setTransactions(mapped);
        } else {
          setError(res.mensagem || 'Erro ao carregar extrato');
        }
      } catch (e) {
        setError('Erro de conexão ao buscar extrato');
      }
    }
    setLoading(false);
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
        return { name: 'arrow-down-left', color: Colors.positive, bg: Colors.pixBg };
      case 'pix_sent':
        return { name: 'arrow-up-right', color: Colors.negative, bg: Colors.sacarBg };
      case 'deposit':
        return { name: 'cash-plus', color: Colors.depositarIcon, bg: Colors.depositarBg };
      case 'withdraw':
        return { name: 'cash-minus', color: Colors.sacarIcon, bg: Colors.sacarBg };
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by type
    if (filter === 'pix') return tx.type === 'pix_sent' || tx.type === 'pix_received';
    if (filter === 'cartao') return tx.type === 'deposit';
    if (filter === 'transferencias') return tx.type === 'pix_sent' || tx.type === 'pix_received';
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

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pix', label: 'Pix' },
    { key: 'cartao', label: 'Cartão' },
    { key: 'transferencias', label: 'Transferências' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={onRefresh}>
          <Feather name="download" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transação..."
          placeholderTextColor={Colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Carregando extrato...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={56} color={Colors.warning} />
            <Text style={styles.errorTitle}>Extrato indisponível</Text>
            <Text style={styles.errorMessage}>
              {error.includes('ambiguous')
                ? 'O servidor está com um problema técnico na consulta de extrato. Nossa equipe já foi notificada.'
                : error
              }
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color={Colors.accent} />
              <Text style={styles.retryBtnText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : grouped.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        >
          {grouped.map((group, gIdx) => (
            <View key={gIdx} style={styles.monthGroup}>
              <Text style={styles.monthHeader}>{group.month}</Text>
              {group.items.map((tx) => {
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
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="bank-off-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma transação</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  downloadBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: Colors.border,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, height: 48,
  },
  searchIcon: { marginRight: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSizes.md, color: Colors.textPrimary },
  filtersRow: { flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg, maxHeight: 44 },
  filterBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadii.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white, fontWeight: '600' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.lg },
  errorCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadii.xl,
    padding: Spacing.xxxl, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, width: '100%',
  },
  errorTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  errorMessage: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.pixBg, borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginTop: Spacing.xxl,
  },
  retryBtnText: { color: Colors.accent, fontSize: FontSizes.lg, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  monthGroup: { marginBottom: Spacing.lg },
  monthHeader: {
    fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
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
  emptyTitle: { fontSize: FontSizes.xxl, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.lg },
});
