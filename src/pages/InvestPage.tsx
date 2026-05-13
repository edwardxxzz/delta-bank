import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  yieldRate: number;
  yieldType: string;
  color: string;
  iconName: string;
  issuer: string;
  maturity: string;
}

const typeLabels: Record<string, string> = {
  cdb: 'CDB', lci: 'LCI', lca: 'LCA',
  tesouro: 'Tesouro', acoes: 'Ações', poupanca: 'Poupança',
};
const yieldLabels: Record<string, string> = { pre: 'Pré-fixado', pos: 'Pós-fixado', ipca: 'IPCA+' };

const mockInvestments: Investment[] = [
  { id: '1', name: 'CDB BlueBank 110% CDI', type: 'cdb', amount: 5234.67, yieldRate: 4.89, yieldType: 'pos', color: '#6366F1', iconName: 'bank', issuer: 'BlueBank', maturity: '30/04/2027' },
  { id: '2', name: 'Tesouro Selic 2029', type: 'tesouro', amount: 3276.77, yieldRate: 3.21, yieldType: 'pos', color: '#10B981', iconName: 'chart-bar', issuer: 'Tesouro Nacional', maturity: '01/03/2029' },
  { id: '3', name: 'Ações Magazine Luiza', type: 'acoes', amount: 2000.00, yieldRate: -2.15, yieldType: 'pos', color: '#F97316', iconName: 'chart-line-variant', issuer: 'B3', maturity: '' },
];

const totalInvested = mockInvestments.reduce((acc, inv) => acc + inv.amount, 0);
const totalYield = mockInvestments.reduce((acc, inv) => acc + (inv.amount * inv.yieldRate / 100), 0);
const totalPatrimony = totalInvested + totalYield;

interface InvestPageProps {
  navigation?: any;
}

export const InvestPage: React.FC<InvestPageProps> = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const filters = ['todos', 'renda_fixa', 'renda_variavel'];

  const filteredInvestments = mockInvestments.filter((inv) => {
    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'renda_fixa') return ['cdb', 'lci', 'lca', 'tesouro', 'poupanca'].includes(inv.type);
    return inv.type === 'acoes';
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investimentos</Text>
        <TouchableOpacity style={styles.investBtn}>
          <Feather name="plus" size={16} color={Colors.white} />
          <Text style={styles.investBtnText}>Investir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Patrimony Section */}
        <LinearGradient
          colors={[Colors.investBlue, Colors.cardBlueLight]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.patrimonyCard}
        >
          <Text style={styles.patrimonyLabel}>Patrimônio total</Text>
          <Text style={styles.patrimonyValue}>
            R$ {totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.yieldRow}>
            <Text style={styles.yieldValue}>
              +R$ {totalYield.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (+{(totalYield / totalInvested * 100).toFixed(2)}%)
            </Text>
            <Text style={styles.yieldLabel}> rendimento total</Text>
          </View>
          <View style={styles.patrimonySplit}>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>INVESTIDO</Text>
              <Text style={styles.splitValue}>
                R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <Text style={[styles.splitLabel, { color: Colors.accent }]}>RENDIMENTO</Text>
              <Text style={[styles.splitValue, { color: Colors.accent }]}>
                R$ {totalYield.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Cards */}
        <View style={styles.categoryRow}>
          <View style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <MaterialCommunityIcons name="bank" size={22} color={Colors.rendaFixa} />
            </View>
            <Text style={styles.categoryTitle}>Renda Fixa</Text>
            <Text style={styles.categorySub}>Segurança</Text>
          </View>
          <View style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
              <MaterialCommunityIcons name="chart-line-variant" size={22} color={Colors.acoes} />
            </View>
            <Text style={styles.categoryTitle}>Ações</Text>
            <Text style={styles.categorySub}>Crescimento</Text>
          </View>
          <View style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <MaterialCommunityIcons name="shield-check" size={22} color={Colors.tesouro} />
            </View>
            <Text style={styles.categoryTitle}>Tesouro</Text>
            <Text style={styles.categorySub}>Garantido</Text>
          </View>
        </View>

        {/* Minha Carteira */}
        <View style={styles.carteiraSection}>
          <Text style={styles.carteiraTitle}>MINHA CARTEIRA</Text>
          {filteredInvestments.map((item) => (
            <View key={item.id} style={styles.investmentItem}>
              <View style={[styles.investIcon, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.iconName as any} size={22} color={item.color} />
              </View>
              <View style={styles.investInfo}>
                <Text style={styles.investName}>{item.name}</Text>
                <Text style={styles.investType}>
                  {typeLabels[item.type] || item.type} · {item.issuer}
                </Text>
                {item.maturity ? (
                  <Text style={styles.investMaturity}>Vence: {item.maturity}</Text>
                ) : null}
              </View>
              <View style={styles.investRight}>
                <Text style={styles.investAmount}>
                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.investYield, { color: item.yieldRate >= 0 ? Colors.positive : Colors.negative }]}>
                  {item.yieldRate >= 0 ? '+' : ''}{item.yieldRate}%
                </Text>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  investBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.accent, borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  investBtnText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  // Scroll
  scrollContent: { paddingBottom: Spacing.xxxl },
  // Patrimony
  patrimonyCard: {
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.xl,
    padding: Spacing.xxl, marginBottom: Spacing.xl,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  patrimonyLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.xs },
  patrimonyValue: {
    fontSize: FontSizes.giant, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md,
  },
  yieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  yieldValue: { fontSize: FontSizes.lg, color: Colors.accent, fontWeight: '500' },
  yieldLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.6)' },
  patrimonySplit: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadii.md, padding: Spacing.lg,
  },
  splitItem: { flex: 1 },
  splitDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: Spacing.lg },
  splitLabel: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, marginBottom: Spacing.xs },
  splitValue: { fontSize: FontSizes.xxl, color: Colors.white, fontWeight: '600' },
  // Category Cards
  categoryRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xl, gap: Spacing.md,
  },
  categoryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    padding: Spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  categoryTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  categorySub: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  // Carteira
  carteiraSection: { paddingHorizontal: Spacing.xxl },
  carteiraTitle: {
    fontSize: FontSizes.md, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 0.5, marginBottom: Spacing.lg,
  },
  investmentItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  investIcon: {
    width: 44, height: 44, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  investInfo: { flex: 1 },
  investName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  investType: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  investMaturity: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  investRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  investAmount: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  investYield: { fontSize: FontSizes.sm, fontWeight: '600' },
  moreBtn: { padding: Spacing.xs },
});
