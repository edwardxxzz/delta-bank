import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';

interface DisplayTransaction {
  id: string;
  type: 'pix_received' | 'pix_sent' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
}

interface TransactionListProps {
  transactions: DisplayTransaction[];
  onViewAll: () => void;
}

const getIcon = (type: DisplayTransaction['type']): string => {
  switch (type) {
    case 'pix_received': return '↙️';
    case 'pix_sent': return '↗️';
    case 'deposit': return '📥';
    case 'withdraw': return '📤';
    default: return '⭕';
  }
};

const getIconBg = (type: DisplayTransaction['type']): string => {
  const positive = ['pix_received', 'deposit'];
  return positive.includes(type)
    ? 'rgba(0, 201, 167, 0.12)'
    : 'rgba(26, 35, 126, 0.08)';
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewAll,
}) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = ({ item }: { item: DisplayTransaction }) => {
    const isPositive = item.amount >= 0;

    return (
      <View style={styles.transactionItem}>
        <View style={[styles.iconCircle, { backgroundColor: getIconBg(item.type) }]}>
          <Text style={styles.iconEmoji}>{getIcon(item.type)}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isPositive ? Colors.positive : Colors.negative }]}>
            {isPositive ? '+' : '-'} {formatCurrency(Math.abs(item.amount))}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Últimas atividades</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: FontSizes.md,
    color: Colors.accent,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  iconEmoji: { fontSize: 20 },
  transactionInfo: { flex: 1 },
  transactionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.xxl,
  },
});
