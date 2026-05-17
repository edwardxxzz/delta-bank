import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const filters = ['todos', 'renda_fixa', 'renda_variavel'];

  const filteredInvestments = mockInvestments.filter((inv) => {
    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'renda_fixa') return ['cdb', 'lci', 'lca', 'tesouro', 'poupanca'].includes(inv.type);
    return inv.type === 'acoes';
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Investimentos</Text>
        <TouchableOpacity style={[styles.investBtn, { backgroundColor: colors.accent }]}>
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.investBtnText}>Investir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Patrimony Section */}
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.patrimonyCard}
        >
          <Text style={styles.patrimonyLabel}>Patrimônio total</Text>
          <Text style={styles.patrimonyValue}>
            R$ {totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.yieldRow}>
            <Text style={[styles.yieldValue, { color: colors.accent }]}>
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
              <Text style={[styles.splitLabel, { color: colors.accent }]}>RENDIMENTO</Text>
              <Text style={[styles.splitValue, { color: colors.accent }]}>
                R$ {totalYield.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Cards */}
        <View style={styles.categoryRow}>
          <View style={[styles.categoryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.categoryIcon, { backgroundColor: `${colors.rendaFixa}15` }]}>
              <MaterialCommunityIcons name="bank" size={22} color={colors.rendaFixa} />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>Renda Fixa</Text>
            <Text style={[styles.categorySub, { color: colors.textSecondary }]}>Segurança</Text>
          </View>
          <View style={[styles.categoryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.categoryIcon, { backgroundColor: `${colors.acoes}15` }]}>
              <MaterialCommunityIcons name="chart-line-variant" size={22} color={colors.acoes} />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>Ações</Text>
            <Text style={[styles.categorySub, { color: colors.textSecondary }]}>Crescimento</Text>
          </View>
          <View style={[styles.categoryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.categoryIcon, { backgroundColor: `${colors.tesouro}15` }]}>
              <MaterialCommunityIcons name="shield-check" size={22} color={colors.tesouro} />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>Tesouro</Text>
            <Text style={[styles.categorySub, { color: colors.textSecondary }]}>Garantido</Text>
          </View>
        </View>

        {/* Minha Carteira */}
        <View style={styles.carteiraSection}>
          <Text style={[styles.carteiraTitle, { color: colors.textSecondary }]}>MINHA CARTEIRA</Text>
          {filteredInvestments.map((item) => (
            <View key={item.id} style={[styles.investmentItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.investIcon, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.iconName as any} size={22} color={item.color} />
              </View>
              <View style={styles.investInfo}>
                <Text style={[styles.investName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.investType, { color: colors.textSecondary }]}>
                  {typeLabels[item.type] || item.type} · {item.issuer}
                </Text>
                {item.maturity ? (
                  <Text style={[styles.investMaturity, { color: colors.textMuted }]}>Vence: {item.maturity}</Text>
                ) : null}
              </View>
              <View style={styles.investRight}>
                <Text style={[styles.investAmount, { color: colors.textPrimary }]}>
                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.investYield, { color: item.yieldRate >= 0 ? colors.positive : colors.negative }]}>
                  {item.yieldRate >= 0 ? '+' : ''}{item.yieldRate}%
                </Text>
              </View>
              <TouchableOpacity style={styles.moreBtn}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  investBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  investBtnText: { color: '#FFFFFF', fontSize: FontSizes.md, fontWeight: '600' },
  scrollContent: { paddingBottom: Spacing.xxxl },
  patrimonyCard: {
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.xl,
    padding: Spacing.xxl, marginBottom: Spacing.xl,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  patrimonyLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.xs },
  patrimonyValue: {
    fontSize: FontSizes.giant, fontWeight: '700', color: '#FFFFFF', marginBottom: Spacing.md,
  },
  yieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  yieldValue: { fontSize: FontSizes.lg, fontWeight: '500' },
  yieldLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.6)' },
  patrimonySplit: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadii.md, padding: Spacing.lg,
  },
  splitItem: { flex: 1 },
  splitDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: Spacing.lg },
  splitLabel: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, marginBottom: Spacing.xs },
  splitValue: { fontSize: FontSizes.xxl, color: '#FFFFFF', fontWeight: '600' },
  categoryRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xl, gap: Spacing.md,
  },
  categoryCard: {
    flex: 1, borderRadius: BorderRadii.lg,
    padding: Spacing.lg, alignItems: 'center',
    borderWidth: 1,
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  categoryTitle: { fontSize: FontSizes.md, fontWeight: '600' },
  categorySub: { fontSize: FontSizes.sm },
  carteiraSection: { paddingHorizontal: Spacing.xxl },
  carteiraTitle: {
    fontSize: FontSizes.md, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: Spacing.lg,
  },
  investmentItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1,
  },
  investIcon: {
    width: 44, height: 44, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg,
  },
  investInfo: { flex: 1 },
  investName: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: 2 },
  investType: { fontSize: FontSizes.sm },
  investMaturity: { fontSize: FontSizes.sm, marginTop: 2 },
  investRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  investAmount: { fontSize: FontSizes.lg, fontWeight: '700', marginBottom: 2 },
  investYield: { fontSize: FontSizes.sm, fontWeight: '600' },
  moreBtn: { padding: Spacing.xs },
});
