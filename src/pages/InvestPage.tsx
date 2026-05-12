import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  yieldRate: number;
  yieldType: string;
  color: string;
  iconName: string;
}

const typeLabels: Record<string, string> = {
  cdb: 'CDB', lci: 'LCI', lca: 'LCA',
  tesouro: 'Tesouro Direto', fii: 'FII', acoes: 'Ações', poupanca: 'Poupança',
};
const yieldLabels: Record<string, string> = { pre: 'Pré-fixado', pos: 'Pós-fixado', ipca: 'IPCA+' };

const investIcons: Record<string, string> = {
  cdb: 'bank',
  tesouro: 'chart-bar',
  fii: 'grid',
  poupanca: 'piggy-bank',
};

export const InvestPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const filters = ['todos', 'renda_fixa', 'renda_variavel'];

  const mockInvestments: Investment[] = [
    { id: '1', name: 'CDB Banco Inter', type: 'cdb', amount: 5000, yieldRate: 12.5, yieldType: 'pre', color: '#1A237E', iconName: 'bank' },
    { id: '2', name: 'Tesouro IPCA+ 2029', type: 'tesouro', amount: 10000, yieldRate: 6.2, yieldType: 'ipca', color: '#00C9A7', iconName: 'chart-bar' },
    { id: '3', name: 'MXRF11', type: 'fii', amount: 3200, yieldRate: 8.4, yieldType: 'pos', color: '#FF6B35', iconName: 'grid' },
    { id: '4', name: 'Poupança', type: 'poupanca', amount: 1500, yieldRate: 7.1, yieldType: 'pos', color: '#3949AB', iconName: 'piggy-bank' },
  ];

  const totalInvested = mockInvestments.reduce((acc, inv) => acc + inv.amount, 0);

  const renderInvestIcon = (iconName: string, color: string) => {
    return <MaterialCommunityIcons name={iconName as any} size={22} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investimentos</Text>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total investido</Text>
        <Text style={styles.summaryValue}>
          R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="chart-line" size={16} color={Colors.accent} />
          <Text style={styles.summaryChange}>+ 8.2% rendimento médio</Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterBtn, selectedFilter === filter && styles.filterBtnActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
              {filter === 'todos' ? 'Todos' : filter === 'renda_fixa' ? 'Renda Fixa' : 'Renda Variável'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {mockInvestments.map((item) => (
          <TouchableOpacity key={item.id} style={styles.investmentItem}>
            <View style={[styles.investIcon, { backgroundColor: item.color }]}>
              {renderInvestIcon(item.iconName, item.color)}
            </View>
            <View style={styles.investInfo}>
              <Text style={styles.investName}>{item.name}</Text>
              <Text style={styles.investType}>
                {typeLabels[item.type] || item.type} · {yieldLabels[item.yieldType] || item.yieldType}
              </Text>
            </View>
            <View style={styles.investRight}>
              <Text style={styles.investAmount}>
                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.investYield}>{item.yieldRate}% a.a.</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.textPrimary },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 201, 167, 0.1)', justifyContent: 'center', alignItems: 'center' },
  summaryCard: { backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.xl, padding: Spacing.xxl, marginBottom: Spacing.lg, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  summaryLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
  summaryValue: { fontSize: FontSizes.giant, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryChange: { fontSize: FontSizes.md, color: Colors.accent, fontWeight: '500' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg, gap: Spacing.sm },
  filterBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadii.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl },
  investmentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadii.lg, padding: Spacing.lg, marginBottom: Spacing.md, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  investIcon: { width: 44, height: 44, borderRadius: BorderRadii.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  investInfo: { flex: 1 },
  investName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  investType: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  investRight: { alignItems: 'flex-end' },
  investAmount: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  investYield: { fontSize: FontSizes.sm, color: Colors.accent, fontWeight: '500' },
});
