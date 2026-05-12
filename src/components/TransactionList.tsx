import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const getIconConfig = (type: DisplayTransaction['type']) => {
  switch (type) {
    case 'pix_received':
      return { name: 'arrow-down-left' as const, set: 'MaterialCommunityIcons' as const, bg: Colors.pixBg, color: Colors.pixIcon };
    case 'pix_sent':
      return { name: 'arrow-up-right' as const, set: 'MaterialCommunityIcons' as const, bg: Colors.pagarBg, color: Colors.pagarIcon };
    case 'deposit':
      return { name: 'cash-plus' as const, set: 'MaterialCommunityIcons' as const, bg: '#FFF8E1', color: '#FF8F00' };
    case 'withdraw':
      return { name: 'cash-minus' as const, set: 'MaterialCommunityIcons' as const, bg: '#FFF3E0', color: '#E65100' };
    default:
      return { name: 'circle-outline' as const, set: 'MaterialCommunityIcons' as const, bg: Colors.background, color: Colors.textMuted };
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onViewAll }) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderItem = ({ item }: { item: DisplayTransaction }) => {
    const isPositive = item.amount >= 0;
    const iconConfig = getIconConfig(item.type);

    const renderIcon = () => {
      if (iconConfig.set === 'MaterialCommunityIcons') {
        return <MaterialCommunityIcons name={iconConfig.name as any} size={20} color={iconConfig.color} />;
      }
      return <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />;
    };

    return (
      <View style={styles.transactionItem}>
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
          {renderIcon()}
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
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade recente</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  viewAll: { fontSize: FontSizes.md, color: Colors.accent, fontWeight: '600' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  iconCircle: { width: 44, height: 44, borderRadius: BorderRadii.full, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  transactionSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: FontSizes.md, fontWeight: '700', marginBottom: 2 },
  transactionDate: { fontSize: FontSizes.xs, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.border, opacity: 0.5 },
  emptyText: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSizes.md, paddingVertical: Spacing.xxl },
});
